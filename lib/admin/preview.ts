import "server-only";

import { connection } from "next/server";
import {
  foodOfferBySlugAdminPreviewQuery,
  storeBySlugAdminPreviewQuery,
} from "@/lib/sanity/queries";
import { sanityManageClient } from "@/lib/sanity/manageClient";
import { SanityFetchError } from "@/lib/sanity/fetch";
import type { FoodOfferWithRelated, StoreWithOffers } from "@/lib/sanity/types";

async function fetchAdminPreview<T>(label: string, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`[admin-preview] ${label}`, error);
    throw new SanityFetchError();
  }
}

export async function getStoreBySlugForAdminPreview(
  slug: string,
): Promise<StoreWithOffers | null> {
  await connection();
  return fetchAdminPreview(
    "getStoreBySlugForAdminPreview",
    sanityManageClient.fetch<StoreWithOffers | null>(storeBySlugAdminPreviewQuery, {
      slug,
    }),
  );
}

export async function getFoodOfferBySlugForAdminPreview(
  slug: string,
): Promise<FoodOfferWithRelated | null> {
  await connection();
  return fetchAdminPreview(
    "getFoodOfferBySlugForAdminPreview",
    sanityManageClient.fetch<FoodOfferWithRelated | null>(
      foodOfferBySlugAdminPreviewQuery,
      { slug },
    ),
  );
}
