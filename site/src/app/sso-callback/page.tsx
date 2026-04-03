import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

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
