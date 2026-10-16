import "server-only";

import { connection } from "next/server";
import type {
  Booking,
  Category,
  FoodOffer,
  SanitySlug,
  SellerDashboardStats,
  SellerOfferListItem,
  FoodOfferWithRelated,
  HomePageData,
  SiteSettings,
  Store,
  StoreWithOffers,
} from "./types";
import {
  bookingStatsForProfileQuery,
  bookingsByProfileQuery,
  bookingsForSellerQuery,
  categoriesQuery,
  endingSoonFoodOffersQuery,
  featuredFoodOffersQuery,
  foodOfferBySlugQuery,
  publishedFoodOffersQuery,
  sellerBookingsAnalyticsQuery,
  sellerDashboardCountsQuery,
  sellerOfferCatalogAnalyticsQuery,
  offersForSellerQuery,
  storeForSellerByIdQuery,
  storeForSellerQuery,
  offerForSellerManageQuery,
  siteSettingsQuery,
  storeBySlugQuery,
  storesQuery,
} from "./queries";
import { sanityManageClient } from "./manageClient";
import { isPublicOfferListing } from "./public-offer";
import { sanityServerClient } from "./serverClient";

export class SanityFetchError extends Error {
  constructor(message = "Не удалось загрузить данные из Sanity") {
    super(message);
    this.name = "SanityFetchError";
  }
}

async function fetchFromSanity<T>(label: string, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`[sanity] ${label}`, error);
    throw new SanityFetchError();
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return fetchFromSanity(
    "getSiteSettings",
    sanityServerClient.fetch<SiteSettings | null>(siteSettingsQuery),
  );
}

export async function getPublishedFoodOffers(): Promise<FoodOffer[]> {
  return fetchFromSanity(
    "getPublishedFoodOffers",
    sanityServerClient.fetch<FoodOffer[]>(publishedFoodOffersQuery),
  );
}

export async function getFeaturedFoodOffers(): Promise<FoodOffer[]> {
  return fetchFromSanity(
    "getFeaturedFoodOffers",
    sanityServerClient.fetch<FoodOffer[]>(featuredFoodOffersQuery),
  );
}

export async function getHomePageData(): Promise<HomePageData> {
  const [settings, categories, stores, offers, featuredOffers, endingSoonOffers] =
    await fetchFromSanity(
      "getHomePageData",
      Promise.all([
        sanityServerClient.fetch<SiteSettings | null>(siteSettingsQuery),
        sanityServerClient.fetch<Category[]>(categoriesQuery),
        sanityServerClient.fetch<Store[]>(storesQuery),
        sanityServerClient.fetch<FoodOffer[]>(publishedFoodOffersQuery),
        sanityServerClient.fetch<FoodOffer[]>(featuredFoodOffersQuery),
        sanityServerClient.fetch<FoodOffer[]>(endingSoonFoodOffersQuery),
      ]),
    );

  return {
    settings,
    categories,
    stores,
    offers,
    featuredOffers,
    endingSoonOffers,
  };
}

export async function getOffersCatalogData(): Promise<{
  offers: FoodOffer[];
  categories: Category[];
}> {
  const [offers, categories] = await fetchFromSanity(
    "getOffersCatalogData",
    Promise.all([
      sanityServerClient.fetch<FoodOffer[]>(publishedFoodOffersQuery),
      sanityServerClient.fetch<Category[]>(categoriesQuery),
    ]),
  );

  return { offers, categories };
}

export async function getFoodOfferBySlug(
  slug: string,
): Promise<FoodOfferWithRelated | null> {
  return fetchFromSanity(
    "getFoodOfferBySlug",
    sanityServerClient.fetch<FoodOfferWithRelated | null>(
      foodOfferBySlugQuery,
      { slug },
    ),
  );
}

export async function getStores(): Promise<Store[]> {
  return fetchFromSanity(
    "getStores",
    sanityServerClient.fetch<Store[]>(storesQuery),
  );
}

export async function getStoreBySlug(
  slug: string,
): Promise<StoreWithOffers | null> {
  const store = await fetchFromSanity(
    "getStoreBySlug",
    sanityServerClient.fetch<StoreWithOffers | null>(storeBySlugQuery, {
      slug,
    }),
  );

  if (!store) {
    return null;
  }

  const offers = (store.offers ?? []).filter(isPublicFoodOffer);

  return { ...store, offers };
}

export async function getCategories(): Promise<Category[]> {
  return fetchFromSanity(
    "getCategories",
    sanityServerClient.fetch<Category[]>(categoriesQuery),
  );
}

export type CustomerBookingStats = {
  total: number;
  active: number;
};

export async function getSellerDashboardStats(input: {
  profileId: string;
  isAdmin: boolean;
}): Promise<SellerDashboardStats> {
  const { buildSellerDashboardStats } = await import("@/lib/seller/analytics");
  const params = {
    profileId: input.profileId,
    isAdmin: input.isAdmin,
  };

  const [counts, offers, bookings] = await Promise.all([
    fetchFromSanity(
      "getSellerDashboardStats.counts",
      sanityServerClient.fetch(sellerDashboardCountsQuery, params),
    ),
    fetchFromSanity(
      "getSellerDashboardStats.offers",
      sanityServerClient.fetch(sellerOfferCatalogAnalyticsQuery, params),
    ),
    fetchFromSanity(
      "getSellerDashboardStats.bookings",
      sanityServerClient.fetch(sellerBookingsAnalyticsQuery, params),
    ),
  ]);

  return buildSellerDashboardStats({
    counts,
    offers: offers ?? [],
    bookings: bookings ?? [],
  });
}

export async function getStoreForSeller(profileId: string): Promise<Store | null> {
  await connection();
  return fetchFromSanity(
    "getStoreForSeller",
    sanityManageClient.fetch<Store | null>(storeForSellerQuery, { profileId }),
  );
}

export async function getStoreForSellerById(input: {
  profileId: string;
  storeId: string;
}): Promise<Store | null> {
  await connection();
  const storeId = input.storeId.trim();
  if (!storeId) {
    return null;
  }

  return fetchFromSanity(
    "getStoreForSellerById",
    sanityManageClient.fetch<Store | null>(storeForSellerByIdQuery, {
      profileId: input.profileId,
      storeId,
    }),
  );
}

export async function getOffersForSeller(input: {
  profileId: string;
  isAdmin: boolean;
}): Promise<SellerOfferListItem[]> {
  return fetchFromSanity(
    "getOffersForSeller",
    sanityManageClient.fetch<SellerOfferListItem[]>(offersForSellerQuery, {
      profileId: input.profileId,
      isAdmin: input.isAdmin,
    }),
  );
}

export type SellerOfferEdit = {
  _id: string;
  title: string;
  slug: SanitySlug;
  description?: string;
  price: number;
  originalPrice: number;
  quantityAvailable: number;
  publicationStatus: FoodOffer["publicationStatus"];
  reservationDeadline?: FoodOffer["reservationDeadline"];
  pickupWindow: FoodOffer["pickupWindow"];
  image?: FoodOffer["image"];
  categoryId?: string;
  sellerProfileId?: string | null;
};

export async function getOfferForSellerEdit(
  offerId: string,
): Promise<SellerOfferEdit | null> {
  return fetchFromSanity(
    "getOfferForSellerEdit",
    sanityManageClient.fetch<SellerOfferEdit | null>(offerForSellerManageQuery, {
      offerId,
    }),
  );
}

export async function getCustomerBookingStats(
  profileId: string,
): Promise<CustomerBookingStats> {
  const stats = await fetchFromSanity(
    "getCustomerBookingStats",
    sanityServerClient.fetch<CustomerBookingStats>(
      bookingStatsForProfileQuery,
      { profileId },
    ),
  );

  return {
    total: stats?.total ?? 0,
    active: stats?.active ?? 0,
  };
}

export async function getBookingsForProfile(
  profileId: string,
): Promise<Booking[]> {
  return fetchFromSanity(
    "getBookingsForProfile",
    sanityServerClient.fetch<Booking[]>(bookingsByProfileQuery, { profileId }),
  );
}

export async function getBookingsForSeller(input: {
  profileId: string;
  isAdmin: boolean;
}): Promise<Booking[]> {
  return fetchFromSanity(
    "getBookingsForSeller",
    sanityServerClient.fetch<Booking[]>(bookingsForSellerQuery, {
      profileId: input.profileId,
      isAdmin: input.isAdmin,
    }),
  );
}

export { isPublicOfferListing, isStorePublishedOnSite } from "./public-offer";

export function isPublicFoodOffer(offer: FoodOffer | null): offer is FoodOffer {
  return isPublicOfferListing(offer);
}
