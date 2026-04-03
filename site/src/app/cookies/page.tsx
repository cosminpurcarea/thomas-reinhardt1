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
          <strong>Cookie duration</strong>: REPLACE_WITH_EXACT_RETENTION_PERIODS
          (session cookies, short-lived security cookies, and consent record
          duration).
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
          Important: add a full cookie table (name, provider, purpose, legal
          basis, storage period, and category) once production cookies are final.
        </p>
      </div>
    </div>
  );
}

