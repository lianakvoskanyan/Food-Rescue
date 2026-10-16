import Link from "next/link";
import { SiteNavLink } from "@/components/layout/site-nav-link";
import { StoreMapDynamic } from "@/components/maps/store-map-dynamic";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { offersCatalogMapHref } from "@/lib/offers/catalog-hrefs";
import type { FoodOffer } from "@/lib/sanity/types";
import { buildStoreMapMarkersFromOffers } from "@/lib/stores/map-markers";

type StoresNearbyMapSectionProps = {
  offers: FoodOffer[];
};

export function StoresNearbyMapSection({ offers }: StoresNearbyMapSectionProps) {
  const markers = buildStoreMapMarkersFromOffers(offers);
  const hasBookableOffers = offers.length > 0;

  return (
    <section
      id="stores-nearby"
      aria-labelledby="stores-nearby-heading"
      className="border-y border-brand/10 bg-surface/50 py-12 sm:py-16"
    >
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            id="stores-nearby-heading"
            title="Find stores near you"
            description="Live map of venues with bookable rescue offers — coordinates and addresses from Sanity."
          />
          <ButtonLink
            href={offersCatalogMapHref()}
            variant="secondary"
            className="shrink-0 self-start lg:mb-10 lg:self-auto"
          >
            Open full map
          </ButtonLink>
        </div>

        {markers.length > 0 ? (
          <StoreMapDynamic
            markers={markers}
            heightClassName="h-[min(65vh,440px)] sm:h-[min(60vh,480px)]"
          />
        ) : hasBookableOffers ? (
          <EmptyState
            title="Map coordinates not set yet"
            description={
              <>
                There are active offers, but no store locations on the map. Browse
                the{" "}
                <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
                  offers catalog
                </Link>{" "}
                or see the{" "}
                <SiteNavLink
                  href="#stores-heading"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  store list
                </SiteNavLink>{" "}
                below. Sellers can add latitude and longitude in the seller
                dashboard.
              </>
            }
          />
        ) : (
          <EmptyState
            title="No bookable offers on the map"
            description={
              <>
                When venues publish offers with map coordinates, they will appear
                here. Meanwhile, check the{" "}
                <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
                  catalog
                </Link>
                .
              </>
            }
          />
        )}

        {markers.length > 0 ? (
          <p className="mt-6 text-center text-sm text-muted">
            <Link
              href={offersCatalogMapHref()}
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              All stores on the map
            </Link>
            {" · "}
            Tap a pin for offers and prices
          </p>
        ) : null}
      </Container>
    </section>
  );
}
