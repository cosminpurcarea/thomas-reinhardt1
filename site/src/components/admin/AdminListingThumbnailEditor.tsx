"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type Variant = "hero" | "compact";

export default function AdminListingThumbnailEditor({
  isAdmin,
  productSlug,
  variant,
  className,
  children,
}: {
  isAdmin: boolean;
  productSlug: string;
  variant: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !isAdmin) return;
      if (file.size > 4 * 1024 * 1024) {
        setMessage("Max ~4 MB on this host. Use a smaller image.");
        return;
      }
      setUploading(true);
      setMessage(null);
      try {
        const fd = new FormData();
        fd.append("productSlug", productSlug);
        fd.append("listingImage", file);
        const res = await fetch("/api/admin/update-listing-image", {
          method: "POST",
          body: fd,
        });
        const raw = await res.text();
        let err: string | undefined;
        try {
          const data = raw ? (JSON.parse(raw) as { error?: string }) : null;
          err = data?.error;
        } catch {
          err = undefined;
        }
        if (!res.ok) {
          setMessage(
            err?.trim() ||
              (res.status === 413
                ? "Upload too large for the server."
                : "Upload failed.")
          );
          return;
        }
        setMessage(null);
        router.refresh();
      } catch {
        setMessage("Upload failed. Try again.");
      } finally {
        setUploading(false);
      }
    },
    [isAdmin, productSlug, router]
  );

  if (!isAdmin) {
    return <div className={className}>{children}</div>;
  }

  const hint =
    variant === "hero"
      ? "Admin: tap to upload or replace thumbnail"
      : "Admin: tap thumbnail to change";

  const inner = (
    <div
      className={`${className ?? ""} ${variant === "compact" ? "ring-2 ring-dashed ring-[var(--accent)]/35" : ""}`.trim()}
    >
      <label
        className="relative block h-full min-h-[4rem] w-full cursor-pointer"
        title={hint}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          className="sr-only"
          onChange={onFile}
          disabled={uploading}
          aria-label={hint}
        />
        {children}
        {uploading ? (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/55 text-[10px] font-semibold uppercase tracking-wide text-white md:text-xs">
            Uploading…
          </div>
        ) : null}
        {variant === "hero" ? (
          <span className="pointer-events-none absolute inset-x-1 bottom-1 z-[4] rounded-md bg-black/70 px-1.5 py-1 text-center text-[9px] font-semibold leading-tight text-white md:inset-x-2 md:bottom-2 md:text-[10px]">
            Admin · tap to replace image
          </span>
        ) : null}
      </label>
    </div>
  );

  return (
    <div className="relative w-full">
      {inner}
      {message ? (
        <p
          className="mt-1.5 text-center text-[10px] leading-tight text-red-300 md:text-xs"
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
