import Link from "next/link";
import { FoodOfferCard } from "@/components/offers/food-offer-card";
import { OffersCatalogFilters } from "@/components/offers/offers-catalog-filters";
import { OffersCatalogViewToggle } from "@/components/offers/offers-catalog-view-toggle";
import { StoreMapDynamic } from "@/components/maps/store-map-dynamic";
import { buildStoreMapMarkersFromOffers } from "@/lib/stores/map-markers";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  parseOffersCatalogSearchParams,
  type ParsedOffersCatalogParams,
} from "@/lib/sanity/catalog-params";
import { filterFoodOffers } from "@/lib/sanity/filter-offers";
import {
  getOffersCatalogData,
  SanityFetchError,
} from "@/lib/sanity/fetch";

type OffersCatalogContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasActiveFilters(params: ParsedOffersCatalogParams) {
  return Boolean(
    params.query ||
      params.categorySlug ||
      params.storeSlug ||
      params.minPrice !== undefined ||
      params.maxPrice !== undefined ||
      params.sort !== "pickup",
  );
}

function OffersCatalogView({
  params,
  resultCount,
  totalCount,
  storeFilterLabel,
  children,
}: {
  params: ParsedOffersCatalogParams;
  resultCount: number;
  totalCount: number;
  storeFilterLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <p className="mb-6 text-sm text-muted" role="status">
        {resultCount > 0
          ? `Showing ${resultCount} offer(s)${totalCount !== resultCount ? ` of ${totalCount}` : ""}`
          : "Nothing found with selected filters"}
        {params.query ? ` · search “${params.query}”` : ""}
        {storeFilterLabel ? ` · store “${storeFilterLabel}”` : ""}
      </p>
      {children}
    </>
  );
}

export async function OffersCatalogContent({
  searchParams,
}: OffersCatalogContentProps) {
  const rawParams = await searchParams;

  let catalogData;

  try {
    catalogData = await getOffersCatalogData();
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return (
        <Container className="py-12">
          <ErrorState />
        </Container>
      );
    }

    throw error;
  }

  const validCategorySlugs = new Set(
    catalogData.categories.map((category) => category.slug.current),
  );
  const validStoreSlugs = new Set(
    catalogData.offers
      .map((offer) => offer.store?.slug.current)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const params = parseOffersCatalogSearchParams(
    rawParams,
    validCategorySlugs,
    validStoreSlugs,
  );
  const filteredOffers = filterFoodOffers(catalogData.offers, params);
  const filtering = hasActiveFilters(params);
  const mapMarkers = buildStoreMapMarkersFromOffers(filteredOffers);
  const isMapView = params.view === "map";
  const storeFilterLabel = params.storeSlug
    ? catalogData.offers.find(
        (offer) => offer.store?.slug.current === params.storeSlug,
      )?.store?.title ?? params.storeSlug
    : undefined;

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-3xl space-y-3">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-brand-dark sm:text-5xl">
          Offers catalog
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Fresh discounted bundles from local venues. Filters apply on the
          server to Sanity data.
        </p>
      </header>

      <OffersCatalogFilters
        categories={catalogData.categories}
        params={params}
      />

      <div className="mt-4 flex justify-end">
        <OffersCatalogViewToggle params={params} />
      </div>

      <div className="mt-8">
        <OffersCatalogView
          params={params}
          resultCount={filteredOffers.length}
          totalCount={catalogData.offers.length}
          storeFilterLabel={storeFilterLabel}
        >
          {filteredOffers.length > 0 ? (
            isMapView ? (
              mapMarkers.length > 0 ? (
                <StoreMapDynamic markers={mapMarkers} />
              ) : (
                <EmptyState
                  title="No mappable stores"
                  description="Matching offers exist, but none of their stores have map coordinates yet. Sellers can add latitude and longitude in the seller dashboard."
                />
              )
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOffers.map((offer) => (
                  <li key={offer._id}>
                    <FoodOfferCard offer={offer} />
                  </li>
                ))}
              </ul>
            )
          ) : catalogData.offers.length === 0 ? (
            <EmptyState
              title="No published offers yet"
              description={
                <>
                  Add offers in{" "}
                  <Link
                    href="/studio"
                    className="text-brand underline-offset-2 hover:underline"
                  >
                    Sanity Studio
                  </Link>
                  .
                </>
              }
            />
          ) : (
            <EmptyState
              title="Nothing found"
              description={
                filtering ? (
                  <Link
                    href="/offers"
                    className="text-brand underline-offset-2 hover:underline"
                  >
                    Clear filters and show all offers
                  </Link>
                ) : (
                  "Try changing search parameters."
                )
              }
            />
          )}
        </OffersCatalogView>
      </div>
    </Container>
  );
}
