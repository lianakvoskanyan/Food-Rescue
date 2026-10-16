import Image from "next/image";
import Link from "next/link";
import {
  formatPickupWindow,
  formatPrice,
  getDiscountPercent,
} from "@/lib/sanity/format";
import { urlForImage } from "@/lib/sanity/image";
import { FoodOfferCardAvailability } from "@/components/offers/food-offer-card-availability";
import { siteCardInteractiveClass } from "@/components/ui/site-card";
import type { FoodOffer } from "@/lib/sanity/types";

type FoodOfferCardProps = {
  offer: FoodOffer;
  detailHref?: string;
  /** Stronger urgency styling for homepage hot-deals row. */
  urgent?: boolean;
};

export function FoodOfferCard({
  offer,
  detailHref: detailHrefProp,
  urgent = false,
}: FoodOfferCardProps) {
  const imageUrl = offer.image
    ? urlForImage(offer.image).width(640).height(420).fit("crop").url()
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
  const detailHref =
    detailHrefProp ??
    (offer.slug?.current ? `/offers/${offer.slug.current}` : null);

  const cardBody = (
    <article aria-label={offer.title} className="flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={offer.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No photo
          </div>
        )}
        {urgent ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white shadow-md">
            Ending soon
          </span>
        ) : offer.isFeatured ? (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-brand-dark">
            Featured
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
            −{discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          {offer.category?.title ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {offer.category.title}
            </p>
          ) : null}
          <h3 className="font-display text-xl font-semibold text-brand-dark">
            {offer.title}
          </h3>
          {offer.store?.title ? (
            <p className="text-sm text-muted">{offer.store.title}</p>
          ) : null}
        </div>

        {offer.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {offer.description}
          </p>
        ) : null}

        <div className="mt-auto space-y-2 pt-2">
          {hasPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-brand-dark">
                {formatPrice(offer.price)}
              </span>
              {showOriginalPrice ? (
                <span className="text-sm text-muted line-through">
                  {formatPrice(offer.originalPrice)}
                </span>
              ) : null}
            </div>
          ) : null}
          {offer.pickupWindow?.start && offer.pickupWindow?.end ? (
            <p className="text-xs text-muted">
              Pickup: {formatPickupWindow(offer.pickupWindow)}
            </p>
          ) : null}
          <FoodOfferCardAvailability offer={offer} />
        </div>
      </div>
    </article>
  );

  const className = `group flex h-full flex-col ${siteCardInteractiveClass}`;

  if (!detailHref) {
    return <div className={className}>{cardBody}</div>;
  }

  return (
    <Link href={detailHref} className={className}>
      {cardBody}
    </Link>
  );
}
