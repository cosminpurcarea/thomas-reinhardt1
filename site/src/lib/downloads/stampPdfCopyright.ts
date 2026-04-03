import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type StampInput = {
  pdfBytes: Uint8Array;
  fullName: string;
  downloadedAt: Date;
  uniqueId: string;
};

function formatDateUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss} UTC`;
}

export async function stampPdfCopyright({
  pdfBytes,
  fullName,
  downloadedAt,
  uniqueId,
}: StampInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const dateText = formatDateUtc(downloadedAt);
  const line1 = `Copyright Thomas Reinhardt — ${dateText}`;
  const line2 = `${uniqueId} — ${fullName}`;
  const fontSize = 8;
  const lineGap = 10;

  const drawOpts = {
    size: fontSize,
    font,
    color: rgb(0.28, 0.28, 0.28),
    opacity: 0.95,
  };

  for (const page of pdfDoc.getPages()) {
    const { width } = page.getSize();
    const yBottom = 14;
    const yTop = yBottom + lineGap;

    const w1 = font.widthOfTextAtSize(line1, fontSize);
    const w2 = font.widthOfTextAtSize(line2, fontSize);
    const x1 = Math.max(24, (width - w1) / 2);
    const x2 = Math.max(24, (width - w2) / 2);

    page.drawText(line1, { x: x1, y: yTop, ...drawOpts });
    page.drawText(line2, { x: x2, y: yBottom, ...drawOpts });
  }

  return await pdfDoc.save();
}

