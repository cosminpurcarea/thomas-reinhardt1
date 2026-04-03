"use client";

import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-[rgba(148,163,184,0.4)] bg-[#040d18] px-3 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[rgba(47,140,255,0.55)] focus:ring-1 focus:ring-[rgba(47,140,255,0.35)]";
const labelClass = "mb-1.5 block text-sm font-medium text-[#e8eef4]";
const oauthBtnClass =
  "flex h-11 flex-1 items-center justify-center rounded-xl border border-[rgba(203,213,225,0.35)] bg-[rgba(248,250,252,0.07)] text-sm font-semibold text-[#f8fafc] transition hover:bg-[rgba(248,250,252,0.12)] disabled:cursor-not-allowed disabled:opacity-50";

type OAuthStrategy = "oauth_google" | "oauth_linkedin_oidc" | "oauth_x";

export default function CustomSignInForm() {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { signIn, errors } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const identifierError = errors.fields?.identifier?.message ?? null;
  const passwordError = errors.fields?.password?.message ?? null;
  const combinedError =
    localError && localError !== identifierError && localError !== passwordError
      ? localError
      : null;

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
    if (!isSignedIn) return;
    router.replace("/");
  }, [isSignedIn, router]);

  const oauth = async (strategy: OAuthStrategy) => {
    setLocalError(null);
    if (!signIn) return;

    setPending(true);
    const { redirectUrl, redirectCallbackUrl } = redirectUrls();
    const { error } = await signIn.sso({
      strategy,
      redirectUrl,
      redirectCallbackUrl,
    });
    setPending(false);

    if (error) {
      setLocalError(error.message ?? "Could not start social sign in.");
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!signIn) return;
    setPending(true);

    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });

    if (error) {
      setPending(false);
      setLocalError(error.message ?? "Sign in failed.");
      return;
    }

    if (signIn.status === "complete") {
      const fin = await signIn.finalize({
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
        setLocalError(fin.error.message ?? "Could not complete sign in.");
      }

      setPending(false);
      return;
    }

    // For MFA/other flows, we don't implement an extra step UI yet.
    setPending(false);
    setLocalError(
      "Additional verification is required. Please sign in using the default Clerk flow or complete the verification step in the next page.",
    );
  };

  if (isSignedIn) {
    return (
      <div className="text-sm text-[#cbd5e1]" role="status">
        Redirecting…
      </div>
    );
  }

  if (!clerk.loaded || !signIn) {
    return (
      <div className="text-sm text-[#cbd5e1]" role="status">
        Loading sign-in…
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold tracking-tight text-[#f8fafc]">Sign in</h1>
      <p className="mt-2 text-sm text-[#e2e8f0]">
        Welcome back! Please sign in to continue.
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
          <label htmlFor="si-email" className={labelClass}>
            Email address
          </label>
          <input
            id="si-email"
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.fields?.identifier?.message ? (
            <p className="mt-1 text-sm text-[#fca5a5]">
              {errors.fields.identifier.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="si-password" className={labelClass}>
            Password
          </label>
          <input
            id="si-password"
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.fields?.password?.message ? (
            <p className="mt-1 text-sm text-[#fca5a5]">
              {errors.fields.password.message}
            </p>
          ) : null}
          <div className="mt-2 text-right">
            <a
              href="/sign-in/forgot-password"
              className="text-sm font-medium text-[#5eb0ff] hover:text-[#93c8ff]"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {combinedError ? (
          <p className="text-sm text-[#fca5a5]">{combinedError}</p>
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
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#5eb0ff] hover:text-[#93c8ff]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

