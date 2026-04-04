import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";
import { getSanityWriteClient } from "@/lib/sanity/client";
import { uploadListingImageFromFormData } from "@/lib/sanity/uploadListingImageFromForm";

export const runtime = "nodejs";
export const maxDuration = 60;

const VERCEL_BODY_LIMIT_BYTES = Math.floor(4.5 * 1024 * 1024);

function isAdminEmail(email: string, adminEmailsRaw: string | undefined) {
  if (!adminEmailsRaw) return false;
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
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

  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const n = parseInt(contentLength, 10);
    if (!Number.isNaN(n) && n > VERCEL_BODY_LIMIT_BYTES) {
      return NextResponse.json(
        {
          error:
            "Upload is too large for this host (~4.5 MB per request on Vercel). Use a smaller image.",
        },
        { status: 413 }
      );
    }
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
      {
        error:
          "Could not read the upload. The request may be too large for the host (~4.5 MB on Vercel).",
      },
      { status: 400 }
    );
  }

  const productSlug = String(formData.get("productSlug") ?? "").trim();
  if (!productSlug) {
    return NextResponse.json({ error: "Select a product." }, { status: 400 });
  }

  let listingImageField: Awaited<
    ReturnType<typeof uploadListingImageFromFormData>
  >;
  try {
    listingImageField = await uploadListingImageFromFormData(
      client,
      formData,
      String(formData.get("listingImageAlt") ?? "")
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Thumbnail upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const doc = await client.fetch<{ _id: string } | null>(
    `*[_type == "product" && slug.current == $slug][0]{ _id }`,
    { slug: productSlug }
  );
  if (!doc?._id) {
    return NextResponse.json({ error: "Product not found in Sanity." }, { status: 404 });
  }

  try {
    await client.patch(doc._id).set({ listingImage: listingImageField }).commit();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sanity mutation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${productSlug}`);

  return NextResponse.json({ ok: true, slug: productSlug });
}
