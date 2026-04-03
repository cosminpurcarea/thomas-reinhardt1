import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/sanity/queries";

/**
 * Redirects to the first file's gated URL, or the only matching file.
 * Prefer linking to `/download/[downloadId]` directly for multi-file products.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product?.downloads?.length) {
    return new NextResponse("Product or files not found.", { status: 404 });
  }

  const first = product.downloads[0];
  const url = new URL(req.url);
  const target = new URL(
    `${url.origin}/products/${encodeURIComponent(slug)}/download/${encodeURIComponent(first.downloadId)}`
  );
  return NextResponse.redirect(target, 307);
}
