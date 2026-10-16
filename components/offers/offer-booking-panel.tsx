"use client";

import { useCallback, useMemo, useState } from "react";
import {
  OfferBookingForm,
  type OfferBookingAccess,
} from "@/components/bookings/offer-booking-form";
import { OfferReservationCountdown } from "@/components/offers/offer-reservation-countdown";
import {
  availabilityUserMessage,
  getOfferAvailability,
  type OfferListingFields,
} from "@/lib/offers/lifecycle";

type OfferBookingPanelProps = {
  offer: OfferListingFields & { _id: string };
  access: OfferBookingAccess;
  loginHref: string;
  returnPath: string;
};

export function OfferBookingPanel({
  offer,
  access,
  loginHref,
  returnPath,
}: OfferBookingPanelProps) {
  const [reservationClosed, setReservationClosed] = useState(false);

  const onReservationClosed = useCallback(() => {
    setReservationClosed(true);
  }, []);

  const availability = useMemo(() => {
    if (reservationClosed) {
      return "reservation_closed" as const;
    }
    return getOfferAvailability(offer);
  }, [offer, reservationClosed]);

  const blockMessage = availabilityUserMessage(availability);

  return (
    <div className="space-y-4">
      <OfferReservationCountdown
        offer={offer}
        onReservationClosed={onReservationClosed}
      />

      {availability === "bookable" ? (
        <OfferBookingForm
          offerId={offer._id}
          maxQuantity={offer.quantityAvailable}
          access={access}
          loginHref={loginHref}
          returnPath={returnPath}
        />
      ) : (
        <section className="rounded-2xl border border-brand/10 bg-background p-4">
          <h2 className="font-display text-lg font-semibold text-brand-dark">
            Book
          </h2>
          <p className="mt-2 text-sm text-muted" role="status">
            {blockMessage ?? "Booking is not available right now."}
          </p>
        </section>
      )}
    </div>
  );
}
