import Link from "next/link";
import {
  buildOffersCatalogHref,
  type ParsedOffersCatalogParams,
} from "@/lib/sanity/catalog-params";
import type { Category } from "@/lib/sanity/types";

type OffersCatalogFiltersProps = {
  categories: Category[];
  params: ParsedOffersCatalogParams;
};

export function OffersCatalogFilters({
  categories,
  params,
}: OffersCatalogFiltersProps) {
  return (
    <form
      action="/offers"
      method="get"
      className="grid gap-4 rounded-2xl border border-brand/10 bg-surface p-4 sm:p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end"
    >
      {params.view === "map" ? (
        <input type="hidden" name="view" value="map" />
      ) : null}
      {params.storeSlug ? (
        <input type="hidden" name="store" value={params.storeSlug} />
      ) : null}
      <div className="space-y-1.5 lg:col-span-1">
        <label htmlFor="offers-q" className="text-sm font-medium text-brand-dark">
          Search
        </label>
        <input
          id="offers-q"
          name="q"
          type="search"
          defaultValue={params.query ?? ""}
          placeholder="Title or store"
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="offers-category"
          className="text-sm font-medium text-brand-dark"
        >
          Category
        </label>
        <select
          id="offers-category"
          name="category"
          defaultValue={params.categorySlug ?? ""}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.slug.current}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="offers-min-price"
          className="text-sm font-medium text-brand-dark"
        >
          Price from
        </label>
        <input
          id="offers-min-price"
          name="minPrice"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          defaultValue={params.minPrice ?? ""}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="offers-max-price"
          className="text-sm font-medium text-brand-dark"
        >
          Price to
        </label>
        <input
          id="offers-max-price"
          name="maxPrice"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          defaultValue={params.maxPrice ?? ""}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="offers-sort" className="text-sm font-medium text-brand-dark">
          Sort
        </label>
        <select
          id="offers-sort"
          name="sort"
          defaultValue={params.sort}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <option value="pickup">By pickup time</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 lg:col-span-full lg:justify-end">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Apply
        </button>
        <Link
          href={buildOffersCatalogHref({ ...params, view: "list" })}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand/15 px-5 text-sm font-semibold text-brand-dark hover:bg-brand/5"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
