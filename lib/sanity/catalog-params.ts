import "server-only";

export type OffersSort = "pickup" | "price-asc" | "price-desc";
export type OffersCatalogView = "list" | "map";

export type ParsedOffersCatalogParams = {
  query?: string;
  categorySlug?: string;
  storeSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: OffersSort;
  view: OffersCatalogView;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SORT_VALUES: OffersSort[] = ["pickup", "price-asc", "price-desc"];

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parsePositiveNumber(raw: string | undefined): number | undefined {
  if (!raw?.trim()) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export function parseOffersCatalogSearchParams(
  raw: Record<string, string | string[] | undefined>,
  validCategorySlugs: ReadonlySet<string>,
  validStoreSlugs?: ReadonlySet<string>,
): ParsedOffersCatalogParams {
  const queryRaw = firstValue(raw.q)?.trim();
  const query =
    queryRaw && queryRaw.length <= 120 ? queryRaw.slice(0, 120) : undefined;

  const categoryRaw = firstValue(raw.category)?.trim().toLowerCase();
  const categorySlug =
    categoryRaw &&
    categoryRaw.length <= 96 &&
    SLUG_PATTERN.test(categoryRaw) &&
    validCategorySlugs.has(categoryRaw)
      ? categoryRaw
      : undefined;

  let minPrice = parsePositiveNumber(firstValue(raw.minPrice));
  let maxPrice = parsePositiveNumber(firstValue(raw.maxPrice));

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const sortRaw = firstValue(raw.sort)?.trim() as OffersSort | undefined;
  const sort = sortRaw && SORT_VALUES.includes(sortRaw) ? sortRaw : "pickup";

  const viewRaw = firstValue(raw.view)?.trim();
  const view: OffersCatalogView = viewRaw === "map" ? "map" : "list";

  const storeRaw = firstValue(raw.store)?.trim().toLowerCase();
  const storeSlug =
    storeRaw &&
    storeRaw.length <= 96 &&
    SLUG_PATTERN.test(storeRaw) &&
    (!validStoreSlugs || validStoreSlugs.has(storeRaw))
      ? storeRaw
      : undefined;

  return {
    query,
    categorySlug,
    storeSlug,
    minPrice,
    maxPrice,
    sort,
    view,
  };
}

export function buildOffersCatalogHref(
  params: ParsedOffersCatalogParams,
  overrides?: Partial<Pick<ParsedOffersCatalogParams, "view">>,
): string {
  const view = overrides?.view ?? params.view;
  const search = new URLSearchParams();

  if (params.query) {
    search.set("q", params.query);
  }
  if (params.categorySlug) {
    search.set("category", params.categorySlug);
  }
  if (params.storeSlug) {
    search.set("store", params.storeSlug);
  }
  if (params.minPrice !== undefined) {
    search.set("minPrice", String(params.minPrice));
  }
  if (params.maxPrice !== undefined) {
    search.set("maxPrice", String(params.maxPrice));
  }
  if (params.sort !== "pickup") {
    search.set("sort", params.sort);
  }
  if (view === "map") {
    search.set("view", "map");
  }

  const query = search.toString();
  return query ? `/offers?${query}` : "/offers";
}

export function parseSlugParam(raw: string | undefined): string | null {
  const slug = raw?.trim().toLowerCase();
  if (!slug || slug.length > 96 || !SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

/** @deprecated Use parseSlugParam */
export const parseOfferSlugParam = parseSlugParam;

export const parseStoreSlugParam = parseSlugParam;
