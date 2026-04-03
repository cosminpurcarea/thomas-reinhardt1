import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  sendGDPRSafeFreeProductRelease,
} from "@/lib/email/newsletter";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

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
    return new NextResponse("Clerk not configured.", { status: 503 });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS;
  if (!adminEmailsRaw) {
    return new NextResponse("Email sending not enabled.", { status: 403 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email =
    (user.primaryEmailAddress?.emailAddress as string | undefined) ??
    ((user as any).emailAddresses?.[0]?.emailAddress as
      | string
      | undefined);

  if (!email || !isAdminEmail(email, adminEmailsRaw)) {
    return new NextResponse("Forbidden.", { status: 403 });
  }

  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const productSlug =
    (payload as { productSlug?: unknown } | null)?.productSlug?.toString() ??
    "";
  const productTitle =
    (payload as { productTitle?: unknown } | null)?.productTitle
      ?.toString() ?? "";

  if (!productSlug || !productTitle) {
    return new NextResponse(
      "Missing productSlug and/or productTitle.",
      { status: 400 }
    );
  }

  const result = await sendGDPRSafeFreeProductRelease({
    productSlug,
    productTitle,
  });

  return NextResponse.json(result);
}

