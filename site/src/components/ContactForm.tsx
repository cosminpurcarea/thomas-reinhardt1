"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        resendId?: string | null;
      };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong.");
        return;
      }

      // Helpful while debugging delivery issues.
      if (process.env.NODE_ENV !== "production") {
        console.log("Contact form submitted", { resendId: data.resendId ?? null });
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]";

  const labelClass = "text-sm font-medium text-[var(--foreground)]";

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
        role="status"
      >
        <p className="text-lg font-semibold text-[var(--foreground)]">
          Message sent
        </p>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          Thank you for getting in touch. We will respond as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8"
      noValidate
      suppressHydrationWarning
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-1">
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            className={fieldClass}
            suppressHydrationWarning
          />
        </div>
        <div className="md:col-span-1">
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={fieldClass}
            suppressHydrationWarning
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="contact-company" className={labelClass}>
            Company <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={200}
            className={fieldClass}
            suppressHydrationWarning
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="contact-subject" className={labelClass}>
            Subject <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            maxLength={200}
            className={fieldClass}
            placeholder="e.g. SAP program advisory"
            suppressHydrationWarning
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="contact-message" className={labelClass}>
            Message <span className="text-[var(--accent)]">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            maxLength={5000}
            className={`${fieldClass} resize-y min-h-[140px]`}
            placeholder="How can we help?"
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Honeypot — leave hidden; do not remove */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          suppressHydrationWarning
        />
      </div>

      <p className="mt-4 text-xs text-[var(--muted)] leading-relaxed">
        By submitting this form, you agree that we use your details to respond to
        your inquiry. See our{" "}
        <a href="/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      {errorMessage ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(0,0,0,0.05)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
