import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/sanity/queries";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? product.title : "Product",
    description:
      product?.description ?? "Executive SAP program insights and downloads.",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isClerkConfigured()) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Authentication not configured
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Add real Clerk keys in `.env.local` to enable access to downloads.
        </p>
      </div>
    );
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn();
    return null;
  }

  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const isFree = product.priceType !== "paid";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <div className="text-sm font-semibold text-[var(--accent)]">
          {isFree ? "Free product" : "Paid product"}
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
          {product.title}
        </h1>

        {product.description ? (
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            {product.description}
          </p>
        ) : null}

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="text-sm font-semibold text-[var(--foreground)]">
            Download
          </div>

          <div className="mt-2 text-sm text-[var(--muted)]">
            Downloads require a signed-in account. Newsletter consent is not
            required to download.
          </div>

          {product.downloads && product.downloads.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3">
              {product.downloads.map((d) => (
                <div
                  key={d.downloadId}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[rgba(6,20,39,0.35)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm text-[var(--foreground)]">{d.title}</div>
                  <Link
                    href={`/products/${encodeURIComponent(product.slug)}/download/${encodeURIComponent(d.downloadId)}`}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)]"
                  >
                    Download
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No files attached yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

