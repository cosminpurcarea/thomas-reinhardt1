import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

export async function POST(req: NextRequest) {
  if (!isClerkConfigured()) {
    return new NextResponse("Clerk not configured.", { status: 503 });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete account right now." },
      { status: 502 }
    );
  }
}

