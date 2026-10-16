import type { FoodOfferPublicationStatus } from "@/lib/sanity/types";

const offerStatusLabels: Record<FoodOfferPublicationStatus, string> = {
  draft: "Draft",
  published: "Published",
  soldOut: "Sold out",
  expired: "Expired",
};

export function formatOfferPublicationStatus(
  status: FoodOfferPublicationStatus,
): string {
  return offerStatusLabels[status] ?? status;
}

export function isStorePublishedOnSite(isPublished?: boolean): boolean {
  return isPublished !== false;
}
