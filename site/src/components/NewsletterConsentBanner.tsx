"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const STORAGE_DECIDED_KEY = "tr_newsletter_consent_decided";
const STORAGE_CONSENT_KEY = "tr_newsletter_consent";
const COOKIE_KEY = "tr_newsletter_consent";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function setConsentCookie(consent: boolean) {
  const maxAgeSeconds = 60 * 60 * 24 * 180; // 180 days
  const secure = window.location.protocol === "https:";
  document.cookie = `${COOKIE_KEY}=${
    consent ? "1" : "0"
  }; Max-Age=${maxAgeSeconds}; path=/; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export default function NewsletterConsentBanner() {
  const { isSignedIn, isLoaded } = useAuth();
  const searchParams = useSearchParams();

  const [decided, setDecided] = useState(false);
  const [consent, setConsent] = useState(false);
  const [synced, setSynced] = useState(false);
  const syncRequestedRef = useRef(false);

  useEffect(() => {
    const manageMode = new URLSearchParams(window.location.search).get(
      "consent"
    );

    const decidedRaw = localStorage.getItem(STORAGE_DECIDED_KEY);
    const consentRaw = localStorage.getItem(STORAGE_CONSENT_KEY);

    const cookieRaw = readCookie(COOKIE_KEY);
    const cookieConsent = cookieRaw === "1";

    if (decidedRaw === "true") {
      setDecided(true);
      setConsent(consentRaw === "true" || cookieConsent);
      if (manageMode === "manage") setDecided(false);
      return;
    }

    if (cookieRaw === "1" || cookieRaw === "0") {
      setDecided(true);
      setConsent(cookieConsent);
      localStorage.setItem(STORAGE_DECIDED_KEY, "true");
      localStorage.setItem(STORAGE_CONSENT_KEY, cookieConsent ? "true" : "false");
      if (manageMode === "manage") setDecided(false);
      return;
    }

    setDecided(false);
    setConsent(false);
  }, []);

  /** Re-open banner when user opens e.g. /cookies?consent=manage (also after client navigation). */
  useEffect(() => {
    if (searchParams.get("consent") === "manage") {
      setDecided(false);
    }
  }, [searchParams]);

  const showBanner = useMemo(() => !decided, [decided]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!decided) return;
    if (showBanner) return;
    if (syncRequestedRef.current) return;
    syncRequestedRef.current = true;
    const stored = localStorage.getItem(STORAGE_CONSENT_KEY) === "true";
    void fetch("/api/consent/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: stored }),
    })
      .then(() => setSynced(true))
      .catch(() => {});
  }, [decided, isLoaded, isSignedIn, showBanner]);

  const finalizeConsent = useCallback(
    (consentValue: boolean) => {
      try {
        localStorage.setItem(STORAGE_DECIDED_KEY, "true");
        localStorage.setItem(
          STORAGE_CONSENT_KEY,
          consentValue ? "true" : "false"
        );
        setConsentCookie(consentValue);
        setConsent(consentValue);

        if (isSignedIn) {
          syncRequestedRef.current = true;
          void fetch("/api/consent/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consent: consentValue }),
          })
            .then(() => setSynced(true))
            .catch(() => {});
        }
      } catch {
        // Storage or cookie may fail in locked-down browsers; still close banner.
      } finally {
        setDecided(true);
      }
    },
    [isSignedIn]
  );

  if (!isLoaded) {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4"
      role="dialog"
      aria-modal="false"
      aria-labelledby="newsletter-consent-title"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[rgba(6,20,39,0.96)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div
              id="newsletter-consent-title"
              className="text-sm font-semibold text-[var(--foreground)]"
            >
              Newsletter consent (GDPR)
            </div>
            <div className="mt-1 text-sm text-[var(--muted)] leading-relaxed">
              Optional: receive newsletters and product emails from us. This
              choice does not affect your ability to download files (downloads
              only require a signed-in account). You can withdraw consent at
              any time via this banner. Read our{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies" className="underline">
                Cookies
              </Link>
              .
            </div>

            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--muted)]">
                I agree to receive newsletter/emails and related processing
                for delivery.
              </span>
            </label>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[14rem] md:w-56">
            <button
              type="button"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                finalizeConsent(consent);
              }}
            >
              Save preferences
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-transparent px-5 py-2.5 text-center text-sm font-semibold text-[var(--muted)] transition hover:bg-[rgba(47,140,255,0.08)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                finalizeConsent(false);
              }}
            >
              Continue without newsletter
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-[var(--muted)]">
          {synced ? "Preferences saved." : "You can change this later."}
        </div>
      </div>
    </div>
  );
}
