"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  completeOfferAction,
  unpublishOfferAction,
  type SellerFormState,
} from "@/lib/seller/actions";
import { SellerOfferStatusBadge } from "@/components/seller/seller-offer-status-badge";
import { isPublicOfferListing } from "@/lib/sanity/public-offer";
import { formatPrice } from "@/lib/sanity/format";
import {
  isReservationOpen,
  isSellerOfferNeedsAttention,
} from "@/lib/offers/lifecycle";
import type { SellerOfferListItem } from "@/lib/sanity/types";

export type SellerOffersView = "active" | "attention";

type SellerOffersListProps = {
  offers: SellerOfferListItem[];
  canMutate: boolean;
  view: SellerOffersView;
};

const unpublishInitial: SellerFormState = {};
const completeInitial: SellerFormState = {};

function UnpublishButton({ offerId }: { offerId: string }) {
  const [state, formAction, pending] = useActionState(
    unpublishOfferAction,
    unpublishInitial,
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="offerId" value={offerId} />
      {state.error ? (
        <p className="mb-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-red-700 underline-offset-2 hover:underline disabled:opacity-60"
      >
        {pending ? "..." : "Unpublish"}
      </button>
    </form>
  );
}

function CompleteButton({ offerId }: { offerId: string }) {
  const [state, formAction, pending] = useActionState(
    completeOfferAction,
    completeInitial,
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="offerId" value={offerId} />
      {state.error ? (
        <p className="mb-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mb-2 text-xs text-brand" role="status">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-brand-dark underline-offset-2 hover:underline disabled:opacity-60"
      >
        {pending ? "..." : "Mark completed"}
      </button>
    </form>
  );
}

function filterOffers(
  offers: SellerOfferListItem[],
  view: SellerOffersView,
): SellerOfferListItem[] {
  return offers.filter((offer) => {
    const needsAttention = isSellerOfferNeedsAttention(offer);
    return view === "attention" ? needsAttention : !needsAttention;
  });
}

export function SellerOffersList({
  offers,
  canMutate,
  view,
}: SellerOffersListProps) {
  const visible = filterOffers(offers, view);

  if (offers.length === 0) {
    return (
      <EmptyState
        title="No offers yet"
        description={
          canMutate ? (
            <>
              Create the first offer for your store. New bundles default to
              draft status.
            </>
          ) : (
            <>List is empty.</>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/seller/offers"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            view === "active"
              ? "bg-brand text-white"
              : "border border-brand/15 bg-surface text-brand-dark hover:bg-brand/5"
          }`}
        >
          Active
        </Link>
        <Link
          href="/seller/offers?view=attention"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            view === "attention"
              ? "bg-brand text-white"
              : "border border-brand/15 bg-surface text-brand-dark hover:bg-brand/5"
          }`}
        >
          Completed / needs action
        </Link>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={
            view === "attention"
              ? "Nothing needs action"
              : "No active offers"
          }
          description={
            view === "attention"
              ? "Expired, sold out, or past-deadline offers appear here."
              : "Published offers with an open reservation window appear here."
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((offer) => {
            const publicSlug = offer.slug?.current;
            const showOnSiteLink =
              Boolean(publicSlug) && isPublicOfferListing(offer);
            const pastDeadline =
              offer.publicationStatus === "published" &&
              !isReservationOpen(offer);

            return (
              <li
                key={offer._id}
                className="flex flex-col gap-3 rounded-2xl border border-brand/10 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-dark">{offer.title}</p>
                    <SellerOfferStatusBadge status={offer.publicationStatus} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatPrice(offer.price)} · {offer.quantityAvailable} pcs.
                    {offer.category?.title ? ` · ${offer.category.title}` : null}
                  </p>
                  {offer.publicationStatus === "draft" ? (
                    <p className="mt-1 text-xs text-amber-900/85">
                      Not on site — awaiting administrator publication.
                    </p>
                  ) : null}
                  {pastDeadline ? (
                    <p className="mt-1 text-xs text-amber-900/85">
                      Reservation deadline passed — extend the deadline or mark
                      completed.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Link
                    href={`/seller/offers/${offer._id}`}
                    className="font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Edit
                  </Link>
                  {showOnSiteLink && publicSlug ? (
                    <Link
                      href={`/offers/${publicSlug}`}
                      className="text-muted underline-offset-2 hover:underline"
                    >
                      On site
                    </Link>
                  ) : offer.publicationStatus === "draft" ? (
                    <span
                      className="cursor-help text-muted/80"
                      title="Link appears after administrator publication"
                    >
                      On site (soon)
                    </span>
                  ) : null}
                  {canMutate && offer.publicationStatus === "published" ? (
                    <UnpublishButton offerId={offer._id} />
                  ) : null}
                  {canMutate &&
                  (pastDeadline ||
                    offer.publicationStatus === "expired" ||
                    offer.publicationStatus === "soldOut") ? (
                    <CompleteButton offerId={offer._id} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
