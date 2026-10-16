import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SellerStats } from "@/components/seller/seller-stats";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { requireSellerDashboard } from "@/lib/seller/access";
import {
  getSellerDashboardStats,
  getStoreForSeller,
  SanityFetchError,
} from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Seller dashboard",
};

async function SellerOverviewContent() {
  await connection();
  const auth = await requireSellerDashboard("/seller");
  const isAdmin = auth.profile.role === "admin";
  const canMutate = auth.profile.role === "seller";

  let stats;
  let store = null;

  try {
    [stats, store] = await Promise.all([
      getSellerDashboardStats({
        profileId: auth.profile.id,
        isAdmin,
      }),
      canMutate ? getStoreForSeller(auth.profile.id) : Promise.resolve(null),
    ]);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  return (
    <>
      {canMutate && !store ? (
        <EmptyState
          title="Create a store first"
          description={
            <>
              Fill in store details and photo on the site — then you can add
              offers.{" "}
              <Link href="/seller/store" className="text-brand underline-offset-2 hover:underline">
                Go to store creation
              </Link>
            </>
          }
        />
      ) : null}

      {isAdmin ? (
        <p className="text-sm text-muted">
          Administrator mode: stats for all stores. Changes — only under a
          seller account.
        </p>
      ) : null}

      <SellerStats stats={stats} />

      <div className="flex flex-wrap gap-3 pt-2">
        <ButtonLink href="/seller/store" variant="secondary">
          My store
        </ButtonLink>
        <ButtonLink href="/seller/offers" variant="secondary">
          Offers
        </ButtonLink>
        <ButtonLink href="/seller/bookings" variant="primary">
          Orders ({stats.bookingsActive})
        </ButtonLink>
        {canMutate && store ? (
          <ButtonLink href="/seller/offers/new" variant="primary">
            New offer
          </ButtonLink>
        ) : null}
      </div>

      {!canMutate ? (
        <p className="text-sm text-muted">
          Seller role required to edit.{" "}
          <Link href="/profile" className="text-brand underline-offset-2 hover:underline">
            Profile
          </Link>
        </p>
      ) : null}
    </>
  );
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-brand/10" />}>
      <SellerOverviewContent />
    </Suspense>
  );
}
