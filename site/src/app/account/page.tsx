import { auth } from "@clerk/nextjs/server";
import AccountProfileClient from "@/components/account/AccountProfileClient";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
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

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn();
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <AccountProfileClient />
    </div>
  );
}

