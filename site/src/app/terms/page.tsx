export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">
        Terms & Conditions
      </h1>
      <div className="mt-6 space-y-4 text-[var(--muted)] leading-relaxed">
        <p>
          These Terms and Conditions govern use of this website, user accounts,
          and access to downloadable materials.
        </p>
        <p>
          <strong>Provider</strong>: Thomas Reinhardt, Lower Saxony (
          <em>Niedersachsen</em>), Germany. Contact:{" "}
          <a
            href="mailto:contact@thomas-reinhardt.com"
            className="text-[var(--foreground)] underline"
          >
            contact@thomas-reinhardt.com
          </a>
          .
        </p>
        <p>
          <strong>Scope of service</strong>: this site provides consulting-related
          information and downloadable resources. Unless explicitly agreed
          otherwise in writing, no guaranteed service level or uninterrupted
          availability is owed for free content.
        </p>
        <p>
          <strong>Account and access</strong>: access to gated downloads may
          require registration and authentication. You are responsible for the
          confidentiality of credentials and for activities under your account.
          Notify us immediately of suspected unauthorized access.
        </p>
        <p>
          <strong>Permitted use</strong>: you may use content only as permitted
          by applicable law and these terms. Unlawful use, unauthorized redistribution,
          or attempts to circumvent technical protections are prohibited.
        </p>
        <p>
          <strong>Intellectual property</strong>: all content, trademarks, and
          materials remain with the provider or respective rights holders unless
          explicitly stated otherwise. No transfer of ownership rights occurs.
        </p>
        <p>
          <strong>Newsletter and marketing</strong>: marketing emails are sent
          only on the basis of valid consent (opt-in) and can be withdrawn at
          any time with future effect.
        </p>
        <p>
          <strong>Liability</strong>: mandatory statutory liability remains
          unaffected (including liability for intent, gross negligence, injury
          to life/body/health, and claims under German product liability law).
          For slight negligence, liability is limited to foreseeable, typical
          contractual damage where legally permissible.
        </p>
        <p>
          <strong>External links</strong>: links to third-party services are
          provided for convenience. Responsibility for third-party content
          remains with the respective provider.
        </p>
        <p>
          <strong>Applicable law and venue</strong>: subject to mandatory consumer
          protection rules, these terms are governed by German law. If you are
          a merchant (<em>Kaufmann</em>) under German law, the exclusive place
          of jurisdiction is <strong>Hannover, Germany</strong> (federal state
          of Lower Saxony / <em>Niedersachsen</em>), where legally permissible.
        </p>
        <p>
          <strong>Consumer dispute resolution</strong>: indicate whether you are
          willing or obliged to participate in consumer arbitration and provide
          the legally required statement and platform information where applicable.
        </p>
        <p className="text-sm">
          Important: these terms are a template and must be reviewed by German/EU
          legal counsel, especially for B2C scenarios and sector-specific obligations.
        </p>
      </div>
    </div>
  );
}

