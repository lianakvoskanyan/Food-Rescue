"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/seller", label: "Overview", exact: true },
  { href: "/seller/store", label: "Store" },
  { href: "/seller/offers", label: "Offers" },
  { href: "/seller/bookings", label: "Orders" },
];

export function SellerNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seller dashboard" className="flex flex-wrap gap-2">
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
                ? "bg-brand text-white"
                : "bg-surface text-brand-dark hover:bg-brand/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
