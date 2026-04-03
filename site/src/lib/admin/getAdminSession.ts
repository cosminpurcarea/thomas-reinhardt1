import { auth, clerkClient } from "@clerk/nextjs/server";

function isAdminEmail(email: string, adminEmailsRaw: string | undefined) {
  if (!adminEmailsRaw) return false;
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export type AdminSession =
  | { status: "signed_out" }
  | { status: "forbidden"; email: string | null }
  | { status: "ok"; userId: string; email: string };

export async function getAdminSession(): Promise<AdminSession> {
  const { userId } = await auth();
  if (!userId) return { status: "signed_out" };

  const clerk = await clerkClient();
  const me = await clerk.users.getUser(userId);
  const email =
    (me.primaryEmailAddress?.emailAddress as string | undefined) ??
    ((me as { emailAddresses?: { emailAddress?: string }[] }).emailAddresses?.[0]
      ?.emailAddress as string | undefined) ??
    null;

  const adminEmailsRaw = process.env.ADMIN_EMAILS;
  if (!email || !isAdminEmail(email, adminEmailsRaw)) {
    return { status: "forbidden", email };
  }

  return { status: "ok", userId, email };
}
