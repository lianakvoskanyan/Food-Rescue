import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SellerOfferForm } from "@/components/seller/seller-offer-form";
import { ErrorState } from "@/components/ui/error-state";
import { requireSellerDashboard } from "@/lib/seller/access";
import { getCategories, SanityFetchError } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "New offer",
};

async function NewOfferContent() {
  const auth = await requireSellerDashboard("/seller/offers/new");

  if (auth.profile.role !== "seller") {
    redirect("/seller/offers");
  }

  let categories;

  try {
    categories = await getCategories();
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-muted">
          Fill in the form: photo, price, category, and pickup time. After saving,
          the offer becomes a <span className="font-medium text-brand-dark">draft</span> and
          links to your store.
        </p>
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          Customers will see the bundle only after{" "}
          <strong>administrator publication approval</strong>. Until then, edit
          as needed — the offer will not appear in the catalog.
        </p>
      </div>
      <SellerOfferForm categories={categories} />
    </>
  );
}

export default function NewSellerOfferPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-brand/10" />}>
      <NewOfferContent />
    </Suspense>
  );
}
