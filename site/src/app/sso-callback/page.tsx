"use client";

import dynamic from "next/dynamic";

/**
 * Load only in the browser so `next build` never prerenders Clerk OAuth UI
 * without a full client tree under ClerkProvider (fixes Vercel static pass).
 */
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
 * Completes OAuth / SSO redirects initiated from sign-up (or sign-in).
 */
export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-[#061427] px-4 py-12">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
