import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SellerOffersList } from "@/components/seller/seller-offers-list";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { requireSellerDashboard } from "@/lib/seller/access";
import { getOffersForSeller, SanityFetchError } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Seller offers",
};

type SellerOffersPageProps = {
  searchParams: Promise<{ unpublished?: string; view?: string }>;
};

async function SellerOffersContent({ searchParams }: SellerOffersPageProps) {
  const auth = await requireSellerDashboard("/seller/offers");
  const params = await searchParams;
  const view =
    params.view === "attention" ? ("attention" as const) : ("active" as const);
  const isAdmin = auth.profile.role === "admin";
  const canMutate = auth.profile.role === "seller";

  let offers;

  try {
    offers = await getOffersForSeller({
      profileId: auth.profile.id,
      isAdmin,
    });
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  return (
    <>
      {params.unpublished === "1" ? (
        <p
          className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark"
          role="status"
        >
          Offer unpublished (status &ldquo;Draft&rdquo;).
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {isAdmin ? "All offers in the catalog." : "Only your store's offers."}
        </p>
        {canMutate ? (
          <ButtonLink href="/seller/offers/new" variant="primary">
            Create
          </ButtonLink>
        ) : null}
      </div>

      <SellerOffersList offers={offers} canMutate={canMutate} view={view} />

      {!canMutate ? (
        <p className="text-sm text-muted">
          Create and edit available only to the seller role.{" "}
          <Link href="/profile" className="text-brand underline-offset-2 hover:underline">
            Profile
          </Link>
        </p>
      ) : null}
    </>
  );
}

export default function SellerOffersPage(props: SellerOffersPageProps) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-brand/10" />}>
      <SellerOffersContent searchParams={props.searchParams} />
    </Suspense>
  );
}
