import { Resend } from "resend";

function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  return value.includes("YOUR_") || value.includes("YOUR@");
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (isPlaceholder(apiKey)) return null;

  return new Resend(apiKey);
}

export function getResendFrom() {
  const from = process.env.RESEND_FROM_EMAIL;
  if (isPlaceholder(from)) return null;
  return from!;
}

