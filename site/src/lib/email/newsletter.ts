import { clerkClient } from "@clerk/nextjs/server";
import { getResendClient, getResendFrom } from "./resendClient";
import { createElement } from "react";
import { createUnsubscribeToken } from "./unsubscribeToken";
import { getProductBySlug } from "@/lib/sanity/queries";
import { getPublicSiteUrl } from "@/lib/siteUrl";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Public links in marketing email: avoid exposing preview deployment hosts. */
const CANONICAL_SITE_ORIGIN = "https://thomas-reinhardt.com";

function emailPublicOrigin(envBase: string): string {
  const explicit = process.env.EMAIL_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (envBase.includes("vercel.app")) return CANONICAL_SITE_ORIGIN;
  return envBase;
}

/** ~3 lines of plain text in typical mail clients (~75–80 chars per line). */
function excerptProductDescription(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const joined = lines.slice(0, 3).join(" ");
  const maxLen = 240;
  if (joined.length <= maxLen) return joined;
  const cut = joined.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + "\u2026";
}

async function getConsentedUserEmails(): Promise<string[]> {
  const client = await clerkClient();

  // Keep this conservative for now. We can extend pagination later.
  const emails: string[] = [];
  const seen = new Set<string>();

  // eslint-disable-next-line no-constant-condition
  for (let page = 0; page < 20; page++) {
    const result = await client.users.getUserList({
      limit: 50,
      offset: page * 50,
    });

    for (const user of result.data) {
      const publicMetadata = (user.publicMetadata ??
        {}) as Record<string, unknown>;
      const consent = Boolean(publicMetadata.newsletterConsent);

      const primaryEmail =
        // The type varies across Clerk versions; use defensive access.
        (user.primaryEmailAddress?.emailAddress as string | undefined) ??
        ((user as any).emailAddresses?.[0]?.emailAddress as
          | string
          | undefined);

      if (consent && primaryEmail && !seen.has(primaryEmail)) {
        seen.add(primaryEmail);
        emails.push(primaryEmail);
      }
    }

    if (result.data.length < 50) break;
  }

  return emails;
}

export type SendNewsletterInput = {
  subject: string;
  text?: string;
  html?: string;
  /** Inline images / files (e.g. CID logo) — same for every recipient. */
  attachments?: Array<{
    filename?: string;
    content?: string | Buffer;
    path?: string;
    content_type?: string;
    content_id?: string;
  }>;
  // Optional per-recipient renderer for personalized links/content.
  renderForRecipient?: (recipientEmail: string) => {
    subject?: string;
    text?: string;
    html?: string;
  };
};

export async function sendGDPRSafeNewsletter(
  input: SendNewsletterInput
): Promise<{ recipients: number }> {
  const resend = getResendClient();
  const from = getResendFrom();
  if (!resend || !from) {
    throw new Error("Resend is not configured (missing API key/from email).");
  }

  const recipients = await getConsentedUserEmails();
  if (recipients.length === 0) return { recipients: 0 };

  for (const recipient of recipients) {
    const personalized = input.renderForRecipient?.(recipient);
    const sendResult = await resend.emails.send({
      from,
      to: recipient,
      subject: personalized?.subject ?? input.subject,
      text: personalized?.text ?? input.text,
      html:
        personalized?.html ??
        input.html ??
        `<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; white-space: pre-wrap;">${
          input.text ? input.text : ""
        }</div>`,
      react:
        !personalized?.html && !input.html && input.text
          ? createElement(
              "div",
              {
                style: {
                  fontFamily: "Arial, Helvetica, sans-serif",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                },
              },
              input.text
            )
          : undefined,
      attachments: input.attachments,
    });

    const resultAny = sendResult as unknown as Record<string, unknown>;
    if (resultAny?.error) {
      const err = resultAny.error as Record<string, unknown>;
      throw new Error(
        (err?.message as string | undefined) ?? "Resend rejected newsletter send."
      );
    }
  }

  return { recipients: recipients.length };
}

export async function sendGDPRSafeFreeProductRelease(input: {
  productTitle: string;
  productSlug: string;
}) {
  const envBase = getPublicSiteUrl();
  const origin = emailPublicOrigin(envBase);
  const encodedSlug = encodeURIComponent(input.productSlug);
  const productUrl = `${origin}/products/${encodedSlug}`;
  const downloadUrl = `${origin}/products/${encodedSlug}/download`;
  const safeTitle = input.productTitle;
  const safeTitleHtml = escapeHtml(safeTitle);
  const currentYear = new Date().getUTCFullYear();

  const product = await getProductBySlug(input.productSlug);
  const excerptRaw = excerptProductDescription(product?.description ?? null);
  const excerptHtml = escapeHtml(
    excerptRaw ||
      "A new resource has been published and is now ready for access."
  );

  return sendGDPRSafeNewsletter({
    subject: `New free download: ${safeTitle}`,
    attachments: [],
    renderForRecipient: (recipientEmail) => {
      const token = createUnsubscribeToken(recipientEmail);
      const unsubscribeUrl = `${origin}/newsletter/unsubscribe?e=${encodeURIComponent(
        token.email
      )}&exp=${token.exp}&sig=${encodeURIComponent(token.sig)}`;
      return {
        text: [
          "Thomas Reinhardt - New free download available",
          "",
          `${safeTitle}`,
          "",
          excerptRaw ||
            "A new resource has been published and is now ready for access.",
          "",
          `Open product page: ${productUrl}`,
          `Start download: ${downloadUrl}`,
          "",
          `Unsubscribe from newsletter emails: ${unsubscribeUrl}`,
        ].join("\n"),
        html: `
          <div style="margin: 0; padding: 0; background-color: #eef2f7;">
            <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
              New free download: ${safeTitleHtml}
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; background-color: #eef2f7;">
              <tr>
                <td align="center" style="padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; border-collapse: separate; background-color: #ffffff; border: 1px solid #dbe4ee; border-radius: 12px; box-shadow: 0 1px 3px rgba(15, 41, 66, 0.06);">
                    <tr>
                      <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #e8eef5; text-align: left;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 0; text-align: left; vertical-align: top;">
                              <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.15; text-align: left;">
                                <div style="margin: 0; color: #0c2744; font-size: 15px; font-weight: 700; letter-spacing: 0.14em;">
                                  THOMAS
                                </div>
                                <div style="margin: 4px 0 0 0; color: #0c2744; font-size: 17px; font-weight: 700; letter-spacing: 0.1em;">
                                  REINHARDT
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 32px 8px 32px;">
                        <p style="margin: 0; color: #3b82f6; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">
                          New free download available
                        </p>
                        <h1 style="margin: 12px 0 0 0; color: #0c2744; font-size: 26px; line-height: 1.25; font-weight: 700;">
                          ${safeTitleHtml}
                        </h1>
                        <p style="margin: 14px 0 0 0; color: #4a5568; font-size: 15px; line-height: 1.55;">
                          ${excerptHtml}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 32px 24px 32px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding: 0 12px 12px 0; vertical-align: middle;">
                              <a href="${downloadUrl}" style="display: inline-block; border-radius: 999px; background-color: #0c4a6e; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 22px;">
                                Start download
                              </a>
                            </td>
                            <td style="padding: 0 0 12px 0; vertical-align: middle;">
                              <a href="${productUrl}" style="display: inline-block; border-radius: 999px; border: 2px solid #0c4a6e; color: #0c4a6e; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; background-color: #ffffff;">
                                Open product page
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 32px 28px 32px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 14px 16px; border: 1px solid #dbe4ee; border-radius: 8px; background-color: #f8fafc; color: #4a5568; font-size: 13px; line-height: 1.55;">
                              You can manage consent in your account, or
                              <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">unsubscribe from newsletter emails</a>.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 32px 28px 32px; border-top: 1px solid #e8eef5; text-align: center;">
                        <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.5;">
                          &copy; ${currentYear} Thomas Reinhardt. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `,
      };
    },
  });
}

