function isPlaceholder(value: string | undefined) {
  if (!value?.trim()) return true;
  return value.includes("YOUR_") || value.includes("YOUR@");
}

/** Inbox address for contact form submissions (must be verified in Resend if on free tier). */
export function getContactToEmail(): string | null {
  const to = process.env.CONTACT_TO_EMAIL;
  if (isPlaceholder(to)) return null;
  return to!.trim();
}
