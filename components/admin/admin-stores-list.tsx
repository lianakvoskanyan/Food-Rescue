"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  adminSetStorePublishedAction,
  type AdminFormState,
} from "@/lib/admin/actions";
import { isStorePublishedOnSite } from "@/lib/admin/labels";
import type { AdminStoreListItem } from "@/lib/sanity/types";

type AdminStoresListProps = {
  stores: AdminStoreListItem[];
};

const initialState: AdminFormState = {};

function StorePublishForm({
  storeId,
  action,
  label,
  variant,
}: {
  storeId: string;
  action: "publish" | "unpublish";
  label: string;
  variant: "primary" | "danger";
}) {
  const [state, formAction, pending] = useActionState(
    adminSetStorePublishedAction,
    initialState,
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="action" value={action} />
      {state.error ? (
        <p className="mb-1 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mb-1 text-xs text-brand" role="status">
          {state.success}
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

export function AdminStoresList({ stores }: AdminStoresListProps) {
  if (stores.length === 0) {
    return (
      <EmptyState
        title="No stores yet"
        description="Create store documents in Sanity Studio."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {stores.map((store) => {
        const published = isStorePublishedOnSite(store.isPublished);
        const slug = store.slug?.current;

        return (
          <li
            key={store._id}
            className="flex flex-col gap-4 rounded-2xl border border-brand/10 bg-surface/95 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-brand-dark">{store.title}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    published
                      ? "bg-brand/10 text-brand"
                      : "bg-muted/15 text-muted"
                  }`}
                >
                  {published ? "On storefront" : "Hidden"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                Offers: {store.offersCount} · published:{" "}
                {store.publishedOffersCount}
                {store.sellerEmail ? ` · seller: ${store.sellerEmail}` : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {slug ? (
                <>
                  <Link
                    href={`/admin/preview/stores/${encodeURIComponent(slug)}`}
                    className="text-sm font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Preview
                  </Link>
                  {published ? (
                    <Link
                      href={`/stores/${slug}`}
                      className="text-sm text-muted underline-offset-2 hover:text-brand hover:underline"
                    >
                      On storefront
                    </Link>
                  ) : null}
                </>
              ) : null}
              {published ? (
                <StorePublishForm
                  storeId={store._id}
                  action="unpublish"
                  label="Hide from storefront"
                  variant="danger"
                />
              ) : (
                <StorePublishForm
                  storeId={store._id}
                  action="publish"
                  label="Publish"
                  variant="primary"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
