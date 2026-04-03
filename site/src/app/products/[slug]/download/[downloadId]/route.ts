import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/sanity/queries";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";
import { incrementProductDownloadCount } from "@/lib/sanity/incrementProductDownloadCount";
import { stampPdfCopyright } from "@/lib/downloads/stampPdfCopyright";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string; downloadId: string }> }
) {
  const { slug, downloadId: downloadIdParam } = await context.params;
  const downloadId = decodeURIComponent(downloadIdParam);

  if (!isClerkConfigured()) {
    return new NextResponse("Authentication not configured.", { status: 503 });
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn();
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const firstName = user.firstName?.trim() || "Unknown";
  const lastName = user.lastName?.trim() || "User";
  const fullName = `${firstName} ${lastName}`.trim();

  const uniqueId = `${Date.now()}-${crypto.randomUUID()}-${crypto
    .randomUUID()
    .replaceAll("-", "")}`;
  const downloadedAt = new Date();

  const product = await getProductBySlug(slug);
  if (!product) {
    return new NextResponse("Product not found.", { status: 404 });
  }

  const download = product.downloads?.find((d) => d.downloadId === downloadId);
  if (!download) {
    return new NextResponse("File not found.", { status: 404 });
  }

  void incrementProductDownloadCount(product._id, download.downloadId);

  const filename = download.filename || `${product.title}.txt`;
  const safeFilename = filename.replaceAll('"', "");

  if (download.fileUrl) {
    const upstream = await fetch(download.fileUrl, { cache: "no-store" });
    if (upstream.ok && upstream.body) {
      const contentType =
        upstream.headers.get("content-type") || "application/octet-stream";

      const isPdf =
        contentType.includes("application/pdf") ||
        safeFilename.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const arrayBuffer = await upstream.arrayBuffer();
        const stamped = await stampPdfCopyright({
          pdfBytes: new Uint8Array(arrayBuffer),
          fullName,
          downloadedAt,
          uniqueId,
        });
        const stampedBuffer = stamped.buffer.slice(
          stamped.byteOffset,
          stamped.byteOffset + stamped.byteLength
        ) as ArrayBuffer;

        return new NextResponse(stampedBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${safeFilename}"`,
          },
        });
      }

      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${safeFilename}"`,
        },
      });
    }
  }

  const body = [
    `Downloaded: ${product.title}`,
    `Slug: ${product.slug}`,
    `File: ${download.title}`,
    `Streaming not yet available for this file (missing Sanity fileUrl).`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
    },
  });
}
