"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { cancelBookingAction, type CancelBookingFormState } from "@/lib/bookings/actions";
import {
  formatBookingCreatedAt,
  formatBookingStatus,
} from "@/lib/bookings/labels";
import { canBuyerCancelBooking } from "@/lib/bookings/validation";
import { formatPickupWindow, formatPrice } from "@/lib/sanity/format";
import type { Booking } from "@/lib/sanity/types";

type BookingsListProps = {
  bookings: Booking[];
};

const cancelInitialState: CancelBookingFormState = {};

function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(
    cancelBookingAction,
    cancelInitialState,
  );

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      {state.error ? (
        <p className="mb-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-red-700 underline-offset-2 hover:underline disabled:opacity-60"
      >
        {pending ? "Cancelling..." : "Cancel booking"}
      </button>
    </form>
  );
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        description={
          <>
            Choose a bundle in the{" "}
            <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
              catalog
            </Link>{" "}
            and book on the offer page.
          </>
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => {
        const offer = booking.offer;
        const offerSlug = offer?.slug?.current;
        const statusLabel = formatBookingStatus(booking.status);

        return (
          <li
            key={booking._id}
            className="rounded-2xl border border-brand/10 bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {booking.bookingNumber}
                </p>
                {offer?.title ? (
                  offerSlug ? (
                    <Link
                      href={`/offers/${offerSlug}`}
                      className="mt-1 inline-flex font-display text-lg font-semibold text-brand-dark underline-offset-2 hover:underline"
                    >
                      {offer.title}
                    </Link>
                  ) : (
                    <p className="mt-1 font-display text-lg font-semibold text-brand-dark">
                      {offer.title}
                    </p>
                  )
                ) : (
                  <p className="mt-1 text-sm text-muted">Offer unavailable</p>
                )}
              </div>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {statusLabel}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-brand-dark">Quantity</dt>
                <dd className="mt-1 text-muted">{booking.quantity}</dd>
              </div>
              <div>
                <dt className="font-medium text-brand-dark">Created</dt>
                <dd className="mt-1 text-muted">
                  {formatBookingCreatedAt(booking.createdAt)}
                </dd>
              </div>
              {typeof offer?.price === "number" ? (
                <div>
                  <dt className="font-medium text-brand-dark">Price per bundle</dt>
                  <dd className="mt-1 text-muted">{formatPrice(offer.price)}</dd>
                </div>
              ) : null}
              {offer?.pickupWindow?.start && offer.pickupWindow.end ? (
                <div>
                  <dt className="font-medium text-brand-dark">Pickup</dt>
                  <dd className="mt-1 text-muted">
                    {formatPickupWindow(offer.pickupWindow)}
                  </dd>
                </div>
              ) : null}
              {offer?.store?.title ? (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-brand-dark">Store</dt>
                  <dd className="mt-1 text-muted">{offer.store.title}</dd>
                </div>
              ) : null}
            </dl>

            {canBuyerCancelBooking(booking.status) ? (
              <CancelBookingButton bookingId={booking._id} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
