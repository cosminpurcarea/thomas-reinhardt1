import AccountProfileClient from "@/components/account/AccountProfileClient";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

export const dynamic = "force-dynamic";
/** Clerk + auth() redirects are more reliable on Node than Edge on some hosts. */
export const runtime = "nodejs";

/**
 * Access control: `clerkMiddleware` already requires a signed-in session for
 * `/account`. Avoid a second `auth()` + `redirectToSignIn()` here — that
 * double-handling has caused blank / failed loads on production (Vercel).
 */
export default function AccountPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Authentication not configured
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Add real Clerk keys in `.env.local` to enable account management.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <AccountProfileClient />
    </div>
  );
}

