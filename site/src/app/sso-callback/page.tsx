"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Completes OAuth / SSO redirects initiated from sign-up (or sign-in).
 * Client-only so the build never prerenders without Clerk React context.
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
