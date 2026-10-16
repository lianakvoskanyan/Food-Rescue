import {
  formatStoreAddress,
  getDiscountPercent,
} from "@/lib/sanity/format";
import type { FoodOffer } from "@/lib/sanity/types";
import { getStoreGeopoint } from "@/lib/stores/location";
import {
  getOfferMapPopupThumbUrl,
  getStoreMapMarkerImageUrl,
  getStoreMapPopupImageUrl,
} from "@/lib/stores/map-marker-images";

export type StoreMapOfferPreview = {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string | null;
};

export type StoreMapMarkerData = {
  storeId: string;
  title: string;
  storeSlug: string;
  addressLine: string | null;
  lat: number;
  lng: number;
  storeMarkerImageUrl: string | null;
  storePopupImageUrl: string | null;
  bestOffer: StoreMapOfferPreview | null;
  offersPreview: StoreMapOfferPreview[];
  offerCount: number;
  /** @deprecated Use bestOffer */
  featuredOffer: StoreMapOfferPreview | null;
};

const OFFERS_PREVIEW_LIMIT = 3;

function toOfferPreview(offer: FoodOffer): StoreMapOfferPreview {
  return {
    id: offer._id,
    title: offer.title,
    slug: offer.slug.current,
    price: offer.price,
    originalPrice: offer.originalPrice,
    discountPercent: getDiscountPercent(offer.price, offer.originalPrice),
    imageUrl: getOfferMapPopupThumbUrl(offer.image),
  };
}

function sortOffersByBestDeal(offers: FoodOffer[]): FoodOffer[] {
  return [...offers].sort((a, b) => {
    const discountA = getDiscountPercent(a.price, a.originalPrice);
    const discountB = getDiscountPercent(b.price, b.originalPrice);
    if (discountB !== discountA) {
      return discountB - discountA;
    }
    return a.price - b.price;
  });
}

/**
 * Groups catalog offers by store; only stores with valid Sanity coordinates.
 */
export function buildStoreMapMarkersFromOffers(
  offers: FoodOffer[],
): StoreMapMarkerData[] {
  const byStore = new Map<
    string,
    {
      store: NonNullable<FoodOffer["store"]>;
      offers: FoodOffer[];
    }
  >();

  for (const offer of offers) {
    const store = offer.store;
    if (!store?._id) {
      continue;
    }
    const geo = getStoreGeopoint(store);
    if (!geo) {
      continue;
    }

    const existing = byStore.get(store._id);
    if (existing) {
      existing.offers.push(offer);
    } else {
      byStore.set(store._id, { store, offers: [offer] });
    }
  }

  const markers: StoreMapMarkerData[] = [];

  for (const { store, offers: storeOffers } of byStore.values()) {
    const geo = getStoreGeopoint(store);
    if (!geo || !store.slug?.current) {
      continue;
    }

    const ranked = sortOffersByBestDeal(storeOffers);
    const best = ranked[0];
    const offersPreview = ranked
      .slice(0, OFFERS_PREVIEW_LIMIT)
      .map(toOfferPreview);
    const bestOffer = best ? toOfferPreview(best) : null;

    markers.push({
      storeId: store._id,
      title: store.title,
      storeSlug: store.slug.current,
      addressLine: formatStoreAddress(store.address),
      lat: geo.lat,
      lng: geo.lng,
      storeMarkerImageUrl: getStoreMapMarkerImageUrl(store.image),
      storePopupImageUrl: getStoreMapPopupImageUrl(store.image),
      offerCount: storeOffers.length,
      offersPreview,
      bestOffer,
      featuredOffer: bestOffer,
    });
  }

  return markers.sort((a, b) => a.title.localeCompare(b.title, "en"));
}
