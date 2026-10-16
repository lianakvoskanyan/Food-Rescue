"use client";

import { useActionState } from "react";
import { SellerOfferPhotoField } from "@/components/seller/seller-offer-photo-field";
import { tryGetImageUrl } from "@/lib/sanity/image";
import {
  createOfferAction,
  updateOfferAction,
  type SellerFormState,
} from "@/lib/seller/actions";
import { toDatetimeLocalValue } from "@/lib/seller/datetime";
import type { Category } from "@/lib/sanity/types";
import type { SellerOfferEdit } from "@/lib/sanity/fetch";
const sellerPublishedStatusOptions = [
  { value: "published", title: "Published" },
  { value: "soldOut", title: "Sold out" },
  { value: "expired", title: "Expired" },
] as const;

type SellerOfferFormProps = {
  categories: Category[];
  offer?: SellerOfferEdit;
  readOnly?: boolean;
};

const initialState: SellerFormState = {};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  soldOut: "Sold out",
  expired: "Expired",
};

export function SellerOfferForm({
  categories,
  offer,
  readOnly = false,
}: SellerOfferFormProps) {
  const isEdit = Boolean(offer);
  const action = isEdit ? updateOfferAction : createOfferAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const publicationStatus = offer?.publicationStatus ?? "draft";
  const showPublishedStatusSelect =
    isEdit &&
    !readOnly &&
    (publicationStatus === "published" ||
      publicationStatus === "expired" ||
      publicationStatus === "soldOut");

  const currentImageUrl = tryGetImageUrl(offer?.image, (builder) =>
    builder.width(640).height(420).fit("crop"),
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-brand/10 bg-surface p-5"
    >
      {offer ? <input type="hidden" name="offerId" value={offer._id} /> : null}
      {isEdit && !showPublishedStatusSelect ? (
        <input type="hidden" name="publicationStatus" value={publicationStatus} />
      ) : null}

      {!isEdit && !readOnly ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          After creation the offer will be a <strong>draft</strong> until review by an
          administrator.
        </p>
      ) : null}

      <SellerOfferPhotoField
        readOnly={readOnly}
        prominent={!isEdit}
        existingImageUrl={currentImageUrl ?? null}
        existingAlt={offer?.title ? `Photo: ${offer.title}` : undefined}
      />

      <div className="space-y-1.5">
        <label htmlFor="offer-title" className="text-sm font-medium text-brand-dark">
          Name
        </label>
        <input
          id="offer-title"
          name="title"
          required
          defaultValue={offer?.title ?? ""}
          readOnly={readOnly}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="offer-description" className="text-sm font-medium text-brand-dark">
          Description
        </label>
        <textarea
          id="offer-description"
          name="description"
          rows={4}
          defaultValue={offer?.description ?? ""}
          readOnly={readOnly}
          className="w-full rounded-xl border border-brand/10 bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="offer-price" className="text-sm font-medium text-brand-dark">
            Price (AMD)
          </label>
          <input
            id="offer-price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={offer?.price ?? ""}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-original-price" className="text-sm font-medium text-brand-dark">
            Original price
          </label>
          <input
            id="offer-original-price"
            name="originalPrice"
            type="number"
            min={0}
            required
            defaultValue={offer?.originalPrice ?? ""}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="offer-category" className="text-sm font-medium text-brand-dark">
            Category
          </label>
          <select
            id="offer-category"
            name="categoryId"
            required
            defaultValue={offer?.categoryId ?? ""}
            disabled={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-quantity" className="text-sm font-medium text-brand-dark">
            Bundles available
          </label>
          <input
            id="offer-quantity"
            name="quantityAvailable"
            type="number"
            min={0}
            required
            defaultValue={offer?.quantityAvailable ?? 1}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
          <p className="text-xs text-muted">
            Stock decreases when booked. Do not set below what you actually have.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="offer-reservation-deadline"
            className="text-sm font-medium text-brand-dark"
          >
            Reservation deadline (optional)
          </label>
          <input
            id="offer-reservation-deadline"
            name="reservationDeadline"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(
              offer?.reservationDeadline ?? undefined,
            )}
            readOnly={readOnly}
            className="min-h-11 w-full max-w-md rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
          <p className="text-xs text-muted">
            Last moment customers can book. Leave empty to use pickup end time.
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-pickup-start" className="text-sm font-medium text-brand-dark">
            Pickup start
          </label>
          <input
            id="offer-pickup-start"
            name="pickupStart"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalValue(offer?.pickupWindow?.start)}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-pickup-end" className="text-sm font-medium text-brand-dark">
            Pickup end
          </label>
          <input
            id="offer-pickup-end"
            name="pickupEnd"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalValue(offer?.pickupWindow?.end)}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
      </div>

      {showPublishedStatusSelect ? (
        <div className="space-y-1.5">
          <label htmlFor="offer-status" className="text-sm font-medium text-brand-dark">
            Storefront status
          </label>
          <select
            id="offer-status"
            name="publicationStatus"
            defaultValue={publicationStatus}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          >
            {sellerPublishedStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {statusLabels[option.value] ?? option.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">
            Extend the reservation deadline to republish expired offers. Unpublish
            via the offers list when needed.
          </p>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-brand" role="status">
          {state.success}
        </p>
      ) : null}

      {!readOnly ? (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : isEdit ? "Save offer" : "Create draft"}
        </button>
      ) : null}
    </form>
  );
}
