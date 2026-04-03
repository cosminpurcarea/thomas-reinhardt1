import { auth, clerkClient } from "@clerk/nextjs/server";
import { getAdminSession } from "@/lib/admin/getAdminSession";
import {
  getAllProductsForAdmin,
  type SanityProduct,
} from "@/lib/sanity/queries";
import AdminPortal from "@/components/admin/AdminPortal";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session.status === "signed_out") {
    const { redirectToSignIn } = await auth();
    redirectToSignIn();
    return null;
  }

  if (session.status === "forbidden") {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Forbidden
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          You do not have access to this admin area.
        </p>
      </div>
    );
  }

  const clerk = await clerkClient();
  const usersResult = await clerk.users.getUserList({ limit: 50, offset: 0 });
  const users = usersResult.data.map((u: any) => {
    const publicMetadata = (u.publicMetadata ?? {}) as Record<string, unknown>;
    const consent = Boolean(publicMetadata.newsletterConsent);
    const updatedAt = (publicMetadata.newsletterConsentUpdatedAt as
      | string
      | undefined) ?? null;

    return {
      userId: u.id as string,
      email:
        (u.primaryEmailAddress?.emailAddress as string | undefined) ??
        (u.emailAddresses?.[0]?.emailAddress as string | undefined) ??
        null,
      consent,
      updatedAt,
    };
  });

  const products: SanityProduct[] = await getAllProductsForAdmin();
  const freeProducts = products.filter((p) => p.priceType !== "paid");

  return (
    <AdminPortal
      users={users}
      products={freeProducts}
    />
  );
}

