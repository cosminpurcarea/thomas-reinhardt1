"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { SanityProduct } from "@/lib/sanity/queries";

type ViewMode = "grid" | "lines";
type TypeFilter = "all" | "free" | "paid";

export default function ProductsCatalogueClient({
  products,
}: {
  products: SanityProduct[];
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
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="text-sm font-semibold text-[var(--accent)]">
                {p.priceType === "paid" ? "Paid product" : "Free product"}
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                <Link href={`/products/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </div>
              {p.description ? (
                <div className="mt-2 text-sm text-[var(--muted)]">
                  {p.description}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
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
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(47,140,255,0.12)_0%,rgba(0,0,0,0)_80%)] p-5 md:p-7"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                  {p.listingImageUrl ? (
                    <Image
                      src={p.listingImageUrl}
                      alt={p.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      No image
                    </div>
                  )}
                  <span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                    New
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                    <Link href={`/products/${p.slug}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </h2>
                  {p.description ? (
                    <p className="mt-2 text-lg leading-relaxed text-[var(--muted)]">
                      {p.description}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/products/${p.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-7 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
                    >
                      View Details
                    </Link>
                    {p.downloads?.length ? (
                      <Link
                        href={`/products/${p.slug}/download`}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-7 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)]"
                      >
                        Download
                      </Link>
                    ) : (
                      <span className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] px-7 text-sm font-semibold text-[var(--muted)] opacity-60">
                        Download unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

