import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SellerStoreForm } from "@/components/seller/seller-store-form";
import { ErrorState } from "@/components/ui/error-state";
import { requireSellerDashboard } from "@/lib/seller/access";
import {
  getStoreForSeller,
  getStoreForSellerById,
  SanityFetchError,
} from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Seller store",
};

type SellerStorePageProps = {
  searchParams: Promise<{ setup?: string; created?: string; id?: string }>;
};

async function SellerStoreContent({ searchParams }: SellerStorePageProps) {
  await connection();
  const auth = await requireSellerDashboard("/seller/store");
  const query = await searchParams;
  const canMutate = auth.profile.role === "seller";

  let store;

  try {
    store = await getStoreForSeller(auth.profile.id);

    if (!store && query.id) {
      store = await getStoreForSellerById({
        profileId: auth.profile.id,
        storeId: query.id,
      });
    }
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  if (!store) {
    if (query.created === "1") {
      return (
        <div className="space-y-4" role="status">
          <p className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark">
            The store was likely already created. Refresh the page — the edit form should
            open.
          </p>
          <Link
            href="/seller/store"
            className="inline-flex text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            Refresh store page
          </Link>
        </div>
      );
    }

    if (!canMutate) {
      return (
        <p className="text-sm text-muted">
          This seller has no store yet. Creation is only available to the seller account owner.
        </p>
      );
    }

    return (
      <>
        {query.setup === "1" ? (
          <p
            className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark"
            role="status"
          >
            Welcome! Fill in store details — then you can add
            offers.
          </p>
        ) : null}
        <p className="text-sm leading-relaxed text-muted">
          Create your store once. It stays hidden until an administrator publishes it.
        </p>
        <SellerStoreForm />
      </>
    );
  }

  return (
    <>
      {query.created === "1" ? (
        <p
          className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark"
          role="status"
        >
          Store created.{" "}
          <Link href="/seller/offers/new" className="font-semibold text-brand underline-offset-2 hover:underline">
            Add your first offer
          </Link>
          .
        </p>
      ) : null}

      {store.isPublished === false ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Store is not on the storefront yet — an administrator will publish it under Stores in the admin panel.
        </p>
      ) : null}

      <p className="text-sm text-muted">
        Store slug:{" "}
        <span className="font-medium text-brand-dark">{store.slug?.current ?? "—"}</span>
        {canMutate ? " (generated from the name on creation)." : null}
      </p>
      <SellerStoreForm store={store} readOnly={!canMutate} />
    </>
  );
}

export default function SellerStorePage(props: SellerStorePageProps) {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-brand/10" />}>
      <SellerStoreContent searchParams={props.searchParams} />
    </Suspense>
  );
}
