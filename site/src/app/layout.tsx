import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NewsletterConsentBanner from "@/components/NewsletterConsentBanner";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";
import { siteAuthAppearance } from "@/lib/clerk/siteAuthAppearance";
import AuthNavControls from "@/components/AuthNavControls";
import FooterSocialLinks from "@/components/FooterSocialLinks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Thomas Reinhardt | Executive SAP Program Insights",
    template: "%s | Thomas Reinhardt",
  },
  description:
    "Executive insights to prevent costly SAP program failures by aligning governance, end-to-end testing, and cutover readiness early.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkReady = isClerkConfigured();

  const appShell = (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(6,20,39,0.78)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(6,20,39,0.6)]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 px-6 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-x-0">
          <a href="/" className="flex items-center gap-3 justify-self-start">
            <img
              src="/branding/logo-header.png"
              alt="Thomas Reinhardt"
              className="h-14 w-auto object-contain object-left sm:h-16 md:h-[4.75rem] lg:h-20"
            />
          </a>

          <nav className="hidden items-center justify-center gap-8 md:flex md:justify-self-center">
            <a
              href="/"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Overview
            </a>
            <a
              href="/products"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Free Downloads
            </a>
            <a
              href="/contact"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center justify-end gap-3 justify-self-end md:col-start-3">
            {clerkReady ? (
              <AuthNavControls />
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <a
                  href="/sign-up"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(47,140,255,0.08)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(47,140,255,0.16)]"
                >
                  Sign up
                </a>
                <a
                  href="/sign-in"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-transparent bg-transparent px-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[rgba(47,140,255,0.08)] hover:text-[var(--foreground)]"
                >
                  Login
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="text-center text-sm text-[var(--muted)] md:flex-1 md:text-left">
            © {new Date().getFullYear()} Thomas Reinhardt. All rights reserved.
          </div>
          <div className="flex shrink-0 justify-center md:flex-1">
            <FooterSocialLinks />
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium md:flex-1 md:justify-end">
            <a
              href="/privacy"
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Terms
            </a>
            <a
              href="/cookies"
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cookies
            </a>
          </div>
        </div>
      </footer>
    </>
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {clerkReady ? (
          <ClerkProvider
            appearance={siteAuthAppearance}
            signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}
            signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}
          >
            {appShell}
            <Suspense fallback={null}>
              <NewsletterConsentBanner />
            </Suspense>
          </ClerkProvider>
        ) : (
          appShell
        )}
      </body>
    </html>
  );
}
