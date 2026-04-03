import Image from "next/image";
import type { LatestListingSpotlight } from "@/lib/sanity/queries";
import ShowWhenSignedOut from "@/components/ShowWhenSignedOut";

const FALLBACK_HEADING =
  "Make your SAP program decisions earlier, with less systemic risk.";
const FALLBACK_BODY =
  "Sign up for a free account to access product downloads. You must be logged in to download files.";

export default function HomeLatestDownloadCta({
  spotlight,
}: {
  spotlight: LatestListingSpotlight | null;
}) {
  const heading = spotlight?.title?.trim() || FALLBACK_HEADING;
  const body =
    spotlight?.description?.trim() ||
    (!spotlight ? FALLBACK_BODY : null);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(47,140,255,0.12)_0%,rgba(0,0,0,0)_70%)] p-6 md:p-10">
        <div
          className={
            spotlight
              ? "flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8"
              : ""
          }
        >
          {spotlight ? (
            <div className="mx-auto w-full max-w-[179px] shrink-0 lg:order-first lg:mx-0">
              <div className="relative mx-auto aspect-square w-full max-w-[179px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-strong)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <Image
                  src={spotlight.imageUrl}
                  alt={spotlight.alt}
                  fill
                  sizes="(max-width: 1024px) 179px, 179px"
                  className="object-cover"
                  priority
                />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-sm">
                  New
                </span>
              </div>
            </div>
          ) : null}

          <div className={spotlight ? "min-w-0 flex-1" : ""}>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              {heading}
            </h2>
            {body ? (
              <p className="mt-3 text-[var(--muted)] leading-relaxed whitespace-pre-line">
                {body}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ShowWhenSignedOut>
                <a
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-7 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)]"
                >
                  Sign up
                </a>
              </ShowWhenSignedOut>
              <a
                href={
                  spotlight
                    ? `/products/${encodeURIComponent(spotlight.slug)}`
                    : "/products"
                }
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-7 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
