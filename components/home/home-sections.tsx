import Link from "next/link";
import { CategoryCard } from "@/components/categories/category-card";
import { EndingSoonSection } from "@/components/home/ending-soon-section";
import { StoresNearbyMapSection } from "@/components/home/stores-nearby-map-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { FoodOfferCard } from "@/components/offers/food-offer-card";
import { StoreCard } from "@/components/stores/store-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { filterFoodOffers } from "@/lib/sanity/filter-offers";
import type { HomePageData, SiteSettings } from "@/lib/sanity/types";

type HomeSectionsProps = {
  data: HomePageData;
  query?: string;
  categorySlug?: string;
};

function OffersGrid({ offers }: { offers: HomePageData["offers"] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {offers.map((offer) => (
        <li key={offer._id}>
          <FoodOfferCard offer={offer} />
        </li>
      ))}
    </ul>
  );
}

export function HomeSections({ data, query, categorySlug }: HomeSectionsProps) {
  const { settings, categories, stores, offers, featuredOffers, endingSoonOffers } =
    data;

  if (!settings) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Site settings are not published yet"
          description={
            <>
              Create a &ldquo;Site settings&rdquo; document in{" "}
              <Link href="/studio" className="text-brand underline-offset-2 hover:underline">
                Sanity Studio
              </Link>
              , to load homepage copy.
            </>
          }
        />
      </Container>
    );
  }

  const filteredOffers = filterFoodOffers(offers, {
    query,
    categorySlug,
  });
  const isFiltering = Boolean(query?.trim() || categorySlug);

  return (
    <>
      <PopularOffersSection
        settings={settings}
        offers={featuredOffers}
        hideWhenFiltering={isFiltering}
      />
      {!isFiltering ? <EndingSoonSection offers={endingSoonOffers} /> : null}
      {!isFiltering ? (
        <StoresNearbyMapSection offers={offers} />
      ) : null}
      <CategoriesSection
        settings={settings}
        categories={categories}
        hideWhenFiltering={isFiltering}
      />
      {!isFiltering ? <HowItWorksSection /> : null}
      <StoresSection
        settings={settings}
        stores={stores}
        hideWhenFiltering={isFiltering}
      />
      <BenefitsSection settings={settings} hideWhenFiltering={isFiltering} />
      <OffersCatalogSection
        settings={settings}
        offers={filteredOffers}
        totalOffers={offers.length}
        isFiltering={isFiltering}
        query={query}
        categorySlug={categorySlug}
      />
    </>
  );
}

function PopularOffersSection({
  settings,
  offers,
  hideWhenFiltering,
}: {
  settings: SiteSettings;
  offers: HomePageData["featuredOffers"];
  hideWhenFiltering: boolean;
}) {
  if (hideWhenFiltering) {
    return null;
  }

  const title = settings.popularSectionTitle ?? "Popular offers";

  return (
    <section
      id="popular"
      aria-labelledby="popular-offers-heading"
      className="py-12 sm:py-16"
    >
      <Container>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionHeader
              id="popular-offers-heading"
              title={title}
              description={
                settings.popularSectionDescription ??
                "Bundles marked Featured — live prices and stock from Sanity."
              }
            />
          </div>
          <ButtonLink
            href="/offers"
            variant="secondary"
            className="mb-2 shrink-0 self-start sm:mb-10 sm:self-auto"
          >
            Full catalog
          </ButtonLink>
        </div>
        {offers.length > 0 ? (
          <OffersGrid offers={offers} />
        ) : (
          <EmptyState
            title="No featured offers yet"
            description={
              <>
                Mark the relevant `foodOffer` documents with Featured offer in Studio
                or browse{" "}
                <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
                  all published bundles
                </Link>
                .
              </>
            }
          />
        )}
      </Container>
    </section>
  );
}

function CategoriesSection({
  settings,
  categories,
  hideWhenFiltering,
}: {
  settings: SiteSettings;
  categories: HomePageData["categories"];
  hideWhenFiltering: boolean;
}) {
  if (hideWhenFiltering) {
    return null;
  }

  const title = settings.categoriesSectionTitle ?? "Categories";

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="border-y border-brand/10 bg-surface/40 py-12 sm:py-16"
    >
      <Container>
        <SectionHeader
          id="categories-heading"
          title={title}
          description={
            settings.categoriesSectionDescription ??
            "Pick a food type — the filter opens in the offers catalog."
          }
        />
        {categories.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category._id}>
                <CategoryCard category={category} variant="prominent" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No categories added"
            description="Create `category` documents in Sanity Studio."
          />
        )}
      </Container>
    </section>
  );
}

function StoresSection({
  settings,
  stores,
  hideWhenFiltering,
}: {
  settings: SiteSettings;
  stores: HomePageData["stores"];
  hideWhenFiltering: boolean;
}) {
  if (hideWhenFiltering || !settings.storesSectionTitle) {
    return null;
  }

  return (
    <section aria-labelledby="stores-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeader
          id="stores-heading"
          title={settings.storesSectionTitle}
          description={settings.storesSectionDescription}
        />
        {stores.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <li key={store._id}>
                <StoreCard store={store} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No stores added"
            description="Create `store` documents in Sanity Studio."
          />
        )}
      </Container>
    </section>
  );
}

function BenefitsSection({
  settings,
  hideWhenFiltering,
}: {
  settings: SiteSettings;
  hideWhenFiltering: boolean;
}) {
  const benefits = settings.benefits ?? [];

  if (hideWhenFiltering || !settings.benefitsSectionTitle) {
    return null;
  }

  return (
    <section
      aria-labelledby="benefits-heading"
      className="relative overflow-hidden border-y border-brand/20 bg-gradient-to-br from-brand-dark via-[#1a4332] to-[#0f2419] py-14 text-white sm:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(233,184,109,0.12),transparent_50%)]"
        aria-hidden
      />
      <Container className="relative">
        <h2
          id="benefits-heading"
          className="mb-10 max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          {settings.benefitsSectionTitle}
        </h2>
        {benefits.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="rounded-3xl border border-white/12 bg-white/8 p-6 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur-md"
              >
                <h3 className="font-display text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {benefit.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Benefits not filled in"
            description={'Add a benefits list in the "Site settings" document.'}
          />
        )}
      </Container>
    </section>
  );
}

function OffersCatalogSection({
  settings,
  offers,
  totalOffers,
  isFiltering,
  query,
  categorySlug,
}: {
  settings: SiteSettings;
  offers: HomePageData["offers"];
  totalOffers: number;
  isFiltering: boolean;
  query?: string;
  categorySlug?: string;
}) {
  const title = settings.offersSectionTitle ?? "All offers";

  return (
    <section id="offers" aria-labelledby="offers-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeader
          id="offers-heading"
          title={title}
          description={settings.offersSectionDescription}
        />

        {isFiltering ? (
          <p className="mb-6 text-sm text-muted" role="status">
            {offers.length > 0
              ? `Offers found: ${offers.length}`
              : "Nothing found for your search"}
            {query?.trim() ? ` · search “${query.trim()}”` : ""}
            {categorySlug ? ` · category “${categorySlug}”` : ""}
          </p>
        ) : null}

        {offers.length > 0 ? (
          <>
            <OffersGrid offers={offers} />
            {!isFiltering ? (
              <p className="mt-10 text-center">
                <ButtonLink href="/offers" variant="secondary">
                  Open catalog with filters
                </ButtonLink>
              </p>
            ) : null}
          </>
        ) : totalOffers > 0 && isFiltering ? (
          <EmptyState
            title="Nothing found"
            description={
              <Link href="/" className="text-brand underline-offset-2 hover:underline">
                Clear filters and show all offers
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="No published offers yet"
            description={
              <>
                Add `foodOffer` documents with Published status and quantity greater than 0 in{" "}
                <Link href="/studio" className="text-brand underline-offset-2 hover:underline">
                  Sanity Studio
                </Link>
                .
              </>
            }
          />
        )}
      </Container>
    </section>
  );
}
