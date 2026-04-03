"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/countries";

export default function AccountProfileClient() {
  const { isLoaded, user } = useUser();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const meta = (user?.unsafeMetadata ?? {}) as Record<string, unknown>;

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [country, setCountry] = useState((meta.country as string | undefined) ?? "");
  const [bio, setBio] = useState((meta.bio as string | undefined) ?? "");

  const email = useMemo(
    () =>
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      "",
    [user]
  );

  useEffect(() => {
    const current = Boolean((user?.publicMetadata as any)?.newsletterConsent);
    setNewsletterConsent(current);
  }, [user]);

  if (!isLoaded || !user) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted)]">
        Loading account…
      </div>
    );
  }

  async function onSave() {
    if (!user) return;
    setSaving(true);
    setStatus("");
    try {
      const unsafe = { ...(user.unsafeMetadata ?? {}) } as Record<string, unknown>;
      delete unsafe.dateOfBirth;
      await user.update({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        unsafeMetadata: {
          ...unsafe,
          country: country.trim(),
          bio: bio.trim(),
        },
      });
      setStatus("Profile updated.");
    } catch {
      setStatus("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveNewsletterConsent() {
    setConsentSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/consent/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: newsletterConsent }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        setStatus(data?.error ?? "Could not update newsletter preference.");
        return;
      }
      setStatus(
        newsletterConsent
          ? "Newsletter preference saved: opted in."
          : "Newsletter preference saved: opted out."
      );
    } catch {
      setStatus("Could not update newsletter preference.");
    } finally {
      setConsentSaving(false);
    }
  }

  async function onDeleteAccount() {
    const confirmed = window.confirm(
      "Delete account permanently?\n\nThis action cannot be undone. Your account and profile data will be removed."
    );
    if (!confirmed) return;

    setDeleting(true);
    setStatus("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        setStatus(data?.error ?? "Could not delete account.");
        return;
      }

      // Account removed; send user to homepage.
      window.location.href = "/";
    } catch {
      setStatus("Could not delete account.");
    } finally {
      setDeleting(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[var(--border)] bg-[rgba(6,20,39,0.55)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]";

  const countryTrimmed = country.trim();
  const countryInList = useMemo(
    () => !countryTrimmed || COUNTRIES.includes(countryTrimmed),
    [countryTrimmed]
  );

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Account information</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Manage your account profile details.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-semibold text-[var(--muted)]">First name</span>
          <input
            className={fieldClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </label>
        <label>
          <span className="text-sm font-semibold text-[var(--muted)]">Last name</span>
          <input
            className={fieldClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </label>
        <label>
          <span className="text-sm font-semibold text-[var(--muted)]">Email</span>
          <input className={fieldClass} value={email} readOnly />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-semibold text-[var(--muted)]">Country</span>
          <select
            className={`${fieldClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Country"
          >
            <option value="">Select country</option>
            {countryTrimmed && !countryInList ? (
              <option value={countryTrimmed}>{countryTrimmed}</option>
            ) : null}
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {countryTrimmed && !countryInList ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Your saved value is not in the standard list. Choose a country from the list to update it.
            </p>
          ) : null}
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-semibold text-[var(--muted)]">Bio</span>
          <textarea
            className={`${fieldClass} min-h-[110px] resize-y`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short biography"
          />
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[rgba(6,20,39,0.45)] p-4">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Newsletter
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose whether you want to receive release emails and newsletter updates.
        </p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={newsletterConsent}
            onChange={(e) => setNewsletterConsent(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Receive newsletter emails
        </label>
        <div className="mt-4">
          <button
            type="button"
            disabled={consentSaving}
            onClick={onSaveNewsletterConsent}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)] disabled:opacity-60"
          >
            {consentSaving ? "Saving..." : "Save newsletter preference"}
          </button>
        </div>
      </div>

      {status ? <p className="mt-4 text-sm text-[var(--foreground)]">{status}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={onDeleteAccount}
          className="inline-flex h-11 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 px-6 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete account"}
        </button>
      </div>
    </div>
  );
}

