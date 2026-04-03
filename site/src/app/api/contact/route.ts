import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email/sendContactFormEmail";
import { getContactToEmail } from "@/lib/email/contactConfig";
import { getResendClient, getResendFrom } from "@/lib/email/resendClient";

const MAX = {
  name: 120,
  email: 254,
  company: 200,
  subject: 200,
  message: 5000,
} as const;

function trimStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots often fill hidden fields.
  const trap = trimStr(body.website, 200);
  if (trap.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = trimStr(body.name, MAX.name);
  const email = trimStr(body.email, MAX.email);
  const company = trimStr(body.company, MAX.company);
  const subject = trimStr(body.subject, MAX.subject);
  const message = trimStr(body.message, MAX.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and message." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const resend = getResendClient();
  const from = getResendFrom();
  const to = getContactToEmail();
  if (!to) {
    return NextResponse.json(
      {
        error:
          "Contact form is not available right now. Please email us directly.",
      },
      { status: 503 }
    );
  }
  if (!resend || !from) {
    return NextResponse.json(
      {
        error:
          "Contact form is not available right now because email sending is not configured. Please set RESEND_API_KEY and RESEND_FROM_EMAIL (Resend) in your environment.",
      },
      { status: 503 }
    );
  }

  try {
    const resendResult = await sendContactFormEmail({
      name,
      email,
      company,
      subject,
      message,
    });

    const resendResultAny = resendResult as unknown as Record<string, unknown>;
    const resendId =
      (resendResultAny?.id as string | undefined) ??
      (resendResultAny?.data as any)?.id ??
      null;

    console.log("Contact email sent via Resend", {
      to,
      from,
      subject: subject || null,
      resendId,
      resendErrorMessage:
        (resendResultAny?.error as any)?.message ?? null,
    });

    return NextResponse.json({ ok: true, resendId });
  } catch (e) {
    console.error("Contact form send failed:", e);
    const message =
      e instanceof Error
        ? e.message
        : "Could not send your message. Please try again later.";
    return NextResponse.json(
      { error: process.env.NODE_ENV !== "production" ? message : "Could not send your message. Please try again later." },
      { status: 502 }
    );
  }
}
