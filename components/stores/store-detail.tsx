import Image from "next/image";
import Link from "next/link";
import { FoodOfferCard } from "@/components/offers/food-offer-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { formatStoreAddress } from "@/lib/sanity/format";
import { urlForImage } from "@/lib/sanity/image";
import type { StoreWithOffers } from "@/lib/sanity/types";

type StoreDetailPreviewOptions = {
  offerDetailHref: (offerSlug: string) => string;
  offersSectionDescription?: string;
};

type StoreDetailProps = {
  store: StoreWithOffers;
  preview?: StoreDetailPreviewOptions;
};

export function StoreDetail({ store, preview }: StoreDetailProps) {
  const imageUrl = store.image
    ? urlForImage(store.image).width(1200).height(700).fit("crop").url()
    : null;
  const address = formatStoreAddress(store.address);
  const offers = store.offers ?? [];
  const { contactInfo } = store;

  return (
    <>
      <div className="mb-8">
        <ButtonLink href="/offers" variant="ghost" className="mb-4 px-0">
          ← Offers catalog
        </ButtonLink>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-brand/10 bg-brand/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={store.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No photo
              </div>
            )}
          </div>

          <div className="space-y-5 rounded-3xl border border-brand/10 bg-surface p-6 shadow-sm sm:p-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
              {store.title}
            </h1>

            {store.description ? (
              <p className="text-sm leading-relaxed text-muted">{store.description}</p>
            ) : null}

            {address ? (
              <div>
                <h2 className="text-sm font-medium text-brand-dark">Address</h2>
                <p className="mt-1 text-sm text-muted">{address}</p>
              </div>
            ) : null}

            {contactInfo &&
            (contactInfo.phone || contactInfo.email || contactInfo.website) ? (
              <div>
                <h2 className="text-sm font-medium text-brand-dark">Contact</h2>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {contactInfo.phone ? <li>{contactInfo.phone}</li> : null}
                  {contactInfo.email ? (
                    <li>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-brand underline-offset-2 hover:underline"
                      >
                        {contactInfo.email}
                      </a>
                    </li>
                  ) : null}
                  {contactInfo.website ? (
                    <li>
                      <a
                        href={contactInfo.website}
                        className="text-brand underline-offset-2 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {contactInfo.website}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section aria-labelledby="store-offers-heading">
        <SectionHeader
          id="store-offers-heading"
          title="Store offers"
          description={
            preview?.offersSectionDescription ??
            "Published bundles available for pickup now."
          }
        />

        {offers.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <li key={offer._id}>
                <FoodOfferCard
                  offer={offer}
                  detailHref={
                    preview && offer.slug?.current
                      ? preview.offerDetailHref(offer.slug.current)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No offers available right now"
            description={
              <>
                Check back later or browse{" "}
                <Link
                  href="/offers"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  the full catalog
                </Link>
                .
              </>
            }
          />
        )}
      </section>
    </>
  );
}
