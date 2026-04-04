export default function CookiesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">
        Cookies
      </h1>
      <div className="mt-6 space-y-4 text-[var(--muted)] leading-relaxed">
        <p>
          This Cookie Policy explains which cookies and similar technologies are
          used on this website and how you can manage your preferences in line
          with GDPR and TDDDG requirements.
        </p>
        <p>
          <strong>Principle</strong>: technically necessary cookies may be set
          without prior consent where legally permitted. Optional cookies (for
          example analytics or marketing) require your prior consent.
        </p>
        <p>
          <strong>Currently used cookies</strong>: (1) authentication/session
          cookies to keep signed-in users authenticated and protect account access,
          (2) consent-preference storage to remember your choices, and (3) security-
          related cookies for fraud prevention and request integrity.
        </p>
        <p>
          <strong>Optional categories</strong>: if analytics, personalization,
          or marketing tools are added later, this page and the consent banner
          must be updated before activation.
        </p>
        <p>
          <strong>Legal basis</strong>: for necessary cookies, Art. 6(1)(f) GDPR
          (or Art. 6(1)(b) where required for requested services) together with
          TDDDG provisions; for optional cookies, Art. 6(1)(a) GDPR (consent).
        </p>
        <p>
          <strong>Cookie duration and similar storage</strong> (as implemented
          on this site today):
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Newsletter consent cookie</strong> (
            <code className="text-[var(--foreground)]">tr_newsletter_consent</code>
            , first-party): stores whether you accepted or declined optional
            newsletter marketing in the on-site banner.{" "}
            <strong>Maximum duration: 180 days</strong>, then the cookie expires
            automatically unless renewed when you interact with the banner
            again. Legal basis when storing a marketing opt-in: Art. 6(1)(a)
            GDPR (consent).
          </li>
          <li>
            <strong>Browser storage (localStorage)</strong>: the same preference
            may be mirrored under keys{" "}
            <code className="text-[var(--foreground)]">
              tr_newsletter_consent
            </code>{" "}
            and{" "}
            <code className="text-[var(--foreground)]">
              tr_newsletter_consent_decided
            </code>{" "}
            until you clear site data or we change the implementation.
          </li>
          <li>
            <strong>Authentication (Clerk)</strong>: our authentication provider
            (Clerk) sets cookies and similar identifiers needed for sign-in,
            session management, and security (for example fraud prevention).
            Their lifetime is determined by Clerk and your session settings
            (typically a combination of session-limited and longer-lived
            tokens). See Clerk&apos;s privacy and cookie documentation for
            current names and durations.
          </li>
          <li>
            <strong>Hosting (Vercel)</strong>: our host may set short-lived,
            technically necessary cookies or headers for delivery, security,
            and load balancing.
          </li>
        </ul>
        <p>
          We do not use first-party analytics or advertising cookies on this
          site at the time of this policy. If that changes, this page will be
          updated before those tools go live.
        </p>
        <p>
          <strong>Contact</strong>: questions about this policy:{" "}
          <a
            href="mailto:contact@thomas-reinhardt.com"
            className="text-[var(--foreground)] underline"
          >
            contact@thomas-reinhardt.com
          </a>
          .
        </p>
        <p>
          <strong>Withdrawing consent</strong>: you can change your consent
          choices at any time with future effect via the preference banner.
        </p>
        <p>
          <strong>Manage preferences</strong>: use{" "}
          <a href="/cookies?consent=manage" className="underline">
            Open newsletter consent banner
          </a>{" "}
          (Cookies page), or add{" "}
          <code className="text-[var(--foreground)]">?consent=manage</code> to any
          page URL on this site (for example{" "}
          <code className="text-[var(--foreground)]">/?consent=manage</code>
          ).
        </p>
        <p className="text-sm">
          Important: review this list whenever you change authentication,
          hosting, or marketing tools. A tabular cookie list in your privacy
          documentation is recommended for formal compliance reviews.
        </p>
      </div>
    </div>
  );
}

