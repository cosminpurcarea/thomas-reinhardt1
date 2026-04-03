import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribeToken";
import { setNewsletterConsentForEmail } from "@/lib/clerk/newsletterConsent";

type UnsubscribePayload = {
  e?: string;
  exp?: number | string;
  sig?: string;
};

export async function POST(req: NextRequest) {
  let payload: UnsubscribePayload | null = null;
  try {
    payload = (await req.json()) as UnsubscribePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(payload?.e ?? "").trim().toLowerCase();
  const exp = Number(payload?.exp ?? 0);
  const sig = String(payload?.sig ?? "");

  if (!verifyUnsubscribeToken({ email, exp, sig })) {
    return NextResponse.json({ error: "Invalid or expired unsubscribe link." }, { status: 400 });
  }

  const updated = await setNewsletterConsentForEmail(email, false);
  if (!updated) {
    return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

