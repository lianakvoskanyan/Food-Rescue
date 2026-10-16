import { FoodOfferCard } from "@/components/offers/food-offer-card";
import { SectionHeader } from "@/components/ui/section-header";
import type { FoodOffer } from "@/lib/sanity/types";

type RelatedOffersSectionProps = {
  offers: FoodOffer[];
};

export function RelatedOffersSection({ offers }: RelatedOffersSectionProps) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-offers-heading" className="mt-14 border-t border-brand/10 pt-12">
      <SectionHeader
        id="related-offers-heading"
        title="Other available bundles"
        description="Similar offers from the same store or category."
      />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <li key={offer._id}>
            <FoodOfferCard offer={offer} />
          </li>
        ))}
      </ul>
    </section>
  );
}
