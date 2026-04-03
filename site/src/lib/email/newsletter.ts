import { clerkClient } from "@clerk/nextjs/server";
import { getResendClient, getResendFrom } from "./resendClient";
import { createElement } from "react";
import { createUnsubscribeToken } from "./unsubscribeToken";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { getNewsletterLogoForEmail } from "./newsletterLogoAttachment";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  const baseUrl = getPublicSiteUrl();
  const logo = await getNewsletterLogoForEmail();
  const encodedSlug = encodeURIComponent(input.productSlug);
  const productUrl = `${baseUrl}/products/${encodedSlug}`;
  const downloadUrl = `${baseUrl}/products/${encodedSlug}/download`;
  const safeTitle = input.productTitle;
  const safeTitleHtml = escapeHtml(safeTitle);
  const currentYear = new Date().getUTCFullYear();

  return sendGDPRSafeNewsletter({
    subject: `New free download: ${safeTitle}`,
    attachments: logo.attachments,
    renderForRecipient: (recipientEmail) => {
      const token = createUnsubscribeToken(recipientEmail);
      const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?e=${encodeURIComponent(
        token.email
      )}&exp=${token.exp}&sig=${encodeURIComponent(token.sig)}`;
      return {
        text: [
          "Thomas Reinhardt - New free download available",
          "",
          `${safeTitle}`,
          "",
          `Open product page: ${productUrl}`,
          `Start download: ${downloadUrl}`,
          "",
          `Unsubscribe from newsletter emails: ${unsubscribeUrl}`,
        ].join("\n"),
        html: `
          <div style="margin: 0; padding: 28px 14px; background-color: #030c1a;">
            <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
              New free download: ${safeTitleHtml}
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 640px; margin: 0 auto; border-collapse: separate;">
              <tr>
                <td style="padding: 0 0 14px 0; color: #8ca3bd; font-family: Inter, Segoe UI, Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
                  <img
                    src="${logo.imgSrc}"
                    alt="Thomas Reinhardt"
                    width="220"
                    style="display: block; width: 220px; max-width: 100%; height: auto; border: 0;"
                  />
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #1f3552; border-radius: 16px; background: linear-gradient(180deg, #071427 0%, #051126 100%); padding: 28px 24px; font-family: Inter, Segoe UI, Arial, Helvetica, sans-serif;">
                  <p style="margin: 0; color: #8ca3bd; font-size: 13px;">New free download available</p>
                  <h1 style="margin: 10px 0 0 0; color: #f2f7ff; font-size: 28px; line-height: 1.2; font-weight: 700;">
                    ${safeTitleHtml}
                  </h1>
                  <p style="margin: 14px 0 0 0; color: #c8d8ea; font-size: 15px; line-height: 1.6;">
                    A new resource has been published and is now ready for access.
                  </p>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 22px;">
                    <tr>
                      <td style="padding: 0 12px 10px 0;">
                        <a href="${downloadUrl}" style="display: inline-block; border-radius: 999px; background-color: #2f8cff; color: #020b1a; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 20px;">
                          Start download
                        </a>
                      </td>
                      <td style="padding: 0 0 10px 0;">
                        <a href="${productUrl}" style="display: inline-block; border-radius: 999px; border: 1px solid #2a4465; color: #dce9f8; text-decoration: none; font-weight: 600; font-size: 14px; padding: 11px 18px;">
                          Open product page
                        </a>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 18px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 14px; border: 1px solid #1e3551; border-radius: 10px; color: #8ca3bd; font-size: 12px; line-height: 1.5;">
                        You can manage consent in your account, or
                        <a href="${unsubscribeUrl}" style="color: #78b4ff; text-decoration: underline;"> unsubscribe from newsletter emails</a>.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 14px 2px 0 2px; color: #6f86a2; font-family: Inter, Segoe UI, Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.5;">
                  &copy; ${currentYear} Thomas Reinhardt. All rights reserved.
                </td>
              </tr>
            </table>
          </div>
        `,
      };
    },
  });
}

