import "server-only";

import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/lib/sanity/writeClient";
import { sanityServerClient } from "@/lib/sanity/serverClient";
import type {
  AdminDashboardStats,
  AdminOfferListItem,
  AdminStoreListItem,
  Booking,
  FoodOfferPublicationStatus,
} from "@/lib/sanity/types";
import {
  adminBookingsListQuery,
  adminDashboardStatsQuery,
  adminOffersListQuery,
  adminStoresListQuery,
} from "@/lib/sanity/queries";
import { AdminServiceError } from "@/lib/admin/errors";

const emptyStats: AdminDashboardStats = {
  storesTotal: 0,
  storesPublished: 0,
  offersTotal: 0,
  offersPublished: 0,
  offersDraft: 0,
  bookingsTotal: 0,
  bookingsPending: 0,
  bookingsActive: 0,
  usersTotal: 0,
  usersCustomer: 0,
  usersSeller: 0,
  usersAdmin: 0,
};

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const row = await sanityServerClient.fetch<AdminDashboardStats | null>(
    adminDashboardStatsQuery,
  );
  return row ?? emptyStats;
}

export async function fetchAdminStores(): Promise<AdminStoreListItem[]> {
  return sanityServerClient.fetch<AdminStoreListItem[]>(adminStoresListQuery);
}

export async function fetchAdminOffers(): Promise<AdminOfferListItem[]> {
  return sanityServerClient.fetch<AdminOfferListItem[]>(adminOffersListQuery);
}

export async function fetchAdminBookings(): Promise<Booking[]> {
  return sanityServerClient.fetch<Booking[]>(adminBookingsListQuery);
}

function assertWriteConfigured(): void {
  if (!isSanityWriteConfigured()) {
    throw new AdminServiceError(
      "SANITY_API_WRITE_TOKEN is not configured — changes are unavailable.",
    );
  }
}

export async function setStorePublished(input: {
  storeId: string;
  published: boolean;
}): Promise<void> {
  assertWriteConfigured();

  const storeId = input.storeId.trim();
  if (!storeId) {
    throw new AdminServiceError("Store not specified.");
  }

  const exists = await sanityServerClient.fetch<{ _id: string } | null>(
    `*[_type == "store" && _id == $storeId][0]{ _id }`,
    { storeId },
  );

  if (!exists) {
    throw new AdminServiceError("Store not found.");
  }

  await sanityWriteClient.patch(storeId).set({ isPublished: input.published }).commit();
}

export async function setOfferPublicationStatus(input: {
  offerId: string;
  status: "draft" | "published";
}): Promise<void> {
  assertWriteConfigured();

  const offerId = input.offerId.trim();
  if (!offerId) {
    throw new AdminServiceError("Offer not specified.");
  }

  const offer = await sanityServerClient.fetch<{
    _id: string;
    publicationStatus: FoodOfferPublicationStatus;
  } | null>(
    `*[_type == "foodOffer" && _id == $offerId][0]{ _id, publicationStatus }`,
    { offerId },
  );

  if (!offer) {
    throw new AdminServiceError("Offer not found.");
  }

  if (input.status === "published" && offer.publicationStatus === "published") {
    return;
  }

  if (input.status === "draft" && offer.publicationStatus === "draft") {
    return;
  }

  if (
    input.status === "published" &&
    offer.publicationStatus !== "draft" &&
    offer.publicationStatus !== "published"
  ) {
    throw new AdminServiceError(
      "Republication is only available for drafts. For Sold out and Expired statuses, use Sanity Studio.",
    );
  }

  await sanityWriteClient
    .patch(offerId)
    .set({ publicationStatus: input.status })
    .commit();
}
