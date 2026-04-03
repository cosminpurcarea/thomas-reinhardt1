"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/lib/sanity/queries";

function formatDt(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export default function AdminProductsListClient({
  products,
  canMutate,
}: {
  products: SanityProduct[];
  canMutate: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      const hay = [
        p._id,
        p.title,
        p.slug,
        p.description ?? "",
        ...(p.downloads ?? []).map((d) => `${d.title} ${d.filename ?? ""}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [products, q]);

  async function callAction(documentId: string, action: "publish" | "unpublish" | "delete") {
    if (!canMutate) return;
    setError("");
    setBusyId(documentId);
    try {
      const res = await fetch("/api/admin/sanity-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, action }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full sm:max-w-md">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Search
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, slug, document id, filename…"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[rgba(6,20,39,0.5)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </label>
        <div className="text-xs text-[var(--muted)]">
          Showing {filtered.length} of {products.length}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {products.length === 0 ? null : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-[var(--muted)]">
          No products match your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="min-w-[900px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Status
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Document ID
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Title
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Slug
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Published / updated
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Type
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Files
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Links
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const files = p.downloads ?? [];
                const live = p.published !== false;
                const busy = busyId === p._id;
                return (
                  <tr
                    key={p._id}
                    className={`border-b border-[rgba(255,255,255,0.06)] ${
                      !live ? "bg-[rgba(255,100,100,0.06)]" : ""
                    }`}
                  >
                    <td className="px-3 py-3 align-top">
                      <span
                        className={
                          live
                            ? "inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-200"
                            : "inline-flex rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-100"
                        }
                      >
                        {live ? "Live" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top text-[var(--muted)]">
                      <code className="break-all text-xs leading-snug">{p._id}</code>
                    </td>
                    <td className="px-3 py-3 align-top font-medium text-[var(--foreground)]">
                      {p.title}
                    </td>
                    <td className="px-3 py-3 align-top text-[var(--muted)]">
                      <code className="text-xs">{p.slug}</code>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-[var(--muted)]">
                      <div>
                        <span className="text-[var(--foreground)]">Created</span>{" "}
                        {formatDt(p._createdAt)}
                      </div>
                      <div className="mt-1">
                        <span className="text-[var(--foreground)]">Updated</span>{" "}
                        {formatDt(p._updatedAt)}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top text-[var(--foreground)]">
                      {p.priceType === "paid" ? "Paid" : "Free"}
                      {p.priceType !== "paid" && p.newsletterRequired ? (
                        <span className="ml-1 block text-xs text-[var(--muted)]">
                          (marketing tag)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 align-top text-[var(--muted)]">
                      {files.length === 0 ? (
                        <span className="text-amber-200/80">No file</span>
                      ) : (
                        <ul className="max-w-[240px] list-inside list-disc space-y-2">
                          {files.map((d) => {
                            const count = d.downloadCount ?? 0;
                            const viewHref = `/api/admin/product-file?documentId=${encodeURIComponent(p._id)}&downloadId=${encodeURIComponent(d.downloadId)}`;
                            return (
                              <li key={d.downloadId} className="text-[var(--foreground)]">
                                <span className="font-medium">{d.title}</span>
                                {d.filename ? (
                                  <span className="text-xs text-[var(--muted)]">
                                    {" "}
                                    ({d.filename})
                                  </span>
                                ) : null}
                                <div className="ml-4 mt-1 list-none text-xs text-[var(--muted)]">
                                  <span className="text-[var(--foreground)]">
                                    Downloads: {count}
                                  </span>
                                  {d.fileUrl ? (
                                    <>
                                      {" "}
                                      ·{" "}
                                      <a
                                        href={viewHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent)] underline hover:no-underline"
                                      >
                                        View
                                      </a>
                                      {" "}
                                      ·{" "}
                                      <a
                                        href={d.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent)] underline hover:no-underline"
                                        title={d.fileUrl}
                                      >
                                        Storage URL
                                      </a>
                                    </>
                                  ) : (
                                    <span className="text-amber-200/70"> · No asset</span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col gap-1 text-xs">
                        <Link
                          href={`/products/${encodeURIComponent(p.slug)}`}
                          className="text-[var(--accent)] underline hover:no-underline"
                        >
                          Public page
                        </Link>
                        <Link
                          href={`/products/${encodeURIComponent(p.slug)}/download`}
                          className="text-[var(--muted)] underline hover:text-[var(--foreground)]"
                        >
                          Download
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col gap-1.5">
                        {live ? (
                          <button
                            type="button"
                            disabled={!canMutate || busy}
                            className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-left text-xs font-medium text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => {
                              if (
                                !confirm(
                                  `Unpublish “${p.title}”? It will disappear from Free Downloads.`
                                )
                              )
                                return;
                              void callAction(p._id, "unpublish");
                            }}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canMutate || busy}
                            className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2 py-1.5 text-left text-xs font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => void callAction(p._id, "publish")}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!canMutate || busy}
                          className="rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1.5 text-left text-xs font-medium text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => {
                            if (
                              !confirm(
                                `Permanently delete “${p.title}” from Sanity? This cannot be undone.`
                              )
                            )
                              return;
                            void callAction(p._id, "delete");
                          }}
                        >
                          {busy ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
