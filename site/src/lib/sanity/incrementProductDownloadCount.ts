import { getSanityWriteClient } from "./client";

/**
 * Atom-ish increment for downloads[i].downloadCount (requires write token).
 * Fails silently so a metrics glitch never blocks the user download.
 */
export async function incrementProductDownloadCount(
  productDocumentId: string,
  downloadId: string
): Promise<void> {
  const client = getSanityWriteClient();
  if (!client) return;

  const doc = await client.fetch<{
    _id: string;
    downloads?: { downloadId?: string; downloadCount?: number }[];
  } | null>(
    `*[_type == "product" && _id == $id][0]{ _id, downloads[]{ downloadId, "downloadCount": coalesce(downloadCount, 0) } }`,
    { id: productDocumentId }
  );

  if (!doc?.downloads?.length) return;

  const idx = doc.downloads.findIndex((d) => d.downloadId === downloadId);
  if (idx < 0) return;

  const pathKey = `downloads[${idx}].downloadCount`;
  try {
    await client.patch(doc._id).inc({ [pathKey]: 1 }).commit();
  } catch {
    const current = Number(doc.downloads[idx]?.downloadCount ?? 0);
    try {
      await client.patch(doc._id).set({ [pathKey]: current + 1 }).commit();
    } catch {
      // ignore
    }
  }
}
