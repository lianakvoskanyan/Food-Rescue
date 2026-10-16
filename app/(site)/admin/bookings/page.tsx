import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminBookingsList } from "@/components/admin/admin-bookings-list";
import { ErrorState } from "@/components/ui/error-state";
import { requireAdminDashboard } from "@/lib/admin/access";
import { fetchAdminBookings } from "@/lib/admin/service";

export const metadata: Metadata = {
  title: "Bookings",
};

async function AdminBookingsContent() {
  await requireAdminDashboard("/admin/bookings");

  let bookings;
  try {
    bookings = await fetchAdminBookings();
  } catch {
    return (
      <ErrorState
        title="Could not load bookings"
        description="Try again later or check Sanity."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted">
        View all bookings. Confirming and cancelling orders — in the{" "}
        <Link href="/seller/bookings" className="font-medium text-brand underline-offset-2 hover:underline">
          seller dashboard
        </Link>{" "}
        (available to admin with the same role).
      </p>
      <AdminBookingsList bookings={bookings} />
    </>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={<div className="h-40 animate-pulse rounded-2xl bg-brand/10" role="status" />}
    >
      <AdminBookingsContent />
    </Suspense>
  );
}
