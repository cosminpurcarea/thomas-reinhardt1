"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SanityProduct } from "@/lib/sanity/queries";

function toggleSetMember(set: Set<string>, email: string, on: boolean): Set<string> {
  const next = new Set(set);
  if (on) next.add(email);
  else next.delete(email);
  return next;
}

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

  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const [allEmails, setAllEmails] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterQuery, setFilterQuery] = useState("");

  const selectedProduct = useMemo(
    () => freeProducts.find((p) => p.slug === selectedSlug) ?? null,
    [freeProducts, selectedSlug]
  );

  const filteredEmails = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return allEmails;
    return allEmails.filter((e) => e.toLowerCase().includes(q));
  }, [allEmails, filterQuery]);

  const loadRecipients = useCallback(async () => {
    setRecipientsLoading(true);
    setRecipientsError(null);
    try {
      const res = await fetch("/api/admin/newsletter-recipients");
      const data = (await res.json().catch(() => null)) as
        | { emails?: string[]; error?: string }
        | null;
      if (!res.ok) {
        setRecipientsError(
          typeof data === "object" && data && "error" in data && data.error
            ? String(data.error)
            : `Request failed (${res.status})`
        );
        setAllEmails([]);
        setSelected(new Set());
        return;
      }
      const emails = Array.isArray(data?.emails) ? data.emails : [];
      setAllEmails(emails);
      setSelected(new Set(emails));
    } catch {
      setRecipientsError("Could not load recipient list.");
      setAllEmails([]);
      setSelected(new Set());
    } finally {
      setRecipientsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecipients();
  }, [loadRecipients]);

  const selectedCount = selected.size;
  const visibleSelectedCount = useMemo(
    () => filteredEmails.filter((e) => selected.has(e)).length,
    [filteredEmails, selected]
  );

  const toggleOne = (email: string, checked: boolean) => {
    setSelected((prev) => toggleSetMember(prev, email, checked));
  };

  const selectAllInList = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const e of allEmails) next.add(e);
      return next;
    });
  };

  const deselectAllInList = () => {
    setSelected(new Set());
  };

  const selectFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const e of filteredEmails) next.add(e);
      return next;
    });
  };

  const deselectFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const e of filteredEmails) next.delete(e);
      return next;
    });
  };

  return (
    <section className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">
        Send free product release email
      </h2>
      <p className="mt-2 text-[var(--muted)]">
        Sends to users with `newsletterConsent=true` and includes product details
        plus access links. Choose recipients below; only checked addresses are
        emailed.
      </p>

      {freeProducts.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          No free products available.
        </p>
      ) : (
        <>
          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <label className="min-w-0 w-full flex-1">
              <span className="text-sm font-semibold text-[var(--muted)]">
                Product
              </span>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="admin-native-select mt-2 w-full min-w-0 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium"
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
              disabled={!selectedProduct || sending || selectedCount === 0}
              className="inline-flex h-11 shrink-0 items-center justify-center self-end rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
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
                      recipientEmails: Array.from(selected),
                    }),
                  });
                  const data = (await res.json().catch(() => null)) as
                    | { recipients?: number; error?: string }
                    | null;
                  if (!res.ok) {
                    setStatus(
                      `Failed: ${data?.error ?? "server returned an error"}`
                    );
                    return;
                  }
                  setStatus(
                    `Sent to ${String(data?.recipients ?? 0)} recipient(s).`
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

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Recipients ({selectedCount} of {allEmails.length} selected)
              </h3>
              <button
                type="button"
                onClick={() => void loadRecipients()}
                disabled={recipientsLoading}
                className="text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-50"
              >
                Refresh list
              </button>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-[var(--muted)]">
                Filter emails
              </span>
              <input
                type="search"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Type to filter by address…"
                className="mt-2 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card-strong)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]"
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAllInList}
                className="rounded-lg border border-[var(--border)] bg-[var(--card-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[rgba(47,140,255,0.12)]"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={deselectAllInList}
                className="rounded-lg border border-[var(--border)] bg-[var(--card-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[rgba(47,140,255,0.12)]"
              >
                Deselect all
              </button>
              <button
                type="button"
                onClick={selectFiltered}
                disabled={filteredEmails.length === 0}
                className="rounded-lg border border-[var(--border)] bg-[var(--card-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[rgba(47,140,255,0.12)] disabled:opacity-40"
              >
                Select filtered ({filteredEmails.length})
              </button>
              <button
                type="button"
                onClick={deselectFiltered}
                disabled={visibleSelectedCount === 0}
                className="rounded-lg border border-[var(--border)] bg-[var(--card-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[rgba(47,140,255,0.12)] disabled:opacity-40"
              >
                Deselect filtered ({visibleSelectedCount} in view)
              </button>
            </div>

            {recipientsLoading ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Loading consented recipients…
              </p>
            ) : recipientsError ? (
              <p className="mt-4 text-sm text-red-300">{recipientsError}</p>
            ) : allEmails.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                No users with newsletter consent yet.
              </p>
            ) : (
              <ul
                className="mt-4 max-h-[min(420px,50vh)] list-none space-y-0 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card-strong)] p-2"
                aria-label="Newsletter recipients"
              >
                {filteredEmails.length === 0 ? (
                  <li className="px-3 py-4 text-sm text-[var(--muted)]">
                    No addresses match this filter.
                  </li>
                ) : (
                  filteredEmails.map((email) => {
                    const rowId = `recipient-${allEmails.indexOf(email)}`;
                    return (
                      <li
                        key={email}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[rgba(47,140,255,0.08)]"
                      >
                        <input
                          id={rowId}
                          type="checkbox"
                          checked={selected.has(email)}
                          onChange={(e) => toggleOne(email, e.target.checked)}
                          className="size-4 shrink-0 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--ring)]"
                        />
                        <label
                          htmlFor={rowId}
                          className="min-w-0 flex-1 cursor-pointer break-all text-sm text-[var(--foreground)]"
                        >
                          {email}
                        </label>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        </>
      )}

      {status ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-4 py-2 text-sm text-[var(--foreground)]">
          {status}
        </div>
      ) : null}
    </section>
  );
}
