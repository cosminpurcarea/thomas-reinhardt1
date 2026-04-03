import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Metadata } from "next";
import AdminSubNav from "@/components/admin/AdminSubNav";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import { getAdminSession } from "@/lib/admin/getAdminSession";
import { getAllProductsForAdmin } from "@/lib/sanity/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Published files",
};

export default async function AdminProductsPage() {
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

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">Admin</h1>
      <p className="mt-2 text-[var(--muted)]">
        Products and files in Sanity — same catalogue as{" "}
        <Link href="/products" className="text-[var(--accent)] underline">
          Free Downloads
        </Link>
        .
      </p>

      <AdminSubNav />

      <h2 className="mb-1 mt-2 text-xl font-semibold text-[var(--foreground)]">
        Published files
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Lists every product in Sanity (including unpublished).{" "}
        <Link href="/products" className="text-[var(--accent)] underline">
          Free Downloads
        </Link>{" "}
        only shows live items.
      </p>
      <AdminProductsTable products={products} />
    </div>
  );
}
