"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  adminSetOfferStatusAction,
  type AdminFormState,
} from "@/lib/admin/actions";
import {
  formatOfferPublicationStatus,
  isStorePublishedOnSite,
} from "@/lib/admin/labels";
import { formatPrice } from "@/lib/sanity/format";
import { isPublicOfferListing } from "@/lib/sanity/public-offer";
import type { AdminOfferListItem } from "@/lib/sanity/types";

type AdminOffersListProps = {
  offers: AdminOfferListItem[];
};

const initialState: AdminFormState = {};

function OfferStatusForm({
  offerId,
  action,
  label,
  variant,
}: {
  offerId: string;
  action: "publish" | "unpublish";
  label: string;
  variant: "primary" | "danger";
}) {
  const [state, formAction, pending] = useActionState(
    adminSetOfferStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="offerId" value={offerId} />
      <input type="hidden" name="action" value={action} />
      {state.error ? (
        <p className="mb-1 w-full text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={
          variant === "danger"
            ? "rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
            : "rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        }
      >
        {pending ? "..." : label}
      </button>
    </form>
  );
}

export function AdminOffersList({ offers }: AdminOffersListProps) {
  if (offers.length === 0) {
    return (
      <EmptyState
        title="No offers yet"
        description="Create foodOffer in Sanity Studio or via the seller dashboard."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {offers.map((offer) => {
        const status = offer.publicationStatus;
        const slug = offer.slug?.current;
        const storeHidden = offer.store && !isStorePublishedOnSite(offer.store.isPublished);
        const onCatalog = isPublicOfferListing(offer);

        return (
          <li
            key={offer._id}
            className="flex flex-col gap-4 rounded-2xl border border-brand/10 bg-surface/95 p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="font-medium text-brand-dark">{offer.title}</p>
              <p className="mt-1 text-sm text-muted">
                {formatPrice(offer.price)} · {offer.quantityAvailable} pcs. ·{" "}
                {formatOfferPublicationStatus(status)}
                {offer.store?.title ? ` · ${offer.store.title}` : null}
                {offer.category?.title ? ` · ${offer.category.title}` : null}
              </p>
              {storeHidden ? (
                <p className="mt-1 text-xs text-amber-800">
                  Store is hidden from the storefront — offer is not visible in the catalog.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {slug ? (
                <>
                  <Link
                    href={`/admin/preview/offers/${encodeURIComponent(slug)}`}
                    className="text-sm font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Preview
                  </Link>
                  {onCatalog ? (
                    <Link
                      href={`/offers/${slug}`}
                      className="text-sm text-muted underline-offset-2 hover:text-brand hover:underline"
                    >
                      On storefront
                    </Link>
                  ) : null}
                </>
              ) : null}
              {status === "published" ? (
                <OfferStatusForm
                  offerId={offer._id}
                  action="unpublish"
                  label="Unpublish"
                  variant="danger"
                />
              ) : null}
              {status === "draft" ? (
                <OfferStatusForm
                  offerId={offer._id}
                  action="publish"
                  label="Publish"
                  variant="primary"
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
