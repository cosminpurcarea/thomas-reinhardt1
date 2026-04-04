import { getSanityClient } from "./client";

export type SanityDownloadItem = {
  downloadId: string;
  title: string;
  filename: string;
  /** Times this file was served via the gated download route. */
  downloadCount?: number;
  fileUrl?: string | null;
  /** Sanity file asset document _ref (e.g. file-abc123...) */
  assetId?: string | null;
};

export type SanityProduct = {
  /** Sanity document _id */
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  /** When false, hidden from public catalogue (admin still lists it). */
  published?: boolean;
  title: string;
  slug: string;
  description?: string;
  priceType?: "free" | "paid";
  newsletterRequired?: boolean;
  /** CDN URL for homepage spotlight (if set in CMS). */
  listingImageUrl?: string | null;
  downloads?: SanityDownloadItem[];
};

/** Latest published product by last update (thumbnail optional). */
export type LatestListingSpotlight = {
  title: string;
  slug: string;
  description?: string | null;
  imageUrl: string | null;
  alt: string;
  updatedAt: string;
};

const productFields = `
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  priceType,
  newsletterRequired,
  "published": coalesce(published, true),
  "listingImageUrl": listingImage.asset->url,
  downloads[]{
    downloadId,
    title,
    filename,
    "downloadCount": coalesce(downloadCount, 0),
    "fileUrl": file.asset->url,
    "assetId": file.asset._ref
  }
`;

/** Public catalogue: only products marked published (default true if field missing). */
export async function getProducts(): Promise<SanityProduct[]> {
  const client = getSanityClient();
  if (!client) return [];

  const query = `*[_type == "product" && (!defined(published) || published == true)]|order(_updatedAt desc){
    ${productFields}
  }`;

  try {
    return await client.fetch(query);
  } catch {
    return [];
  }
}

/** Admin: all products including unpublished. */
export async function getAllProductsForAdmin(): Promise<SanityProduct[]> {
  const client = getSanityClient();
  if (!client) return [];

  const query = `*[_type == "product"]|order(_updatedAt desc){
    ${productFields}
  }`;

  try {
    return await client.fetch(query);
  } catch {
    return [];
  }
}

export async function getLatestListingSpotlight(): Promise<LatestListingSpotlight | null> {
  const client = getSanityClient();
  if (!client) return null;

  const query = `*[_type == "product" && (!defined(published) || published == true)]|order(_updatedAt desc)[0]{
    title,
    description,
    "slug": slug.current,
    "imageUrl": listingImage.asset->url,
    "alt": coalesce(listingImage.alt, title),
    "updatedAt": _updatedAt
  }`;

  try {
    const row = await client.fetch<LatestListingSpotlight | null>(query);
    if (!row?.slug) return null;
    return row;
  } catch {
    return null;
  }
}

export async function getProductBySlug(
  slug: string
): Promise<SanityProduct | null> {
  const client = getSanityClient();
  if (!client) return null;

  const query = `*[_type == "product" && slug.current == $slug && (!defined(published) || published == true)][0]{
    ${productFields}
  }`;

  try {
    return await client.fetch(query, { slug });
  } catch {
    return null;
  }
}
