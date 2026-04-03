import type { ReactNode } from "react";

/**
 * OAuth/SSO must not be statically prerendered: Clerk client components need
 * runtime + ClerkProvider (see Vercel build without static generation here).
 */
export const dynamic = "force-dynamic";

export default function SsoCallbackLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
