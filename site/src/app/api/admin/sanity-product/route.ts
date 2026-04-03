import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";
import { getSanityWriteClient } from "@/lib/sanity/client";

function isAdminEmail(email: string, adminEmailsRaw: string | undefined) {
  if (!adminEmailsRaw) return false;
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "Clerk not configured." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email =
    (user.primaryEmailAddress?.emailAddress as string | undefined) ??
    ((user as { emailAddresses?: { emailAddress?: string }[] }).emailAddresses?.[0]
      ?.emailAddress as string | undefined);

  if (!email || !isAdminEmail(email, adminEmailsRaw)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json(
      { error: "Sanity write not configured." },
      { status: 503 }
    );
  }

  let body: { documentId?: string; action?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const documentId = String(body.documentId ?? "").trim();
  const action = String(body.action ?? "").trim();

  if (!documentId || !/^[a-zA-Z0-9._-]+$/.test(documentId)) {
    return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
  }

  const existing = await client.fetch<{ _id: string; _type: string } | null>(
    `*[_id == $id && _type == "product"][0]{ _id, _type }`,
    { id: documentId }
  );
  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  try {
    if (action === "unpublish") {
      await client.patch(documentId).set({ published: false }).commit();
    } else if (action === "publish") {
      await client.patch(documentId).set({ published: true }).commit();
    } else if (action === "delete") {
      await client.delete(documentId);
    } else {
      return NextResponse.json(
        { error: 'Unknown action. Use "publish", "unpublish", or "delete".' },
        { status: 400 }
      );
    }

    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return NextResponse.json({ ok: true, action });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sanity mutation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
