import ShowWhenSignedOut from "@/components/ShowWhenSignedOut";
import HomeLatestDownloadCta from "@/components/HomeLatestDownloadCta";
import { getLatestListingSpotlight } from "@/lib/sanity/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const spotlight = await getLatestListingSpotlight();

  return (
    <div className="flex flex-col">
      {/* Main banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/branding/banner.png"
            alt="Thomas Reinhardt executive banner"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,20,39,0.95)_0%,rgba(6,20,39,0.7)_45%,rgba(6,20,39,0.95)_100%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              Executive SAP Program Insights
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              Prevent SAP program failures that can cost tens of millions.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
              Integrated governance, end-to-end validation, and cutover readiness
              help you avoid costly rework, timeline drift, and operational risk.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.05)] transition hover:bg-[var(--accent-strong)]"
              >
                Get free downloads
              </a>
              <ShowWhenSignedOut>
                <a
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
                >
                  Create account
                </a>
              </ShowWhenSignedOut>
            </div>
          </div>
        </div>
      </section>

      {/* Value blocks */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-[var(--accent)]">
              System-level program orchestration
            </div>
            <div className="mt-2 text-[var(--foreground)] font-semibold">
              Align all execution layers into a single control system
            </div>
            <div className="mt-2 text-sm text-[var(--muted)]">
              Establish an integrated control model where governance, testing,
              and cutover operate as one coordinated system—ensuring decisions,
              outcomes, and execution remain continuously synchronized.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-[var(--accent)]">
              Evidence-based execution readiness
            </div>
            <div className="mt-2 text-[var(--foreground)] font-semibold">
              Validate deployment readiness through measurable control criteria
            </div>
            <div className="mt-2 text-sm text-[var(--muted)]">
              Replace assumption-driven readiness with a quantified validation
              framework, ensuring all program dimensions meet defined
              thresholds before execution.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-[var(--accent)]">
              Evidence-based execution readiness
            </div>
            <div className="mt-2 text-[var(--foreground)] font-semibold">
              Validate deployment readiness through measurable control criteria
            </div>
            <div className="mt-2 text-sm text-[var(--muted)]">
              Replace assumption-driven readiness with a quantified validation
              framework, ensuring all program dimensions meet defined
              thresholds before execution.
            </div>
          </div>
        </div>
      </section>

      <HomeLatestDownloadCta spotlight={spotlight} />
    </div>
  );
}
