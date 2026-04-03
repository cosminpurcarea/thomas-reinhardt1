import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { setNewsletterConsentForUserId } from "@/lib/clerk/newsletterConsent";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

export async function POST(req: NextRequest) {
  try {
    if (!isClerkConfigured()) {
      return NextResponse.json(
        { error: "Clerk is not configured on the server." },
        { status: 503 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      // ignore invalid JSON and fall back to default behavior below
    }

    const consentValue =
      typeof (payload as { consent?: unknown } | null)?.consent === "boolean"
        ? (payload as { consent: boolean }).consent
        : false;

    await setNewsletterConsentForUserId(userId, consentValue);

    return NextResponse.json({ ok: true, consent: consentValue });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not update newsletter preference.";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Could not update newsletter preference.",
      },
      { status: 500 }
    );
  }
}

