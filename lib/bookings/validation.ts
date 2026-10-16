import {
  getOfferAvailability,
  isPickupWindowEnded,
  isReservationOpen,
  type OfferTimingFields,
} from "@/lib/offers/lifecycle";

const MAX_QUANTITY_PER_BOOKING = 20;

export function parseBookingQuantity(raw: unknown): number | null {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number.parseInt(raw, 10)
        : NaN;

  if (!Number.isInteger(value) || value < 1) {
    return null;
  }

  if (value > MAX_QUANTITY_PER_BOOKING) {
    return null;
  }

  return value;
}

export function isOfferBookable(
  offer: OfferTimingFields & {
    publicationStatus: string;
    quantityAvailable: number;
    storeIsPublished?: boolean;
  },
  quantity: number,
  nowMs = Date.now(),
): string | null {
  const availability = getOfferAvailability(
    {
      ...offer,
      store: { isPublished: offer.storeIsPublished },
    },
    nowMs,
  );

  if (availability === "not_published" || availability === "store_unavailable") {
    return "This offer is not available for booking";
  }

  if (availability === "reservation_closed") {
    return "The reservation deadline has passed";
  }

  if (availability === "fully_booked") {
    return "Fully booked";
  }

  if (
    !Number.isInteger(offer.quantityAvailable) ||
    offer.quantityAvailable < quantity
  ) {
    return "Not enough bundles available";
  }

  if (isPickupWindowEnded(offer, nowMs)) {
    return "The pickup window has already passed";
  }

  if (!isReservationOpen(offer, nowMs)) {
    return "The reservation deadline has passed";
  }

  return null;
}

export function canBuyerCancelBooking(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

export type SellerBookingAction = "confirm" | "complete" | "cancel";

export function resolveSellerBookingStatus(
  currentStatus: string,
  action: SellerBookingAction,
): string | null {
  if (action === "confirm" && currentStatus === "pending") {
    return "confirmed";
  }
  if (action === "complete" && currentStatus === "confirmed") {
    return "completed";
  }
  if (
    action === "cancel" &&
    (currentStatus === "pending" || currentStatus === "confirmed")
  ) {
    return "cancelled";
  }
  return null;
}
