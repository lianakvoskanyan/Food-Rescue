import Link from "next/link";
import {
  buildOffersCatalogHref,
  type ParsedOffersCatalogParams,
} from "@/lib/sanity/catalog-params";

type OffersCatalogViewToggleProps = {
  params: ParsedOffersCatalogParams;
};

export function OffersCatalogViewToggle({
  params,
}: OffersCatalogViewToggleProps) {
  const listHref = buildOffersCatalogHref(params, { view: "list" });
  const mapHref = buildOffersCatalogHref(params, { view: "map" });
  const isMap = params.view === "map";

  return (
    <div
      className="inline-flex rounded-xl border border-brand/10 bg-surface p-1"
      role="group"
      aria-label="Catalog view"
    >
      <Link
        href={listHref}
        aria-current={!isMap ? "page" : undefined}
        className={`inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-semibold transition-colors ${
          !isMap
            ? "bg-brand text-white"
            : "text-brand-dark hover:bg-brand/5"
        }`}
      >
        List
      </Link>
      <Link
        href={mapHref}
        aria-current={isMap ? "page" : undefined}
        className={`inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-semibold transition-colors ${
          isMap
            ? "bg-brand text-white"
            : "text-brand-dark hover:bg-brand/5"
        }`}
      >
        Map
      </Link>
    </div>
  );
}
