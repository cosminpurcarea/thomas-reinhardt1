import { clerkClient } from "@clerk/nextjs/server";

const METADATA_KEY = "newsletterConsent";

export async function getNewsletterConsentForUserId(
  userId: string
): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const publicMetadata = user.publicMetadata as Record<string, unknown> | null;
  return Boolean(publicMetadata?.[METADATA_KEY]);
}

export async function setNewsletterConsentForUserId(
  userId: string,
  consent: boolean
): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.publicMetadata ?? {}) as Record<string, unknown>;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...existing,
      [METADATA_KEY]: consent,
      newsletterConsentUpdatedAt: new Date().toISOString(),
    },
  });
}

export async function setNewsletterConsentForEmail(
  email: string,
  consent: boolean
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const client = await clerkClient();
  const result = await client.users.getUserList({
    emailAddress: [normalized],
    limit: 1,
  } as any);

  const target = result.data[0];
  if (!target?.id) return false;

  const existing = (target.publicMetadata ?? {}) as Record<string, unknown>;
  await client.users.updateUserMetadata(target.id, {
    publicMetadata: {
      ...existing,
      [METADATA_KEY]: consent,
      newsletterConsentUpdatedAt: new Date().toISOString(),
    },
  });

  return true;
}

