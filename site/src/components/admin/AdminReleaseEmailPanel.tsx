"use client";

import { useMemo, useState } from "react";
import type { SanityProduct } from "@/lib/sanity/queries";

export default function AdminReleaseEmailPanel({
  products,
}: {
  products: SanityProduct[];
}) {
  const freeProducts = products.filter((p) => p.priceType !== "paid");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    freeProducts[0]?.slug ?? ""
  );
  const [status, setStatus] = useState<string>("");
  const [sending, setSending] = useState(false);

  const selectedProduct = useMemo(
    () => freeProducts.find((p) => p.slug === selectedSlug) ?? null,
    [freeProducts, selectedSlug]
  );

  return (
    <section className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">
        Send free product release email
      </h2>
      <p className="mt-2 text-[var(--muted)]">
        Sends to users with `newsletterConsent=true` and includes product details
        plus access links.
      </p>

      {freeProducts.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          No free products available.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="w-full sm:w-80">
            <span className="text-sm font-semibold text-[var(--muted)]">
              Product
            </span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
            >
              {freeProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={!selectedProduct || sending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              if (!selectedProduct) return;
              setSending(true);
              setStatus("Sending...");
              try {
                const res = await fetch("/api/admin/send-free-product-release", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productSlug: selectedProduct.slug,
                    productTitle: selectedProduct.title,
                  }),
                });
                const data = (await res.json().catch(() => null)) as
                  | { recipients?: number; error?: string }
                  | null;
                if (!res.ok) {
                  setStatus(`Failed: ${data?.error ?? "server returned an error"}`);
                  return;
                }
                setStatus(
                  `Sent to ${String(data?.recipients ?? 0)} consented recipients.`
                );
              } catch {
                setStatus("Failed to send. Check server logs.");
              } finally {
                setSending(false);
              }
            }}
          >
            Send release email
          </button>
        </div>
      )}

      {status ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-4 py-2 text-sm text-[var(--foreground)]">
          {status}
        </div>
      ) : null}
    </section>
  );
}

