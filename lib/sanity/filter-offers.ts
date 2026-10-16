import type { OffersSort } from "./catalog-params";
import type { FoodOffer } from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export type FilterFoodOffersOptions = {
  query?: string;
  categorySlug?: string;
  storeSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: OffersSort;
};

export function filterFoodOffers(
  offers: FoodOffer[],
  options: FilterFoodOffersOptions,
): FoodOffer[] {
  const query = normalize(options.query ?? "");
  const categorySlug = normalize(options.categorySlug ?? "");
  const storeSlug = normalize(options.storeSlug ?? "");
  const minPrice = options.minPrice;
  const maxPrice = options.maxPrice;

  const filtered = offers.filter((offer) => {
    if (categorySlug && offer.category?.slug.current !== categorySlug) {
      return false;
    }

    if (storeSlug && offer.store?.slug.current !== storeSlug) {
      return false;
    }

    if (minPrice !== undefined && offer.price < minPrice) {
      return false;
    }

    if (maxPrice !== undefined && offer.price > maxPrice) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [offer.title, offer.store?.title]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return sortFoodOffers(filtered, options.sort ?? "pickup");
}

function sortFoodOffers(offers: FoodOffer[], sort: OffersSort): FoodOffer[] {
  const copy = [...offers];

  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "pickup":
    default:
      return copy.sort(
        (a, b) =>
          new Date(a.pickupWindow.start).getTime() -
          new Date(b.pickupWindow.start).getTime(),
      );
  }
}
