"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AuthenticateWithRedirectCallback = dynamic(
  () =>
    import("@clerk/nextjs").then((mod) => mod.AuthenticateWithRedirectCallback),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[#cbd5e1]" role="status">
        Completing sign-in…
      </p>
    ),
  }
);

/**
 * OAuth callback must not render Clerk until the browser — Next's static
 * prerender pass has no ClerkProvider when env is missing at build time (Vercel).
 */
export function SsoCallbackClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <p className="text-sm text-[#cbd5e1]" role="status">
        Completing sign-in…
      </p>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-[#061427] px-4 py-12">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
