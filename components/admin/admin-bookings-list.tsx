import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import {
  formatBookingCreatedAt,
  formatBookingStatus,
} from "@/lib/bookings/labels";
import { formatPrice } from "@/lib/sanity/format";
import type { Booking } from "@/lib/sanity/types";

type AdminBookingsListProps = {
  bookings: Booking[];
};

export function AdminBookingsList({ bookings }: AdminBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        description="Orders appear when customers book bundles."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((booking) => {
        const offer = booking.offer;
        const buyer = booking.buyer;

        return (
          <li
            key={booking._id}
            className="rounded-2xl border border-brand/10 bg-surface/95 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-brand-dark">
                  {booking.bookingNumber ?? booking._id}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {formatBookingStatus(booking.status)} · ×{booking.quantity}
                  {offer?.price != null
                    ? ` · ${formatPrice(offer.price * booking.quantity)}`
                    : null}
                </p>
              </div>
              <time className="text-xs text-muted" dateTime={booking.createdAt}>
                {formatBookingCreatedAt(booking.createdAt)}
              </time>
            </div>
            {offer ? (
              <p className="mt-3 text-sm text-brand-dark">
                {offer.title}
                {offer.store?.title ? (
                  <span className="text-muted"> · {offer.store.title}</span>
                ) : null}
              </p>
            ) : null}
            {buyer ? (
              <p className="mt-1 text-sm text-muted">
                {buyer.displayName ? `${buyer.displayName} · ` : null}
                {buyer.email}
              </p>
            ) : null}
            {offer?.slug?.current ? (
              <Link
                href={`/offers/${offer.slug.current}`}
                className="mt-3 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline"
              >
                Offer card
              </Link>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
