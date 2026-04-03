import { readFile } from "fs/promises";
import path from "path";
import { getPublicSiteUrl } from "@/lib/siteUrl";

const CID = "tr-newsletter-logo";

export type NewsletterLogoForEmail = {
  /** Pass to Resend `attachments` */
  attachments: Array<{
    filename: string;
    content: Buffer;
    content_type: string;
    content_id: string;
  }>;
  /** Use as `<img src="...">` */
  imgSrc: string;
};

/**
 * Inline logo so email clients do not need to fetch from a URL (fixes broken
 * images when NEXT_PUBLIC_SITE_URL was unset or pointed at localhost).
 */
export async function getNewsletterLogoForEmail(): Promise<NewsletterLogoForEmail> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "branding",
      "newsletter-logo.png"
    );
    const content = await readFile(filePath);
    return {
      attachments: [
        {
          filename: "newsletter-logo.png",
          content,
          content_type: "image/png",
          content_id: CID,
        },
      ],
      imgSrc: `cid:${CID}`,
    };
  } catch {
    const base = getPublicSiteUrl();
    return {
      attachments: [],
      imgSrc: `${base}/branding/newsletter-logo.png`,
    };
  }
}
