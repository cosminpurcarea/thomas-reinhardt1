import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import CustomForgotPasswordForm from "@/components/auth/CustomForgotPasswordForm";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

export default function ForgotPasswordPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-[radial-gradient(1200px_circle_at_top_right,rgba(47,140,255,0.18),transparent_60%),radial-gradient(900px_circle_at_20%_10%,rgba(0,209,255,0.14),transparent_55%),linear-gradient(180deg,#071a2d_0%,#041021_55%,#03101d_100%)] px-6 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Authentication not configured
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Add real Clerk keys in `.env.local` to enable password reset.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthSplitLayout variant="sign-in">
      <CustomForgotPasswordForm />
    </AuthSplitLayout>
  );
}

