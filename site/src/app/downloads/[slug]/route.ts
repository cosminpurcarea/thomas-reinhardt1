import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

// Placeholder download route. Will be replaced with private streaming + consent gating.
export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!isClerkConfigured()) {
    return new NextResponse("Authentication not configured.", { status: 503 });
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn();
  }

  const safeFilename = `${slug}.txt`.replaceAll('"', "");
  const body = [
    `Downloaded: ${slug}`,
    `Generated content (placeholder).`,
    `Next step: stream the actual private file from Sanity.`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
    },
  });
}

