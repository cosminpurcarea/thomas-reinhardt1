import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getConsentedUserEmails } from "@/lib/email/newsletter";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

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
    return new NextResponse("Clerk not configured.", { status: 503 });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS;
  if (!adminEmailsRaw) {
    return new NextResponse("Admin not configured.", { status: 403 });
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

  const emails = await getConsentedUserEmails();
  emails.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return NextResponse.json({ emails });
}
