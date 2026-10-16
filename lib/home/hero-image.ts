import type { SanityImageSource } from "@sanity/image-url";
import type { HomePageData } from "@/lib/sanity/types";

export type HomeHeroImage = {
  source: SanityImageSource;
  alt: string;
};

/** First available image from Sanity (no stock placeholders). */
export function selectHomeHeroImage(data: HomePageData): HomeHeroImage | null {
  for (const offer of [...data.featuredOffers, ...data.offers]) {
    if (offer.image) {
      return { source: offer.image, alt: offer.title };
    }
  }

  for (const category of data.categories) {
    if (category.image) {
      return { source: category.image, alt: category.title };
    }
  }

  for (const store of data.stores) {
    if (store.image) {
      return { source: store.image, alt: store.title };
    }
  }

  return null;
}
