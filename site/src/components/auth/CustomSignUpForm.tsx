"use client";

/**
 * Custom sign-up: confirm password + terms (with links). Passes `legalAccepted` to Clerk when the box is checked.
 * In the Clerk Dashboard, enable Compliance → Legal (express consent) and attach your documents so Clerk accepts `legalAccepted`.
 * Enable Google, LinkedIn, and X under SSO connections if you use those OAuth buttons.
 */
import { useAuth, useClerk, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-[rgba(148,163,184,0.4)] bg-[#040d18] px-3 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[rgba(47,140,255,0.55)] focus:ring-1 focus:ring-[rgba(47,140,255,0.35)]";
const labelClass = "mb-1.5 block text-sm font-medium text-[#e8eef4]";
const oauthBtnClass =
  "flex h-11 flex-1 items-center justify-center rounded-xl border border-[rgba(203,213,225,0.35)] bg-[rgba(248,250,252,0.07)] text-sm font-semibold text-[#f8fafc] transition hover:bg-[rgba(248,250,252,0.12)] disabled:cursor-not-allowed disabled:opacity-50";

type OAuthStrategy = "oauth_google" | "oauth_linkedin_oidc" | "oauth_x";

export default function CustomSignUpForm() {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { signUp, errors } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [localError, setLocalError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const redirectUrls = useCallback(() => {
    const base = origin || "";
    return {
      redirectUrl: `${base}/sso-callback`,
      redirectCallbackUrl: `${base}/sso-callback`,
    };
  }, [origin]);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, router]);

  const oauth = async (strategy: OAuthStrategy) => {
    setLocalError(null);
    if (!termsAccepted) {
      setLocalError(
        "Please accept the Terms, Privacy Policy, and Cookie Policy to continue.",
      );
      return;
    }
    if (!signUp) return;
    setPending(true);
    const { redirectUrl, redirectCallbackUrl } = redirectUrls();
    const { error } = await signUp.sso({
      strategy,
      redirectUrl,
      redirectCallbackUrl,
      legalAccepted: true,
    });
    setPending(false);
    if (error) {
      setLocalError(error.message ?? "Could not start social sign-up.");
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!termsAccepted) {
      setLocalError(
        "Please accept the Terms, Privacy Policy, and Cookie Policy to continue.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (!signUp) return;
    setPending(true);
    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      legalAccepted: true,
    });
    if (error) {
      setPending(false);
      setLocalError(error.message ?? "Sign-up failed.");
      return;
    }
    const send = await signUp.verifications.sendEmailCode();
    setPending(false);
    if (send.error) {
      setLocalError(send.error.message ?? "Could not send verification code.");
      return;
    }
    setStep("verify");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!signUp) return;
    setPending(true);
    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (error) {
      setPending(false);
      setLocalError(error.message ?? "Invalid code.");
      return;
    }
    if (signUp.status === "complete") {
      const fin = await signUp.finalize({
        navigate: ({ decorateUrl, session }) => {
          if (session?.currentTask) {
            setLocalError("Additional steps required by your organization.");
            setPending(false);
            return;
          }
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
      if (fin.error) {
        setLocalError(fin.error.message ?? "Could not complete sign-up.");
      }
    } else {
      setLocalError("Verification incomplete. Try again or request a new code.");
    }
    setPending(false);
  };

  if (!clerk.loaded || !signUp) {
    return (
      <div className="text-sm text-[#cbd5e1]" role="status">
        Loading sign-up…
      </div>
    );
  }

  if (isSignedIn) {
    return null;
  }

  if (step === "verify") {
    return (
      <div className="w-full">
        <h1 className="text-xl font-semibold tracking-tight text-[#f8fafc]">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-[#e2e8f0]">
          Enter the verification code we sent to{" "}
          <span className="font-medium text-white">{email}</span>.
        </p>
        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          <div>
            <label htmlFor="verify-code" className={labelClass}>
              Verification code
            </label>
            <input
              id="verify-code"
              className={inputClass}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          {localError ? (
            <p className="text-sm text-[#fca5a5]">{localError}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center rounded-full bg-[#2f8cff] text-sm font-semibold text-white transition hover:bg-[#1d7aee] disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Continue"}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-[#5eb0ff] hover:underline"
            onClick={async () => {
              setPending(true);
              await signUp.verifications.sendEmailCode();
              setPending(false);
            }}
          >
            Resend code
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold tracking-tight text-[#f8fafc]">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-[#e2e8f0]">
        Welcome! Please fill in the details to get started.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className={oauthBtnClass}
          disabled={pending}
          onClick={() => oauth("oauth_google")}
          aria-label="Continue with Google"
        >
          Google
        </button>
        <button
          type="button"
          className={oauthBtnClass}
          disabled={pending}
          onClick={() => oauth("oauth_linkedin_oidc")}
          aria-label="Continue with LinkedIn"
        >
          LinkedIn
        </button>
        <button
          type="button"
          className={oauthBtnClass}
          disabled={pending}
          onClick={() => oauth("oauth_x")}
          aria-label="Continue with X"
        >
          X
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[rgba(148,163,184,0.35)]" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
          <span className="bg-[#061427] px-3 text-[#e2e8f0]">or</span>
        </div>
      </div>

      <form onSubmit={submitPassword} className="space-y-4">
        <div>
          <label htmlFor="su-email" className={labelClass}>
            Email address
          </label>
          <input
            id="su-email"
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.fields?.emailAddress?.message ? (
            <p className="mt-1 text-sm text-[#fca5a5]">
              {errors.fields.emailAddress.message}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="su-password" className={labelClass}>
            Password
          </label>
          <input
            id="su-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="su-confirm" className={labelClass}>
            Confirm password
          </label>
          <input
            id="su-confirm"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[#e2e8f0]">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-[rgba(148,163,184,0.5)] bg-[#040d18] text-[#2f8cff] focus:ring-[rgba(47,140,255,0.45)]"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-semibold text-[#5eb0ff] underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>
            ,{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#5eb0ff] underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            , and{" "}
            <Link
              href="/cookies"
              className="font-semibold text-[#5eb0ff] underline-offset-2 hover:underline"
            >
              Cookie Policy
            </Link>
            .
          </span>
        </label>

        {localError ? (
          <p className="text-sm text-[#fca5a5]">{localError}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-[#2f8cff] text-sm font-semibold text-white transition hover:bg-[#1d7aee] disabled:opacity-60"
        >
          {pending ? "Please wait…" : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#e2e8f0]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-[#5eb0ff] hover:text-[#93c8ff]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
