"use client";

import { useState } from "react";

export default function UnsubscribeClient({
  e,
  exp,
  sig,
}: {
  e: string;
  exp: string;
  sig: string;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const hasToken = Boolean(e && exp && sig);

  async function onUnsubscribe() {
    if (!hasToken) {
      setStatus("error");
      setMessage("This unsubscribe link is incomplete.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e, exp, sig }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Could not unsubscribe.");
        return;
      }
      setStatus("done");
      setMessage("You have been unsubscribed from newsletter emails.");
    } catch {
      setStatus("error");
      setMessage("Could not unsubscribe. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Newsletter preferences</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Confirm below to stop receiving newsletter and release emails.
      </p>
      <div className="mt-6">
        <button
          type="button"
          disabled={status === "saving" || status === "done"}
          onClick={onUnsubscribe}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,77,102,0.12)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(255,77,102,0.2)] disabled:opacity-60"
        >
          {status === "saving" ? "Unsubscribing..." : status === "done" ? "Unsubscribed" : "Unsubscribe"}
        </button>
      </div>
      {message ? <p className="mt-4 text-sm text-[var(--foreground)]">{message}</p> : null}
    </div>
  );
}

