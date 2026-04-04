import type { SanityClient } from "@sanity/client";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

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

export async function uploadListingImageFromFormData(
  client: SanityClient,
  formData: FormData,
  altText: string
): Promise<{
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  alt?: string;
}> {
  const entry = formData.get("listingImage");
  if (!entry || typeof entry === "string") {
    throw new Error("Missing listing image file.");
  }

  const blob = entry as Blob;
  if (blob.size === 0) throw new Error("Empty image file.");

  const originalName =
    "name" in entry && typeof entry.name === "string"
      ? entry.name
      : "cover.jpg";
  const mime = blob.type || "application/octet-stream";

  if (!isAllowedListingImage(originalName, mime)) {
    throw new Error(
      "Thumbnail must be .png, .jpg, or .webp (square 1:1 recommended)."
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

/** Returns null when no image field is present (optional thumbnail on PDF upload). */
export async function optionalUploadListingImageFromFormData(
  client: SanityClient,
  formData: FormData,
  altText: string
): Promise<{
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  alt?: string;
} | null> {
  const entry = formData.get("listingImage");
  if (!entry || typeof entry === "string") return null;
  return uploadListingImageFromFormData(client, formData, altText);
}
