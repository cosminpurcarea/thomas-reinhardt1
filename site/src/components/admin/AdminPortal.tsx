"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/lib/sanity/queries";
import AdminSubNav from "@/components/admin/AdminSubNav";

function slugifyPreview(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type AdminUserRow = {
  userId: string;
  email: string | null;
  consent: boolean;
  updatedAt: string | null;
};

export default function AdminPortal({
  users,
  products,
}: {
  users: AdminUserRow[];
  products: SanityProduct[];
}) {
  const router = useRouter();
  const freeProducts = products ?? [];

  const [uploadMode, setUploadMode] = useState<"create" | "replace">("create");
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newsletterRequired, setNewsletterRequired] = useState(false);
  const [replaceSlug, setReplaceSlug] = useState(freeProducts[0]?.slug ?? "");
  const [replaceDownloadTitle, setReplaceDownloadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [listingImageFile, setListingImageFile] = useState<File | null>(null);
  const [listingImageAlt, setListingImageAlt] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const slugHint = useMemo(() => {
    if (newSlug.trim()) return slugifyPreview(newSlug);
    if (newTitle.trim()) return slugifyPreview(newTitle);
    return "";
  }, [newSlug, newTitle]);

  const productSlugsKey = useMemo(
    () => freeProducts.map((p) => p.slug).join(","),
    [freeProducts]
  );

  useEffect(() => {
    if (freeProducts.length === 0) return;
    setReplaceSlug((prev) =>
      freeProducts.some((p) => p.slug === prev) ? prev : freeProducts[0].slug
    );
  }, [productSlugsKey]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            Admin
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            GDPR-safe email delivery: only users who opted in receive emails.
          </p>
        </div>
      </div>

      <AdminSubNav />

      <section className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Upload downloadable files
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Files are stored in Sanity and served through your site’s gated download
          routes (not as public direct links). Use a Sanity token with{" "}
          <span className="text-[var(--foreground)]">Editor</span> rights (
          <code className="text-xs text-[var(--foreground)]">SANITY_API_TOKEN</code>
          ).
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Download file: <span className="text-[var(--foreground)]">.pdf</span>,{" "}
          <span className="text-[var(--foreground)]">.zip</span> (max ~40 MB).
          Optional homepage thumbnail: <span className="text-[var(--foreground)]">.png</span>,{" "}
          <span className="text-[var(--foreground)]">.jpg</span>,{" "}
          <span className="text-[var(--foreground)]">.webp</span> — square{" "}
          <span className="text-[var(--foreground)]">1:1</span> recommended (max ~12 MB). The
          main page always shows the <strong className="text-[var(--foreground)]">latest</strong>{" "}
          published product that has this image.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="radio"
              name="uploadMode"
              checked={uploadMode === "create"}
              onChange={() => setUploadMode("create")}
              className="accent-[var(--accent)]"
            />
            New free product
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="radio"
              name="uploadMode"
              checked={uploadMode === "replace"}
              onChange={() => setUploadMode("replace")}
              disabled={freeProducts.length === 0}
              className="accent-[var(--accent)]"
            />
            Replace file on existing product
          </label>
        </div>

        {uploadMode === "create" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--muted)]">
                Title
              </span>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
                placeholder="e.g. Strategy brief Q2"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-[var(--muted)]">
                URL slug (optional)
              </span>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
                placeholder="auto from title if empty"
              />
              {slugHint ? (
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  Will use: <code className="text-[var(--foreground)]">{slugHint}</code>
                </span>
              ) : null}
            </label>
            <label className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                checked={newsletterRequired}
                onChange={(e) => setNewsletterRequired(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--foreground)]">
                Tag for newsletter campaigns (does not block downloads)
              </span>
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--muted)]">
                Description (optional)
              </span>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
              />
            </label>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4 sm:max-w-md">
            <label>
              <span className="text-sm font-semibold text-[var(--muted)]">
                Product
              </span>
              <select
                value={replaceSlug}
                onChange={(e) => setReplaceSlug(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
              >
                {freeProducts.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-[var(--muted)]">
                Download label (optional)
              </span>
              <input
                value={replaceDownloadTitle}
                onChange={(e) => setReplaceDownloadTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
                placeholder="Defaults to file name"
              />
            </label>
          </div>
        )}

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--muted)]">
              Download file
            </span>
            <input
              type="file"
              accept=".pdf,.zip,application/pdf,application/zip"
              onChange={(e) =>
                setUploadFile(e.target.files?.[0] ?? null)
              }
              className="mt-2 block w-full text-sm text-[var(--foreground)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-[var(--accent-strong)]"
            />
          </label>
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--muted)]">
                Homepage thumbnail <span className="font-normal">(1:1, optional)</span>
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                onChange={(e) =>
                  setListingImageFile(e.target.files?.[0] ?? null)
                }
                className="mt-2 block w-full text-sm text-[var(--foreground)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-[var(--accent-strong)]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Thumbnail alt text (optional)
              </span>
              <input
                value={listingImageAlt}
                onChange={(e) => setListingImageAlt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)]"
                placeholder="Describe the image for screen readers"
              />
            </label>
          </div>
        </div>

        {uploadStatus ? (
          <p className="mt-4 text-sm text-[var(--foreground)]">{uploadStatus}</p>
        ) : null}

        <button
          type="button"
          disabled={!uploadFile || uploading}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-black transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={async () => {
            if (!uploadFile) return;
            setUploading(true);
            setUploadStatus("Uploading…");
            try {
              const fd = new FormData();
              fd.append("file", uploadFile);
              if (listingImageFile) {
                fd.append("listingImage", listingImageFile);
              }
              if (listingImageAlt.trim()) {
                fd.append("listingImageAlt", listingImageAlt.trim());
              }
              if (uploadMode === "create") {
                fd.append("intent", "create");
                fd.append("title", newTitle.trim());
                if (newSlug.trim()) fd.append("slug", newSlug.trim());
                fd.append("description", newDescription.trim());
                fd.append(
                  "newsletterRequired",
                  newsletterRequired ? "true" : "false"
                );
              } else {
                fd.append("intent", "replace");
                fd.append("productSlug", replaceSlug);
                if (replaceDownloadTitle.trim()) {
                  fd.append("downloadTitle", replaceDownloadTitle.trim());
                }
              }

              const res = await fetch("/api/admin/upload-product-file", {
                method: "POST",
                body: fd,
              });
              const data = (await res.json().catch(() => null)) as {
                error?: string;
                slug?: string;
                title?: string;
                documentId?: string;
                downloadId?: string;
                assetId?: string;
              } | null;

              if (!res.ok) {
                setUploadStatus(data?.error ?? "Upload failed.");
                return;
              }

              const idLine =
                data?.documentId && data?.downloadId && data?.assetId
                  ? ` Document: ${data.documentId} · Download row: ${data.downloadId} · File asset: ${data.assetId}.`
                  : "";

              setUploadStatus(
                (uploadMode === "create"
                  ? `Published “${data?.title ?? newTitle}” — open /products/${data?.slug ?? slugHint} or download when signed in.`
                  : `Updated file for /products/${data?.slug ?? replaceSlug}/download.`) + idLine
              );
              setUploadFile(null);
              setListingImageFile(null);
              setListingImageAlt("");
              setNewTitle("");
              setNewSlug("");
              setNewDescription("");
              router.refresh();
            } catch {
              setUploadStatus("Upload failed. Check server logs.");
            } finally {
              setUploading(false);
            }
          }}
        >
          {uploading ? "Publishing…" : "Upload & publish"}
        </button>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          User consent status
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">
                  Newsletter consent
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">
                  Updated at
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-b border-[rgba(255,255,255,0.06)]">
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {u.email ?? <span className="text-[var(--muted)]">n/a</span>}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {u.consent ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {u.updatedAt ?? "-"}
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-[var(--muted)]">
                    No users found (or no consent data available yet).
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

