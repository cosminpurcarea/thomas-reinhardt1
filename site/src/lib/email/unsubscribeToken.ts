import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return (
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    ""
  );
}

function signPayload(email: string, exp: number): string {
  const secret = getSecret();
  if (!secret) throw new Error("Missing unsubscribe signing secret.");
  return createHmac("sha256", secret).update(`${email}:${exp}`).digest("hex");
}

export function createUnsubscribeToken(email: string): {
  email: string;
  exp: number;
  sig: string;
} {
  const normalized = email.trim().toLowerCase();
  const exp = Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS;
  const sig = signPayload(normalized, exp);
  return { email: normalized, exp, sig };
}

export function verifyUnsubscribeToken(params: {
  email: string;
  exp: number;
  sig: string;
}): boolean {
  const normalized = params.email.trim().toLowerCase();
  if (!normalized || !params.sig || !Number.isFinite(params.exp)) return false;
  if (params.exp < Math.floor(Date.now() / 1000)) return false;

  const expected = signPayload(normalized, params.exp);
  const actualBuf = Buffer.from(params.sig, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (actualBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(actualBuf, expectedBuf);
}

