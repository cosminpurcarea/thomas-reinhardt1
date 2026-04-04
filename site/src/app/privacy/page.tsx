export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-[var(--muted)] leading-relaxed">
        <p>
          This Privacy Policy describes how personal data is processed when you
          use this website and related services. It is intended to meet the
          requirements of the EU General Data Protection Regulation (GDPR),
          German Federal Data Protection Act (BDSG), and German Telecommunications
          Digital Services Data Protection Act (TDDDG, formerly TTDSG).
        </p>
        <p>
          <strong>Controller (Art. 4(7) GDPR)</strong>: Thomas Reinhardt,
          based in Lower Saxony (<em>Niedersachsen</em>), Germany. Email:{" "}
          <a
            href="mailto:contact@thomas-reinhardt.com"
            className="text-[var(--foreground)] underline"
          >
            contact@thomas-reinhardt.com
          </a>
          . Please use this address for a full postal address or company details
          if you need them for legal correspondence.
        </p>
        <p>
          <strong>Data Protection Contact / DPO</strong>: For privacy-related
          requests, contact{" "}
          <a
            href="mailto:contact@thomas-reinhardt.com"
            className="text-[var(--foreground)] underline"
          >
            contact@thomas-reinhardt.com
          </a>
          . No data protection officer (<em>Datenschutzbeauftragter</em>) is
          appointed under Art. 37 GDPR unless legally required; this contact
          serves as the responsible point of contact.
        </p>
        <p>
          <strong>Categories of personal data</strong>: account identifiers,
          email address, authentication metadata, download access records,
          consent records, and technical server/security logs.
        </p>
        <p>
          <strong>Purposes and legal bases</strong>: (a) account authentication
          and gated download delivery under Art. 6(1)(b) GDPR (contract/pre-contractual
          measures), (b) IT security, fraud prevention, and service stability
          under Art. 6(1)(f) GDPR (legitimate interests), (c) compliance with
          legal obligations under Art. 6(1)(c) GDPR, and (d) optional newsletter/
          marketing emails only with consent under Art. 6(1)(a) GDPR.
        </p>
        <p>
          <strong>Recipients / processors</strong>: service providers for
          authentication, hosting, content management, and email delivery (for
          example Clerk, Vercel, Sanity, Resend, if enabled in production). Data
          Processing Agreements (Art. 28 GDPR) must be in place with each processor.
        </p>
        <p>
          <strong>International data transfers</strong>: if data is transferred
          to countries outside the EEA, transfers are based on valid safeguards
          (for example EU Standard Contractual Clauses and, where applicable,
          supplementary technical and organizational measures).
        </p>
        <p>
          <strong>Storage periods</strong>: personal data is stored only as long
          as necessary for the stated purposes, legal retention obligations, and
          defense of legal claims. Define concrete retention periods in your
          internal retention policy and reflect them here.
        </p>
        <p>
          <strong>Data subject rights</strong>: you have rights to access
          (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction
          (Art. 18), data portability (Art. 20), objection (Art. 21), and withdrawal
          of consent at any time (Art. 7(3), without affecting prior lawful processing).
        </p>
        <p>
          <strong>Right to complain</strong>: you may lodge a complaint with a
          supervisory authority, especially in the EU Member State of your
          habitual residence, place of work, or place of alleged infringement
          (Art. 77 GDPR). For the federal state of Lower Saxony (
          <em>Niedersachsen</em>), the competent authority is the{" "}
          <strong>
            State Commissioner for Data Protection Lower Saxony
          </strong>{" "}
          (<em>Die Landesbeauftragte für den Datenschutz Niedersachsen</em>),
          Prinzenstraße 5, 30159 Hannover, Germany. Further information:{" "}
          <a
            href="https://www.lfd.niedersachsen.de"
            className="text-[var(--foreground)] underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.lfd.niedersachsen.de
          </a>
          .
        </p>
        <p>
          <strong>Automated decision-making</strong>: unless explicitly stated
          otherwise, no automated decision-making including profiling under
          Art. 22 GDPR is performed.
        </p>
        <p>
          <strong>Security measures</strong>: this service uses technical and
          organizational measures appropriate to risk, including transport
          encryption, access control, and least-privilege principles.
        </p>
        <p className="text-sm text-[var(--muted)]">
          Important: this page is a compliance-ready template but not legal advice.
          You must replace all REPLACE_WITH_* placeholders and align this policy
          with your real data flows, retention rules, and processor contracts.
        </p>
      </div>
    </div>
  );
}

