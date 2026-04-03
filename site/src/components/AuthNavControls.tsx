"use client";

import Link from "next/link";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

function SignedOutAuthLinks({ loading, pathname }: { loading?: boolean; pathname: string }) {
  const isSignUpActive = pathname.startsWith("/sign-up");
  const isSignInActive = pathname.startsWith("/sign-in");
  const activeClass =
    "inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]";
  const inactiveClass =
    "inline-flex h-10 items-center justify-center rounded-full border border-transparent bg-transparent px-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[rgba(47,140,255,0.08)] hover:text-[var(--foreground)]";

  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-2 sm:gap-3 ${loading ? "opacity-75" : ""}`}
      aria-busy={loading ? true : undefined}
    >
      <a
        href="/sign-up"
        className={isSignUpActive ? activeClass : inactiveClass}
        aria-current={isSignUpActive ? "page" : undefined}
      >
        Sign up
      </a>
      <a
        href="/sign-in"
        className={isSignInActive ? activeClass : inactiveClass}
        aria-current={isSignInActive ? "page" : undefined}
      >
        Login
      </a>
    </div>
  );
}

export default function AuthNavControls() {
  const { isLoaded, userId } = useAuth({ treatPendingAsSignedOut: true });
  const { user } = useUser();
  const pathname = usePathname();
  const currentPath = pathname ?? "";

  if (!isLoaded) {
    return <SignedOutAuthLinks loading pathname={currentPath} />;
  }

  if (!userId) {
    return <SignedOutAuthLinks pathname={currentPath} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] p-0 transition hover:bg-[rgba(47,140,255,0.16)]"
        aria-label="Open account"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "Account"}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-[var(--foreground)]">AC</span>
        )}
      </Link>
      <SignOutButton>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-transparent px-4 text-sm font-semibold text-[var(--muted)] transition hover:bg-[rgba(47,140,255,0.08)] hover:text-[var(--foreground)]"
        >
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}
