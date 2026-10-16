"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/bookings", label: "Bookings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin panel" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          link.exact === true
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white shadow-sm shadow-brand/25"
                : "border border-brand/10 bg-surface/90 text-brand-dark hover:border-brand/25 hover:bg-surface"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
