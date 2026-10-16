import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPreviewBanner } from "@/components/admin/admin-preview-banner";
import { FoodOfferDetail } from "@/components/offers/food-offer-detail";
import { ErrorState } from "@/components/ui/error-state";
import { requireAdminDashboard } from "@/lib/admin/access";
import {
  formatOfferPublicationStatus,
  isStorePublishedOnSite,
} from "@/lib/admin/labels";
import { getFoodOfferBySlugForAdminPreview } from "@/lib/admin/preview";
import { parseOfferSlugParam } from "@/lib/sanity/catalog-params";
import { isPublicFoodOffer, SanityFetchError } from "@/lib/sanity/fetch";

type AdminOfferPreviewPageProps = {
  params: Promise<{ slug: string }>;
};

async function AdminOfferPreviewContent({ params }: AdminOfferPreviewPageProps) {
  await requireAdminDashboard("/admin/offers");

  const { slug: rawSlug } = await params;
  const slug = parseOfferSlugParam(rawSlug);

  if (!slug) {
    notFound();
  }

  let offer;

  try {
    offer = await getFoodOfferBySlugForAdminPreview(slug);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  if (!offer) {
    notFound();
  }

  const relatedOffers = (offer.relatedOffers ?? []).filter(isPublicFoodOffer);
  const storeHidden =
    offer.store && !isStorePublishedOnSite(offer.store.isPublished);
  const statusLabel = formatOfferPublicationStatus(offer.publicationStatus);
  const onCatalog = isPublicFoodOffer(offer);

  const lines = [
    `Offer status: ${statusLabel}.`,
    storeHidden
      ? "Store is hidden — this offer will not appear in the catalog until the store is published."
      : offer.publicationStatus === "draft"
        ? "Draft is not visible to customers in the catalog."
        : onCatalog
          ? "Offer is currently available to customers on the site."
          : "Not shown on storefront (status or quantity).",
    "Booking is disabled in preview.",
  ];

  const storeSlug = offer.store?.slug?.current;

  return (
    <>
      <AdminPreviewBanner
        backHref="/admin/offers"
        backLabel="← Back to offers list"
        title="Preview mode (administrators only)"
        lines={lines}
      />
      <FoodOfferDetail
        offer={{ ...offer, relatedOffers }}
        bookingAccess="preview"
        loginHref={`/login?next=${encodeURIComponent(`/admin/preview/offers/${slug}`)}`}
        preview={{
          backHref: "/admin/offers",
          backLabel: "← Back to offer moderation",
          storeHref: storeSlug
            ? `/admin/preview/stores/${encodeURIComponent(storeSlug)}`
            : null,
        }}
      />
      {onCatalog && offer.slug?.current ? (
        <p className="mt-6 text-center text-sm text-muted">
          Public page:{" "}
          <Link
            href={`/offers/${offer.slug.current}`}
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            /offers/{offer.slug.current}
          </Link>
        </p>
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  title: "Offer preview",
  robots: { index: false, follow: false },
};

export default function AdminOfferPreviewPage(props: AdminOfferPreviewPageProps) {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-brand/10" />}>
      <AdminOfferPreviewContent params={props.params} />
    </Suspense>
  );
}
