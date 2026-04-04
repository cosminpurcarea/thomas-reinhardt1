"use client";

import Link from "next/link";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          The account page could not be loaded. You can try again or return to
          the home page.
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-red-200">
            {error.message}
          </pre>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-black"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-[var(--foreground)]"
          >
            Home
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-[var(--foreground)]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
