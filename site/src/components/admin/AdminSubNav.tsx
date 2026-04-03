"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSubNav() {
  const pathname = usePathname() ?? "";
  const dashboard = pathname === "/admin";
  const files = pathname.startsWith("/admin/products");
  const releases = pathname.startsWith("/admin/releases");

  const linkClass = (active: boolean) =>
    `pb-2 text-sm font-semibold transition ${
      active
        ? "border-b-2 border-[var(--accent)] text-[var(--foreground)]"
        : "border-b-2 border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <nav className="mb-8 flex gap-8 border-b border-[var(--border)]">
      <Link href="/admin" className={linkClass(dashboard)}>
        Dashboard
      </Link>
      <Link href="/admin/products" className={linkClass(files)}>
        Published files
      </Link>
      <Link href="/admin/releases" className={linkClass(releases)}>
        Release emails
      </Link>
    </nav>
  );
}
