import { NextResponse } from "next/server";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://example.com";

const staticPaths = [
  "/",
  "/products",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/sign-in",
  "/sign-up",
];

function toXml(urls: string[]) {
  const items = urls
    .map((u) => `<url><loc>${u}</loc></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

export async function GET() {
  const urls = staticPaths.map((p) => `${baseUrl}${p}`);
  return new NextResponse(toXml(urls), {
    headers: { "Content-Type": "application/xml" },
  });
}

