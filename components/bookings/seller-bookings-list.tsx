"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  sellerBookingAction,
  type SellerBookingFormState,
} from "@/lib/bookings/actions";
import {
  formatBookingCreatedAt,
  formatBookingStatus,
} from "@/lib/bookings/labels";
import { formatPickupWindow, formatPrice } from "@/lib/sanity/format";
import type { Booking, BookingStatus } from "@/lib/sanity/types";

type SellerBookingsListProps = {
  bookings: Booking[];
  isAdmin: boolean;
};

const sellerActionInitialState: SellerBookingFormState = {};

function SellerBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [state, formAction, pending] = useActionState(
    sellerBookingAction,
    sellerActionInitialState,
  );

  const actions: Array<{ action: "confirm" | "complete" | "cancel"; label: string }> =
    [];
  if (status === "pending") {
    actions.push({ action: "confirm", label: "Confirm" });
    actions.push({ action: "cancel", label: "Cancel" });
  } else if (status === "confirmed") {
    actions.push({ action: "complete", label: "Complete" });
    actions.push({ action: "cancel", label: "Cancel" });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {state.error ? (
        <p className="w-full text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {actions.map(({ action, label }) => (
        <form key={action} action={formAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="action" value={action} />
          <button
            type="submit"
            disabled={pending}
            className={
              action === "cancel"
                ? "rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                : "rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            }
          >
            {pending ? "..." : label}
          </button>
        </form>
      ))}
    </div>
  );
}

export function SellerBookingsList({ bookings, isAdmin }: SellerBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description={
          isAdmin ? (
            <>New customer bookings will appear here.</>
          ) : (
            <>
              Link your profile to a store in Sanity Studio (Seller profile field on
              store) to see orders for your offers.
            </>
          )
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => {
        const offer = booking.offer;
        const offerSlug = offer?.slug?.current;
        const buyerLabel =
          booking.buyer?.displayName?.trim() ||
          booking.buyer?.email ||
          "Customer";

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
                ) : null}
              </div>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {formatBookingStatus(booking.status)}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-brand-dark">Customer</dt>
                <dd className="mt-1 text-muted">{buyerLabel}</dd>
              </div>
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
                <div className="sm:col-span-2">
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

            <SellerBookingActions bookingId={booking._id} status={booking.status} />
          </li>
        );
      })}
    </ul>
  );
}
