import { Suspense } from "react";
import { OffersCatalogContent } from "@/components/offers/offers-catalog-content";
import { OffersCatalogFallback } from "@/components/offers/offers-catalog-fallback";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offers catalog",
  description:
    "Search and filter discounted food bundles from local shops and cafés.",
};

type OffersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function OffersPage({ searchParams }: OffersPageProps) {
  return (
    <main className="flex-1">
      <Suspense fallback={<OffersCatalogFallback />}>
        <OffersCatalogContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
