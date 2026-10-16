import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPreviewBanner } from "@/components/admin/admin-preview-banner";
import { StoreDetail } from "@/components/stores/store-detail";
import { ErrorState } from "@/components/ui/error-state";
import { requireAdminDashboard } from "@/lib/admin/access";
import { isStorePublishedOnSite } from "@/lib/admin/labels";
import {
  getStoreBySlugForAdminPreview,
} from "@/lib/admin/preview";
import { parseStoreSlugParam } from "@/lib/sanity/catalog-params";
import { SanityFetchError } from "@/lib/sanity/fetch";

type AdminStorePreviewPageProps = {
  params: Promise<{ slug: string }>;
};

async function AdminStorePreviewContent({ params }: AdminStorePreviewPageProps) {
  await requireAdminDashboard("/admin/stores");

  const { slug: rawSlug } = await params;
  const slug = parseStoreSlugParam(rawSlug);

  if (!slug) {
    notFound();
  }

  let store;

  try {
    store = await getStoreBySlugForAdminPreview(slug);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  if (!store) {
    notFound();
  }

  const published = isStorePublishedOnSite(store.isPublished);
  const draftOffers =
    store.offers?.filter((offer) => offer.publicationStatus === "draft").length ?? 0;

  return (
    <>
      <AdminPreviewBanner
        backHref="/admin/stores"
        backLabel="← Back to stores list"
        title="Preview mode (administrators only)"
        lines={[
          published
            ? "Store is already on the storefront — this is what customers see."
            : "Store is hidden — customers will not see this page until you publish the store.",
          draftOffers > 0
            ? `This page shows all store offers, including drafts (${draftOffers}).`
            : "This page shows all store offers as after publication.",
        ]}
      />
      <StoreDetail
        store={store}
        preview={{
          offerDetailHref: (offerSlug) =>
            `/admin/preview/offers/${encodeURIComponent(offerSlug)}`,
          offersSectionDescription:
            "All bundles from this store (including drafts). Links go to offer preview.",
        }}
      />
      {published ? (
        <p className="mt-6 text-center text-sm text-muted">
          Public page:{" "}
          <Link
            href={`/stores/${slug}`}
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            /stores/{slug}
          </Link>
        </p>
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  title: "Store preview",
  robots: { index: false, follow: false },
};

export default function AdminStorePreviewPage(props: AdminStorePreviewPageProps) {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-brand/10" />}>
      <AdminStorePreviewContent params={props.params} />
    </Suspense>
  );
}
