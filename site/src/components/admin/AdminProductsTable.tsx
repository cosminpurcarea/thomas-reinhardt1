import type { SanityProduct } from "@/lib/sanity/queries";
import {
  getSanityClient,
  getSanityEnvIssues,
  getSanityWriteClient,
} from "@/lib/sanity/client";
import AdminProductsListClient from "@/components/admin/AdminProductsListClient";

export default function AdminProductsTable({
  products,
}: {
  products: SanityProduct[];
}) {
  const readOk = Boolean(getSanityClient());
  const writeOk = Boolean(getSanityWriteClient());
  const envIssues = getSanityEnvIssues();
  const canMutate = readOk && writeOk;

  return (
    <div className="space-y-4">
      {(!readOk || !writeOk) && envIssues.length > 0 ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--foreground)]">
          <div className="font-semibold text-amber-100/95">
            Sanity connection blocked
          </div>
          <p className="mt-2 text-[var(--muted)]">
            The token alone is not enough: the app needs a valid{" "}
            <strong className="text-[var(--foreground)]">project id</strong>,{" "}
            <strong className="text-[var(--foreground)]">dataset name</strong>, and{" "}
            <strong className="text-[var(--foreground)]">API token</strong> that all belong to the{" "}
            <em>same</em> Sanity project.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--foreground)]">
            {envIssues.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--muted)]">
            After editing <code className="text-[var(--foreground)]">.env.local</code>, restart{" "}
            <code className="text-[var(--foreground)]">next dev</code>.{" "}
            <code className="text-[var(--foreground)]">NEXT_PUBLIC_*</code> values are baked in at
            startup.
          </p>
        </div>
      ) : null}

      {!canMutate && envIssues.length === 0 ? (
        <p className="text-sm text-amber-200/90">
          Actions (unpublish / delete) require a working Sanity read client and{" "}
          <code className="text-xs">SANITY_API_TOKEN</code> with write access.
        </p>
      ) : null}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-[var(--muted)]">
          No products in Sanity yet. After you configure write access, use{" "}
          <strong>Dashboard → Upload &amp; publish</strong> or create documents in Sanity Studio.
        </div>
      ) : (
        <AdminProductsListClient products={products} canMutate={canMutate} />
      )}
    </div>
  );
}
