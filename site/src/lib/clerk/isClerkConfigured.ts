export function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return false;
  if (publishableKey.includes("YOUR_")) return false;
  if (publishableKey.includes("YOUR")) return false;
  return true;
}

