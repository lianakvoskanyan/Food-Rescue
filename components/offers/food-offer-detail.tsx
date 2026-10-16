import Image from "next/image";
import Link from "next/link";
import { RelatedOffersSection } from "@/components/offers/related-offers-section";
import { ButtonLink } from "@/components/ui/button";
import {
  formatPickupWindow,
  formatPrice,
  getDiscountPercent,
} from "@/lib/sanity/format";
import { urlForImage } from "@/lib/sanity/image";
import { OfferBookingPanel } from "@/components/offers/offer-booking-panel";
import { StoreLocationPanel } from "@/components/stores/store-location-panel";
import type { OfferBookingAccess } from "@/components/bookings/offer-booking-form";
import type { FoodOfferWithRelated } from "@/lib/sanity/types";

type FoodOfferDetailPreviewOptions = {
  backHref: string;
  backLabel: string;
  storeHref?: string | null;
};

type FoodOfferDetailProps = {
  offer: FoodOfferWithRelated;
  bookingAccess: OfferBookingAccess;
  loginHref: string;
  preview?: FoodOfferDetailPreviewOptions;
};

export function FoodOfferDetail({
  offer,
  bookingAccess,
  loginHref,
  preview,
}: FoodOfferDetailProps) {
  const imageUrl = offer.image
    ? urlForImage(offer.image).width(1200).height(800).fit("crop").url()
    : null;

  const hasPrice = typeof offer.price === "number" && Number.isFinite(offer.price);
  const hasOriginalPrice =
    typeof offer.originalPrice === "number" &&
    Number.isFinite(offer.originalPrice);
  const showOriginalPrice =
    hasPrice && hasOriginalPrice && offer.originalPrice > offer.price;
  const discount = showOriginalPrice
    ? getDiscountPercent(offer.price, offer.originalPrice)
    : 0;

  const storeHref =
    preview?.storeHref ??
    (offer.store?.slug?.current
      ? `/stores/${offer.store.slug.current}`
      : null);
  const categoryHref = offer.category?.slug?.current
    ? `/offers?category=${encodeURIComponent(offer.category.slug.current)}`
    : null;

  const relatedOffers = (offer.relatedOffers ?? []).filter(
    (item) => item._id !== offer._id,
  );

  return (
    <>
      <article className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-4">
          <ButtonLink
            href={preview?.backHref ?? "/offers"}
            variant="ghost"
            className="mb-2 px-0"
          >
            {preview?.backLabel ?? "← Offers catalog"}
          </ButtonLink>

          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-brand/10 bg-brand/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={offer.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No photo
              </div>
            )}
          </div>

          {offer.description ? (
            <div className="rounded-2xl border border-brand/10 bg-surface p-5">
              <h2 className="font-display text-xl font-semibold text-brand-dark">
                About this bundle
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {offer.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-5 rounded-3xl border border-brand/10 bg-surface p-6 shadow-sm sm:p-8">
          {offer.category?.title ? (
            categoryHref ? (
              <Link
                href={categoryHref}
                className="inline-flex text-xs font-semibold uppercase tracking-wide text-brand underline-offset-2 hover:underline"
              >
                {offer.category.title}
              </Link>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {offer.category.title}
              </p>
            )
          ) : null}

          <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
            {offer.title}
          </h1>

          {hasPrice ? (
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-3xl font-semibold text-brand-dark">
                {formatPrice(offer.price)}
              </p>
              {showOriginalPrice ? (
                <p className="pb-1 text-lg text-muted line-through">
                  {formatPrice(offer.originalPrice)}
                </p>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                  Save {discount}%
                </span>
              ) : null}
            </div>
          ) : null}

          <dl className="grid gap-4 text-sm">
            {offer.pickupWindow?.start && offer.pickupWindow?.end ? (
              <div>
                <dt className="font-medium text-brand-dark">Pickup window</dt>
                <dd className="mt-1 text-muted">
                  {formatPickupWindow(offer.pickupWindow)}
                </dd>
                <dd className="mt-1 text-xs text-muted">
                  Pick up the bundle during the window at the store address.
                </dd>
              </div>
            ) : null}
            {typeof offer.quantityAvailable === "number" ? (
              <div>
                <dt className="font-medium text-brand-dark">Bundles available</dt>
                <dd className="mt-1 text-muted">{offer.quantityAvailable}</dd>
              </div>
            ) : null}
          </dl>

          <OfferBookingPanel
            offer={offer}
            access={bookingAccess}
            loginHref={loginHref}
            returnPath={
              offer.slug?.current ? `/offers/${offer.slug.current}` : "/offers"
            }
          />

          {offer.store ? (
            <section
              aria-labelledby="offer-store-heading"
              className="rounded-2xl border border-brand/10 bg-background p-4"
            >
              <h2
                id="offer-store-heading"
                className="font-display text-lg font-semibold text-brand-dark"
              >
                Store
              </h2>
              {storeHref ? (
                <Link
                  href={storeHref}
                  className="mt-2 inline-flex font-medium text-brand underline-offset-2 hover:underline"
                >
                  {offer.store.title}
                </Link>
              ) : (
                <p className="mt-2 font-medium text-brand-dark">
                  {offer.store.title}
                </p>
              )}
              {offer.store.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {offer.store.description}
                </p>
              ) : null}
              <div className="mt-4">
                <StoreLocationPanel store={offer.store} />
              </div>
            </section>
          ) : null}
        </div>
      </article>

      <RelatedOffersSection offers={relatedOffers} />
    </>
  );
}
