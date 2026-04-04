"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import AdminListingThumbnailEditor from "@/components/admin/AdminListingThumbnailEditor";
import type { SanityProduct } from "@/lib/sanity/queries";

type ViewMode = "grid" | "lines";
type TypeFilter = "all" | "free" | "paid";

export default function ProductsCatalogueClient({
  products,
  newestProductId,
  isAdmin = false,
}: {
  products: SanityProduct[];
  /** First item from server list (newest by `_updatedAt`); used for “New” badge only. */
  newestProductId: string | null;
  /** Listing thumbnails become tappable to replace (API still enforces admin). */
  isAdmin?: boolean;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const toggleClass =
    "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition";
  const activeToggleClass =
    "bg-[rgba(47,140,255,0.18)] text-[var(--foreground)]";
  const inactiveToggleClass =
    "text-[var(--muted)] hover:bg-[rgba(47,140,255,0.08)] hover:text-[var(--foreground)]";

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "free" && p.priceType !== "paid") ||
        (typeFilter === "paid" && p.priceType === "paid");

      if (!matchesType) return false;
      if (!q) return true;

      const haystack = `${p.title} ${p.description ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query, typeFilter]);

  if (products.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted)]">
        No products found yet. Publish a `product` document in Sanity with at
        least one download item.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block min-w-[240px]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or description"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
          </label>

          <label className="block min-w-[170px]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Filter
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="all">All types</option>
              <option value="free">Free only</option>
              <option value="paid">Paid only</option>
            </select>
          </label>
        </div>

        <div className="inline-flex self-end rounded-full border border-[var(--border)] bg-[var(--card)] p-1">
          <button
            type="button"
            className={`${toggleClass} ${
              viewMode === "grid" ? activeToggleClass : inactiveToggleClass
            }`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            Grid
          </button>
          <button
            type="button"
            className={`${toggleClass} ${
              viewMode === "lines" ? activeToggleClass : inactiveToggleClass
            }`}
            onClick={() => setViewMode("lines")}
            aria-pressed={viewMode === "lines"}
          >
            Lines
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted)]">
          No products match your search/filter.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="flex min-h-[200px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="text-xs font-semibold text-[var(--accent)]">
                {p.priceType === "paid" ? "Paid product" : "Free product"}
              </div>
              <div className="mt-2 text-base font-semibold leading-snug text-[var(--foreground)]">
                <Link
                  href={`/products/${p.slug}`}
                  className="line-clamp-2 hover:underline"
                >
                  {p.title}
                </Link>
              </div>
              {p.description ? (
                <div className="mt-2 line-clamp-3 min-h-0 flex-1 text-sm leading-snug text-[var(--muted)]">
                  {p.description}
                </div>
              ) : (
                <div className="min-h-0 flex-1" />
              )}
              <div className="mt-4 flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/products/${p.slug}`}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
                >
                  View details
                </Link>
                {p.downloads?.length ? (
                  <Link
                    href={`/products/${p.slug}/download`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)]"
                  >
                    Download
                  </Link>
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-[var(--muted)] opacity-60">
                    Download unavailable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((p) => {
            const showNew =
              newestProductId !== null && p._id === newestProductId;
            return (
            <div
              key={p._id}
              className="flex min-h-[168px] flex-col rounded-3xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(47,140,255,0.12)_0%,rgba(0,0,0,0)_80%)] p-5 sm:min-h-[156px] md:p-6"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
                <AdminListingThumbnailEditor
                  isAdmin={isAdmin}
                  productSlug={p.slug}
                  variant="compact"
                  className="relative mx-auto h-[100px] w-[100px] shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] sm:mx-0"
                >
                  {p.listingImageUrl ? (
                    <Image
                      src={p.listingImageUrl}
                      alt={p.title}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      No image
                    </div>
                  )}
                  {showNew ? (
                    <span className="pointer-events-none absolute left-1.5 top-1.5 z-[3] inline-flex items-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
                      New
                    </span>
                  ) : null}
                </AdminListingThumbnailEditor>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between">
                  <div className="min-h-0">
                    <div className="min-h-[2.75rem] sm:min-h-[3.25rem]">
                      <h2 className="text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg">
                        <Link
                          href={`/products/${p.slug}`}
                          className="line-clamp-2 hover:underline"
                        >
                          {p.title}
                        </Link>
                      </h2>
                    </div>
                    <div className="mt-1.5 h-[4.125rem] overflow-hidden">
                      {p.description ? (
                        <p className="line-clamp-3 text-sm leading-snug text-[var(--muted)]">
                          {p.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 sm:mt-2">
                    <Link
                      href={`/products/${p.slug}`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
                    >
                      View Details
                    </Link>
                    {p.downloads?.length ? (
                      <Link
                        href={`/products/${p.slug}/download`}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-xs font-semibold text-black transition hover:bg-[var(--accent-strong)]"
                      >
                        Download
                      </Link>
                    ) : (
                      <span className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--border)] px-5 text-xs font-semibold text-[var(--muted)] opacity-60">
                        Download unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

