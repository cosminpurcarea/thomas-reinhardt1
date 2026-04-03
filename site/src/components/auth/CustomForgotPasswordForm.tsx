"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-[rgba(148,163,184,0.4)] bg-[#040d18] px-3 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[rgba(47,140,255,0.55)] focus:ring-1 focus:ring-[rgba(47,140,255,0.35)]";
const labelClass = "mb-1.5 block text-sm font-medium text-[#e8eef4]";

type Step = "request" | "verify";

export default function CustomForgotPasswordForm() {
  const router = useRouter();
  const { signIn } = useSignIn();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!signIn) return;

    setPending(true);
    const { error: createError } = await signIn.create({
      identifier: email.trim(),
    });
    if (createError) {
      setPending(false);
      setLocalError(createError.message ?? "Could not start password reset.");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    setPending(false);

    if (error) {
      setLocalError(error.message ?? "Could not start password reset.");
      return;
    }

    setStep("verify");
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!signIn) return;

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setPending(true);
    const verify = await signIn.resetPasswordEmailCode.verifyCode({
      code: code.trim(),
    });

    if (verify.error) {
      setPending(false);
      setLocalError(verify.error.message ?? "Invalid verification code.");
      return;
    }

    const submit = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: false,
    });

    if (submit.error) {
      setPending(false);
      setLocalError(submit.error.message ?? "Could not reset password.");
      return;
    }

    if (signIn.status === "complete" && signIn.createdSessionId) {
      const fin = await signIn.finalize({
        navigate: ({ decorateUrl, session }) => {
          if (session?.currentTask) {
            setLocalError("Additional steps are required to finish sign-in.");
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
        setPending(false);
        setLocalError(fin.error.message ?? "Could not complete sign-in.");
      }
      return;
    }

    setPending(false);
    setLocalError("Password reset is incomplete. Please try again.");
  };

  if (!signIn) {
    return (
      <div className="text-sm text-[#cbd5e1]" role="status">
        Loading password reset…
      </div>
    );
  }

  if (step === "request") {
    return (
      <div className="w-full">
        <h1 className="text-xl font-semibold tracking-tight text-[#f8fafc]">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-[#e2e8f0]">
          Enter your email and we&apos;ll send you a verification code to reset
          your password.
        </p>

        <form onSubmit={requestReset} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fp-email" className={labelClass}>
              Email address
            </label>
            <input
              id="fp-email"
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {pending ? "Sending code…" : "Send reset code"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#e2e8f0]">
          Remembered your password?{" "}
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

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold tracking-tight text-[#f8fafc]">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-[#e2e8f0]">
        We sent a verification code to{" "}
        <span className="font-medium text-white">{email}</span>.
      </p>

      <form onSubmit={resetPassword} className="mt-6 space-y-4">
        <div>
          <label htmlFor="fp-code" className={labelClass}>
            Verification code
          </label>
          <input
            id="fp-code"
            className={inputClass}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="fp-new-password" className={labelClass}>
            New password
          </label>
          <input
            id="fp-new-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="fp-confirm-password" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="fp-confirm-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {localError ? <p className="text-sm text-[#fca5a5]">{localError}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-[#2f8cff] text-sm font-semibold text-white transition hover:bg-[#1d7aee] disabled:opacity-60"
        >
          {pending ? "Resetting…" : "Reset password"}
        </button>

        <button
          type="button"
          disabled={pending}
          className="text-sm font-medium text-[#5eb0ff] hover:text-[#93c8ff] disabled:opacity-60"
          onClick={async () => {
            setPending(true);
            setLocalError(null);
            await signIn.create({
              identifier: email.trim(),
            });
            const { error } = await signIn.resetPasswordEmailCode.sendCode();
            setPending(false);
            if (error) {
              setLocalError(error.message ?? "Could not resend code.");
            }
          }}
        >
          Resend code
        </button>
      </form>
    </div>
  );
}

