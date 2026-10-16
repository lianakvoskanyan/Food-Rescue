import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminOffersList } from "@/components/admin/admin-offers-list";
import { ErrorState } from "@/components/ui/error-state";
import { requireAdminDashboard } from "@/lib/admin/access";
import { fetchAdminOffers } from "@/lib/admin/service";

export const metadata: Metadata = {
  title: "Offers",
};

async function AdminOffersContent() {
  await requireAdminDashboard("/admin/offers");

  let offers;
  try {
    offers = await fetchAdminOffers();
  } catch {
    return (
      <ErrorState
        title="Could not load offers"
        description="Try again later or check Sanity."
      />
    );
  }

  return <AdminOffersList offers={offers} />;
}

export default function AdminOffersPage() {
  return (
    <Suspense
      fallback={<div className="h-40 animate-pulse rounded-2xl bg-brand/10" role="status" />}
    >
      <AdminOffersContent />
    </Suspense>
  );
}
