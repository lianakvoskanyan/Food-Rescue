export type OfferTimingFields = {
  reservationDeadline?: string | null;
  pickupWindow?: { start?: string; end?: string };
};

export type OfferListingFields = OfferTimingFields & {
  publicationStatus: string;
  quantityAvailable: number;
  store?: { isPublished?: boolean } | null;
};

export type OfferAvailability =
  | "bookable"
  | "fully_booked"
  | "reservation_closed"
  | "not_published"
  | "store_unavailable";

export function getReservationDeadlineIso(offer: OfferTimingFields): string | null {
  const explicit = offer.reservationDeadline?.trim();
  if (explicit) {
    return explicit;
  }
  const pickupEnd = offer.pickupWindow?.end?.trim();
  return pickupEnd || null;
}

export function getReservationDeadlineMs(
  offer: OfferTimingFields,
  nowMs = Date.now(),
): number | null {
  void nowMs;
  const iso = getReservationDeadlineIso(offer);
  if (!iso) {
    return null;
  }
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/** Bookable offers with reservation deadline within this window (homepage hot deals). */
export const ENDING_SOON_WINDOW_MS = 3 * 60 * 60 * 1000;

export function isReservationOpen(
  offer: OfferTimingFields,
  nowMs = Date.now(),
): boolean {
  const deadlineMs = getReservationDeadlineMs(offer, nowMs);
  if (deadlineMs === null) {
    return false;
  }
  return deadlineMs > nowMs;
}

export function isPickupWindowEnded(
  offer: OfferTimingFields,
  nowMs = Date.now(),
): boolean {
  const endIso = offer.pickupWindow?.end?.trim();
  if (!endIso) {
    return false;
  }
  const endMs = Date.parse(endIso);
  if (Number.isNaN(endMs)) {
    return false;
  }
  return endMs < nowMs;
}

/** Visible on public catalog / detail (deadline may still be open with zero stock). */
export function isPublicOfferBrowsable(
  offer: OfferListingFields | null,
  nowMs = Date.now(),
): boolean {
  if (!offer) {
    return false;
  }
  if (offer.publicationStatus !== "published") {
    return false;
  }
  if (offer.store?.isPublished === false) {
    return false;
  }
  return isReservationOpen(offer, nowMs);
}

export function isOfferBookableEndingSoon(
  offer: OfferListingFields,
  nowMs = Date.now(),
): boolean {
  if (getOfferAvailability(offer, nowMs) !== "bookable") {
    return false;
  }
  const deadlineMs = getReservationDeadlineMs(offer, nowMs);
  if (deadlineMs === null || deadlineMs <= nowMs) {
    return false;
  }
  return deadlineMs - nowMs <= ENDING_SOON_WINDOW_MS;
}

export function getOfferAvailability(
  offer: OfferListingFields,
  nowMs = Date.now(),
): OfferAvailability {
  if (offer.publicationStatus !== "published") {
    return "not_published";
  }
  if (offer.store?.isPublished === false) {
    return "store_unavailable";
  }
  if (!isReservationOpen(offer, nowMs)) {
    return "reservation_closed";
  }
  if (
    !Number.isInteger(offer.quantityAvailable) ||
    offer.quantityAvailable < 1
  ) {
    return "fully_booked";
  }
  return "bookable";
}

export function formatCountdownRemaining(
  deadlineMs: number,
  nowMs: number,
): string {
  const diff = Math.max(0, deadlineMs - nowMs);
  const totalSec = Math.floor(diff / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function availabilityUserMessage(
  availability: OfferAvailability,
): string | null {
  switch (availability) {
    case "fully_booked":
      return "Fully booked";
    case "reservation_closed":
      return "Reservation closed";
    case "not_published":
    case "store_unavailable":
      return "This offer is not available for booking";
    default:
      return null;
  }
}

/** Seller dashboard: expired / sold out / published past reservation deadline. */
export function isSellerOfferNeedsAttention(
  offer: OfferListingFields,
  nowMs = Date.now(),
): boolean {
  if (
    offer.publicationStatus === "expired" ||
    offer.publicationStatus === "soldOut"
  ) {
    return true;
  }
  if (
    offer.publicationStatus === "published" &&
    !isReservationOpen(offer, nowMs)
  ) {
    return true;
  }
  return false;
}
