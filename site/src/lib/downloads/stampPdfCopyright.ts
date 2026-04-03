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
  const footer = `Copyright Thomas Reinhardt - ${dateText} - ${uniqueId} - ${fullName}`;
  const fontSize = 8;

  for (const page of pdfDoc.getPages()) {
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(footer, fontSize);
    const x = Math.max(24, (width - textWidth) / 2);
    const y = 14;

    page.drawText(footer, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.28, 0.28, 0.28),
      opacity: 0.95,
    });
  }

  return await pdfDoc.save();
}

