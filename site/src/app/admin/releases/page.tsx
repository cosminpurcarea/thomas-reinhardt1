import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import AdminSubNav from "@/components/admin/AdminSubNav";
import AdminReleaseEmailPanel from "@/components/admin/AdminReleaseEmailPanel";
import { getAdminSession } from "@/lib/admin/getAdminSession";
import { getAllProductsForAdmin } from "@/lib/sanity/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Release emails",
};

export default async function AdminReleasesPage() {
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

  const products = await getAllProductsForAdmin();
  const freeProducts = products.filter((p) => p.priceType !== "paid");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">Admin</h1>
      <p className="mt-2 text-[var(--muted)]">
        Send free product release emails to consented recipients.
      </p>

      <AdminSubNav />
      <AdminReleaseEmailPanel products={freeProducts} />
    </div>
  );
}

