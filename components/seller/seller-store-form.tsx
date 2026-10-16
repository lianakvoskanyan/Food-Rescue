"use client";

import { useActionState } from "react";
import { SellerOfferPhotoField } from "@/components/seller/seller-offer-photo-field";
import {
  createStoreAction,
  updateStoreAction,
  type SellerFormState,
} from "@/lib/seller/actions";
import { tryGetImageUrl } from "@/lib/sanity/image";
import type { Store } from "@/lib/sanity/types";

type SellerStoreFormProps = {
  store?: Store | null;
  readOnly?: boolean;
};

const initialState: SellerFormState = {};

export function SellerStoreForm({ store = null, readOnly = false }: SellerStoreFormProps) {
  const isCreate = !store;
  const [state, formAction, pending] = useActionState(
    isCreate ? createStoreAction : updateStoreAction,
    initialState,
  );

  const currentImageUrl = tryGetImageUrl(store?.image, (builder) =>
    builder.width(640).height(420).fit("crop"),
  );

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-4 rounded-2xl border border-brand/10 bg-surface p-5"
    >
      <SellerOfferPhotoField
        readOnly={readOnly}
        prominent={isCreate}
        title="Store photo"
        hint="Storefront or interior photo — up to 5 MB. Optional, but helps customers recognize you."
        existingImageUrl={currentImageUrl}
        existingAlt={store?.title ? `Photo: ${store.title}` : "Store photo"}
      />

      <div className="space-y-1.5">
        <label htmlFor="store-title" className="text-sm font-medium text-brand-dark">
          Name
        </label>
        <input
          id="store-title"
          name="title"
          defaultValue={store?.title ?? ""}
          required
          readOnly={readOnly}
          placeholder={isCreate ? "e.g. Bakery on Abovyan" : undefined}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm disabled:opacity-70"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="store-description" className="text-sm font-medium text-brand-dark">
          Description
        </label>
        <textarea
          id="store-description"
          name="description"
          rows={4}
          defaultValue={store?.description ?? ""}
          readOnly={readOnly}
          className="w-full rounded-xl border border-brand/10 bg-background px-3 py-2 text-sm disabled:opacity-70"
        />
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Address</legend>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="store-street" className="text-sm font-medium text-brand-dark">
            Street
          </label>
          <input
            id="store-street"
            name="street"
            defaultValue={store?.address?.street ?? ""}
            required
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="store-city" className="text-sm font-medium text-brand-dark">
            City
          </label>
          <input
            id="store-city"
            name="city"
            defaultValue={store?.address?.city ?? ""}
            required
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="store-postal" className="text-sm font-medium text-brand-dark">
            Postal code
          </label>
          <input
            id="store-postal"
            name="postalCode"
            defaultValue={store?.address?.postalCode ?? ""}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="text-sm font-medium text-brand-dark">
          Map coordinates
        </legend>
        <p className="text-sm text-muted sm:col-span-2">
          Optional. Used on the offers map and offer pages. You can copy coordinates
          from{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline-offset-2 hover:underline"
          >
            OpenStreetMap
          </a>{" "}
          (right-click → show address). Leave both empty to remove the pin.
        </p>
        <div className="space-y-1.5">
          <label htmlFor="store-latitude" className="text-sm text-muted">
            Latitude
          </label>
          <input
            id="store-latitude"
            name="latitude"
            type="text"
            inputMode="decimal"
            defaultValue={
              store?.location != null && Number.isFinite(store.location.lat)
                ? String(store.location.lat)
                : ""
            }
            readOnly={readOnly}
            placeholder="e.g. 40.1776"
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="store-longitude" className="text-sm text-muted">
            Longitude
          </label>
          <input
            id="store-longitude"
            name="longitude"
            type="text"
            inputMode="decimal"
            defaultValue={
              store?.location != null && Number.isFinite(store.location.lng)
                ? String(store.location.lng)
                : ""
            }
            readOnly={readOnly}
            placeholder="e.g. 44.5136"
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="text-sm font-medium text-brand-dark">Contact</legend>
        <div className="space-y-1.5">
          <label htmlFor="store-phone" className="text-sm text-muted">
            Phone
          </label>
          <input
            id="store-phone"
            name="phone"
            defaultValue={store?.contactInfo?.phone ?? ""}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="store-email" className="text-sm text-muted">
            Email
          </label>
          <input
            id="store-email"
            name="email"
            type="email"
            defaultValue={store?.contactInfo?.email ?? ""}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="store-website" className="text-sm text-muted">
            Website
          </label>
          <input
            id="store-website"
            name="website"
            type="url"
            defaultValue={store?.contactInfo?.website ?? ""}
            readOnly={readOnly}
            className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm"
          />
        </div>
      </fieldset>

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
          {pending
            ? "Saving..."
            : isCreate
              ? "Create store"
              : "Save store"}
        </button>
      ) : null}
    </form>
  );
}
