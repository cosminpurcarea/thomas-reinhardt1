import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";
import { getSanityClient } from "@/lib/sanity/client";

function isAdminEmail(email: string, adminEmailsRaw: string | undefined) {
  if (!adminEmailsRaw) return false;
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function GET(req: NextRequest) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "Clerk not configured." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email =
    (user.primaryEmailAddress?.emailAddress as string | undefined) ??
    ((user as { emailAddresses?: { emailAddress?: string }[] }).emailAddresses?.[0]
      ?.emailAddress as string | undefined);

  if (!email || !isAdminEmail(email, adminEmailsRaw)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documentId = req.nextUrl.searchParams.get("documentId")?.trim() ?? "";
  const downloadId = req.nextUrl.searchParams.get("downloadId")?.trim() ?? "";
  const disposition = req.nextUrl.searchParams.get("disposition") === "attachment"
    ? "attachment"
    : "inline";

  if (!documentId || !/^[a-zA-Z0-9._-]+$/.test(documentId)) {
    return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
  }
  if (!downloadId) {
    return NextResponse.json({ error: "Missing downloadId." }, { status: 400 });
  }

  const client = getSanityClient();
  if (!client) {
    return NextResponse.json({ error: "Sanity not configured." }, { status: 503 });
  }

  const doc = await client.fetch<{
    downloads?: {
      downloadId: string;
      filename?: string;
      title?: string;
      fileUrl?: string | null;
    }[];
  } | null>(
    `*[_id == $id && _type == "product"][0]{
      downloads[]{ downloadId, title, filename, "fileUrl": file.asset->url }
    }`,
    { id: documentId }
  );

  const item = doc?.downloads?.find((d) => d.downloadId === downloadId);
  if (!item) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  if (!item.fileUrl) {
    return NextResponse.json(
      { error: "No file asset linked in Sanity for this item." },
      { status: 404 }
    );
  }

  const upstream = await fetch(item.fileUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Could not load file from storage." }, { status: 502 });
  }

  const filename =
    item.filename || `${item.title || "file"}.bin`.replaceAll('"', "");
  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
