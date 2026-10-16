import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Container } from "@/components/ui/container";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Container className="max-w-5xl space-y-6">
        <div>
          <Link
            href="/profile"
            className="text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            ← Profile
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-dark">
            Admin panel
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Catalog stats and moderation. User role management — only
            via Sanity Studio.
          </p>
        </div>

        <Suspense fallback={<div className="h-10 animate-pulse rounded-full bg-brand/10" />}>
          <AdminNav />
        </Suspense>

        {children}
      </Container>
    </main>
  );
}
