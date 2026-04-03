"use client";

import { useUser } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

/** Renders children only when Clerk is off (dev) or the user is not signed in. */
export default function ShowWhenSignedOut({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
