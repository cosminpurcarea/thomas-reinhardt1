import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth: admin, gated downloads catalogue (/products), file downloads, admin APIs.
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkConfigured =
  publishableKey &&
  !publishableKey.includes("YOUR_") &&
  !publishableKey.includes("YOUR");

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";

const middleware = clerkConfigured
  ? clerkMiddleware(
      async (auth, req) => {
        const authState = await auth();

        if (!authState.userId) {
          return authState.redirectToSignIn({ returnBackUrl: req.url });
        }

        return NextResponse.next();
      },
      { signInUrl, signUpUrl },
    )
  : // If Clerk isn't configured yet (e.g. local placeholders), don't crash middleware.
    // Routes that require auth will handle it via their own checks.
    (_req: any) => NextResponse.next();

export default middleware as any;

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/api/account/:path*",
    "/downloads/:path*",
    "/products",
    "/products/:slug",
    "/products/:slug/download",
    "/products/:slug/download/:downloadId",
    "/api/admin/:path*",
    "/api/consent/:path*",
  ],
};

