"use client";

import { useCallback, useMemo, useState } from "react";
import { OfferReservationCountdown } from "@/components/offers/offer-reservation-countdown";
import {
  availabilityUserMessage,
  getOfferAvailability,
  type OfferListingFields,
} from "@/lib/offers/lifecycle";

type FoodOfferCardAvailabilityProps = {
  offer: OfferListingFields;
};

export function FoodOfferCardAvailability({
  offer,
}: FoodOfferCardAvailabilityProps) {
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

  const statusMessage = availabilityUserMessage(availability);

  return (
    <div className="space-y-1.5">
      {availability === "bookable" || availability === "fully_booked" ? (
        <OfferReservationCountdown
          offer={offer}
          compact
          onReservationClosed={onReservationClosed}
        />
      ) : null}
      {statusMessage ? (
        <p className="text-xs font-semibold text-brand-dark">{statusMessage}</p>
      ) : null}
      {typeof offer.quantityAvailable === "number" &&
      availability === "bookable" ? (
        <p className="text-xs font-medium text-brand">
          Bundles left: {offer.quantityAvailable}
        </p>
      ) : null}
    </div>
  );
}
