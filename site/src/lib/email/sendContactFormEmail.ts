import { getResendClient, getResendFrom } from "./resendClient";
import { getContactToEmail } from "./contactConfig";

export type ContactFormPayload = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

export async function sendContactFormEmail(payload: ContactFormPayload) {
  const resend = getResendClient();
  const from = getResendFrom();
  const to = getContactToEmail();

  if (!resend || !from || !to) {
    throw new Error("Contact email is not configured.");
  }

  const subjectLine =
    payload.subject.trim() ||
    `Website contact: ${payload.name.trim() || "Visitor"}`;

  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    "",
    "Message:",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: subjectLine,
    text,
  });

  // Resend may return a "success-shaped" response containing an `error` object.
  // Treat that as a failure so callers can show the user a correct message.
  const resultAny = result as unknown as Record<string, unknown>;
  if (resultAny?.error) {
    const err = resultAny.error as Record<string, unknown>;
    const message =
      (err?.message as string | undefined) ||
      "Resend rejected the email request.";
    throw new Error(message);
  }

  return result;
}
