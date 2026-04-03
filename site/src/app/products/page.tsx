import { auth } from "@clerk/nextjs/server";
import { getProducts } from "@/lib/sanity/queries";
import ProductsCatalogueClient from "@/components/ProductsCatalogueClient";
import { isClerkConfigured } from "@/lib/clerk/isClerkConfigured";

// CMS content must be fetched on each request; static build would cache an empty list.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
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

  const products = await getProducts();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">
        Free Downloads
      </h1>
      <p className="mt-3 text-[var(--muted)] leading-relaxed">
        You need a free account and must be signed in to download files.
        Newsletter consent is optional and only applies if you choose to receive
        marketing emails—it is not required for downloads.
      </p>

      <ProductsCatalogueClient products={products} />
    </div>
  );
}

