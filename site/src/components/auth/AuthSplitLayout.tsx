import type { ReactNode } from "react";

type Variant = "sign-in" | "sign-up";

const copy: Record<
  Variant,
  { headline: string; body: string; quote: string; quoteAttribution: string }
> = {
  "sign-in": {
    headline: "Welcome back",
    body: "Sign in to access your downloads, account settings, and SAP program resources.",
    quote:
      "Clear decision ownership and cutover sequencing are what separate successful SAP programs from expensive rework.",
    quoteAttribution: "Executive program sponsor",
  },
  "sign-up": {
    headline: "Create your account",
    body: "Join to unlock free downloads, frameworks, and analysis aligned to governance and cutover readiness.",
    quote:
      "Integrated governance and end-to-end validation help you avoid timeline drift and operational risk.",
    quoteAttribution: "Transformation leader",
  },
};

export default function AuthSplitLayout({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  const c = copy[variant];

  return (
    <div className="flex min-h-[calc(100vh-9rem)] w-full flex-col bg-[#030a14] md:flex-row">
      <aside
        className="relative order-2 flex shrink-0 flex-col justify-between border-t border-[var(--border)] bg-gradient-to-b from-[#071a2f] via-[#061427] to-[#040d18] px-8 py-10 md:order-1 md:w-[42%] md:max-w-xl md:border-t-0 md:border-r md:border-[var(--border)] md:py-14 lg:px-12 xl:px-14"
        aria-label="Brand"
      >
        <div>
          <a href="/" className="inline-flex items-center gap-3">
            <img
              src="/branding/logo-header.png"
              alt="Thomas Reinhardt"
              className="h-11 w-auto md:h-12"
            />
          </a>
          <h1 className="mt-10 text-2xl font-semibold tracking-tight text-white md:mt-14 md:text-3xl lg:text-[1.75rem] lg:leading-tight">
            {c.headline}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#c5d4e8] md:text-[1.05rem]">
            {c.body}
          </p>
        </div>

        <figure className="mt-10 rounded-2xl border border-[var(--border)] bg-[rgba(8,28,48,0.55)] p-5 md:mt-0">
          <blockquote className="text-sm font-medium leading-relaxed text-[#e8f0fb]">
            &ldquo;{c.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-xs font-medium text-[#8fa8c4]">
            — {c.quoteAttribution}
          </figcaption>
        </figure>
      </aside>

      <section
        className="auth-clerk-host order-1 flex flex-1 flex-col justify-center bg-[#061427] px-6 py-12 text-[#f8fafc] md:order-2 md:px-10 md:py-16 lg:px-16"
        aria-label={variant === "sign-in" ? "Sign in form" : "Sign up form"}
      >
        <div className="mx-auto w-full max-w-[min(100%,24rem)] sm:max-w-md">{children}</div>
      </section>
    </div>
  );
}
