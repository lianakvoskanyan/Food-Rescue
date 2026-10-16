import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SellerOfferForm } from "@/components/seller/seller-offer-form";
import { SellerOfferPublicationNotice } from "@/components/seller/seller-offer-publication-notice";
import { ErrorState } from "@/components/ui/error-state";
import { requireSellerDashboard } from "@/lib/seller/access";
import {
  getCategories,
  getOfferForSellerEdit,
  SanityFetchError,
} from "@/lib/sanity/fetch";

type SellerOfferEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

async function EditOfferContent({ params, searchParams }: SellerOfferEditPageProps) {
  const auth = await requireSellerDashboard("/seller/offers");
  const { id } = await params;
  const query = await searchParams;
  const isAdmin = auth.profile.role === "admin";
  const canMutate = auth.profile.role === "seller";

  let offer;
  let categories;

  try {
    [offer, categories] = await Promise.all([
      getOfferForSellerEdit(id),
      getCategories(),
    ]);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  if (!offer) {
    notFound();
  }

  if (!isAdmin && offer.sellerProfileId !== auth.profile.id) {
    redirect("/seller/offers");
  }

  return (
    <>
      <SellerOfferPublicationNotice
        status={offer.publicationStatus}
        justCreated={query.created === "1"}
      />

      <p className="text-sm text-muted">
        Slug: {offer.slug?.current ?? "—"} (updates when the title changes).
      </p>

      <SellerOfferForm
        categories={categories}
        offer={offer}
        readOnly={!canMutate}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: SellerOfferEditPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Offer ${id}` };
}

export default function SellerOfferEditPage(props: SellerOfferEditPageProps) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-brand/10" />}>
      <EditOfferContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
