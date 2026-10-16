import Link from "next/link";
import { Suspense } from "react";
import { SellerNav } from "@/components/seller/seller-nav";
import { Container } from "@/components/ui/container";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Container className="max-w-4xl space-y-6">
        <div>
          <Link
            href="/profile"
            className="text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            ← Profile
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold text-brand-dark">
            Seller dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Store, offers, and customer orders.
          </p>
        </div>

        <Suspense fallback={<div className="h-10 animate-pulse rounded-full bg-brand/10" />}>
          <SellerNav />
        </Suspense>

        {children}
      </Container>
    </main>
  );
}
