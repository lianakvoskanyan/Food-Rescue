import {
  getOfferAvailability,
  isPublicOfferBrowsable,
  type OfferListingFields,
} from "@/lib/offers/lifecycle";

export function isStorePublishedOnSite(store?: { isPublished?: boolean } | null): boolean {
  return store?.isPublished !== false;
}

/** Offer visible on public catalog and detail pages (reservation window still open). */
export function isPublicOfferListing(
  offer: OfferListingFields | null,
  nowMs?: number,
): boolean {
  return isPublicOfferBrowsable(offer, nowMs);
}

export function isOfferBookableForCustomers(
  offer: OfferListingFields,
  nowMs?: number,
): boolean {
  return getOfferAvailability(offer, nowMs) === "bookable";
}
