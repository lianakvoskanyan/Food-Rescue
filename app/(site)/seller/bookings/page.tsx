import { Suspense } from "react";
import type { Metadata } from "next";
import { SellerBookingsList } from "@/components/bookings/seller-bookings-list";
import { ErrorState } from "@/components/ui/error-state";
import { requireSellerDashboard } from "@/lib/seller/access";
import { getBookingsForSeller, SanityFetchError } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Seller orders",
};

type SellerBookingsPageProps = {
  searchParams: Promise<{ updated?: string }>;
};

async function SellerBookingsContent({ searchParams }: SellerBookingsPageProps) {
  const auth = await requireSellerDashboard("/seller/bookings");
  const params = await searchParams;
  const isAdmin = auth.profile.role === "admin";

  let bookings;

  try {
    bookings = await getBookingsForSeller({
      profileId: auth.profile.id,
      isAdmin,
    });
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  return (
    <>
      {params.updated === "1" ? (
        <p
          className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark"
          role="status"
        >
          Order status updated.
        </p>
      ) : null}

      <p className="text-sm text-muted">
        {isAdmin
          ? "All bookings in the system."
          : "Orders for your store's offers. Buyer: name or email."}
      </p>

      <SellerBookingsList bookings={bookings} isAdmin={isAdmin} />
    </>
  );
}

export default function SellerBookingsPage(props: SellerBookingsPageProps) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-brand/10" />}>
      <SellerBookingsContent searchParams={props.searchParams} />
    </Suspense>
  );
}
