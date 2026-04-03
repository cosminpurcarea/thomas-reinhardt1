import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";
import { getSanityWriteClient } from "@/lib/sanity/client";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 40 * 1024 * 1024;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

function isAdminEmail(email: string, adminEmailsRaw: string | undefined) {
  if (!adminEmailsRaw) return false;
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomKey() {
  return randomBytes(8).toString("hex");
}

/** Stable per-file row id shown in admin and stored in Sanity. */
function newDownloadId() {
  return `dl-${randomBytes(8).toString("hex")}`;
}

function isAllowedUpload(name: string, mime: string) {
  const lower = name.toLowerCase();
  const extOk = lower.endsWith(".pdf") || lower.endsWith(".zip");
  if (!extOk) return false;
  const mimeOk =
    mime === "application/pdf" ||
    mime === "application/zip" ||
    mime === "application/x-zip-compressed" ||
    mime === "application/octet-stream" ||
    mime === "";
  return mimeOk;
}

function isAllowedListingImage(name: string, mime: string) {
  const lower = name.toLowerCase();
  const extOk =
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp");
  if (!extOk) return false;
  const ok =
    mime === "image/png" ||
    mime === "image/jpeg" ||
    mime === "image/webp" ||
    mime === "";
  return ok;
}

async function uploadListingImageFromForm(
  client: NonNullable<ReturnType<typeof getSanityWriteClient>>,
  formData: FormData,
  altText: string
): Promise<{
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  alt?: string;
} | null> {
  const entry = formData.get("listingImage");
  if (!entry || typeof entry === "string") return null;

  const blob = entry as Blob;
  if (blob.size === 0) return null;

  const originalName =
    "name" in entry && typeof entry.name === "string"
      ? entry.name
      : "cover.jpg";
  const mime = blob.type || "application/octet-stream";

  if (!isAllowedListingImage(originalName, mime)) {
    throw new Error(
      "Homepage thumbnail must be .png, .jpg, or .webp (square 1:1 recommended)."
    );
  }

  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Thumbnail too large (max ${Math.floor(MAX_IMAGE_BYTES / (1024 * 1024))} MB).`
    );
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const safeName = originalName.replace(/[^\w.\-() ]+/g, "_");

  const asset = await client.assets.upload("image", buffer, {
    filename: safeName,
    contentType: mime || undefined,
  });

  const alt = altText.trim();
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id,
    },
    ...(alt ? { alt } : {}),
  };
}

export async function POST(req: NextRequest) {
  if (!isClerkConfigured()) {
    return NextResponse.json(
      { error: "Clerk not configured." },
      { status: 503 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS;
  if (!adminEmailsRaw) {
    return NextResponse.json({ error: "Admin not configured." }, { status: 403 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email =
    (user.primaryEmailAddress?.emailAddress as string | undefined) ??
    ((user as { emailAddresses?: { emailAddress?: string }[] }).emailAddresses?.[0]
      ?.emailAddress as string | undefined);

  if (!email || !isAdminEmail(email, adminEmailsRaw)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json(
      {
        error:
          "Sanity write access not configured. Set SANITY_API_TOKEN (Editor) and valid NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local.",
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body." },
      { status: 400 }
    );
  }

  const intent = String(formData.get("intent") ?? "");
  const fileEntry = formData.get("file");

  if (!fileEntry || typeof fileEntry === "string") {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const blob = fileEntry as Blob;
  const originalName =
    "name" in fileEntry && typeof fileEntry.name === "string"
      ? fileEntry.name
      : "download.bin";
  const mime = blob.type || "application/octet-stream";

  if (!isAllowedUpload(originalName, mime)) {
    return NextResponse.json(
      {
        error:
          "Only .pdf or .zip uploads are allowed (matching your Sanity product schema).",
      },
      { status: 400 }
    );
  }

  if (blob.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${Math.floor(MAX_BYTES / (1024 * 1024))} MB).` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await blob.arrayBuffer());

  let listingImageField: Awaited<
    ReturnType<typeof uploadListingImageFromForm>
  > | null = null;
  try {
    listingImageField = await uploadListingImageFromForm(
      client,
      formData,
      String(formData.get("listingImageAlt") ?? "")
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Thumbnail upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let asset;
  try {
    asset = await client.assets.upload("file", buffer, {
      filename: originalName.replace(/[^\w.\-() ]+/g, "_"),
      contentType: mime || undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const fileField = {
    _type: "file" as const,
    asset: {
      _type: "reference" as const,
      _ref: asset._id,
    },
  };

  try {
    if (intent === "create") {
      const title = String(formData.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
      }

      let slug = String(formData.get("slug") ?? "").trim();
      if (!slug) slug = slugify(title);
      else slug = slugify(slug);
      if (!slug) {
        return NextResponse.json(
          { error: "Could not derive a URL slug from the title." },
          { status: 400 }
        );
      }

      const existing = await client.fetch<string | null>(
        `*[_type == "product" && slug.current == $slug][0]._id`,
        { slug }
      );
      if (existing) {
        return NextResponse.json(
          { error: `A product with slug "${slug}" already exists. Change the slug or use “Replace file” instead.` },
          { status: 409 }
        );
      }

      const description = String(formData.get("description") ?? "").trim();
      const newsletterRequired =
        String(formData.get("newsletterRequired") ?? "false") === "true";

      const downloadTitle =
        String(formData.get("downloadTitle") ?? "").trim() || title;

      const documentId = `product-${slug}`;
      const downloadId = newDownloadId();

      await client.create({
        _id: documentId,
        _type: "product",
        title,
        slug: { _type: "slug", current: slug },
        description: description || undefined,
        priceType: "free",
        newsletterRequired,
        published: true,
        ...(listingImageField ? { listingImage: listingImageField } : {}),
        downloads: [
          {
            _key: randomKey(),
            _type: "downloadItem",
            downloadId,
            title: downloadTitle,
            filename: originalName,
            file: fileField,
          },
        ],
      });

      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath(`/products/${slug}`);

      return NextResponse.json({
        ok: true,
        intent: "create",
        slug,
        title,
        documentId,
        downloadId,
        assetId: asset._id,
      });
    }

    if (intent === "replace") {
      const productSlug = String(formData.get("productSlug") ?? "").trim();
      if (!productSlug) {
        return NextResponse.json(
          { error: "Select an existing product." },
          { status: 400 }
        );
      }

      const doc = await client.fetch<{ _id: string } | null>(
        `*[_type == "product" && slug.current == $slug][0]{ _id }`,
        { slug: productSlug }
      );
      if (!doc?._id) {
        return NextResponse.json({ error: "Product not found in Sanity." }, { status: 404 });
      }

      const downloadTitle =
        String(formData.get("downloadTitle") ?? "").trim() || originalName;
      const downloadId = newDownloadId();

      await client
        .patch(doc._id)
        .set({
          downloads: [
            {
              _key: randomKey(),
              _type: "downloadItem",
              downloadId,
              title: downloadTitle,
              filename: originalName,
              file: fileField,
            },
          ],
          ...(listingImageField ? { listingImage: listingImageField } : {}),
        })
        .commit();

      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath(`/products/${productSlug}`);

      return NextResponse.json({
        ok: true,
        intent: "replace",
        slug: productSlug,
        documentId: doc._id,
        downloadId,
        assetId: asset._id,
      });
    }

    return NextResponse.json(
      { error: 'Invalid intent. Use "create" or "replace".' },
      { status: 400 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sanity mutation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
