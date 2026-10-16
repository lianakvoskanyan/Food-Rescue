import Link from "next/link";
import { StoreMapDynamic } from "@/components/maps/store-map-dynamic";
import { formatStoreAddress } from "@/lib/sanity/format";
import type { Store } from "@/lib/sanity/types";
import {
  buildOsmDirectionsUrl,
  getStoreGeopoint,
} from "@/lib/stores/location";
import {
  getStoreMapMarkerImageUrl,
  getStoreMapPopupImageUrl,
} from "@/lib/stores/map-marker-images";
import type { StoreMapMarkerData } from "@/lib/stores/map-markers";

type StoreLocationPanelProps = {
  store: Pick<
    Store,
    "_id" | "title" | "slug" | "address" | "location" | "image"
  >;
};

function toMarker(store: StoreLocationPanelProps["store"]): StoreMapMarkerData | null {
  const geo = getStoreGeopoint(store);
  if (!geo || !store.slug?.current) {
    return null;
  }

  return {
    storeId: store._id,
    title: store.title,
    storeSlug: store.slug.current,
    addressLine: formatStoreAddress(store.address),
    lat: geo.lat,
    lng: geo.lng,
    storeMarkerImageUrl: getStoreMapMarkerImageUrl(store.image),
    storePopupImageUrl: getStoreMapPopupImageUrl(store.image),
    bestOffer: null,
    featuredOffer: null,
    offersPreview: [],
    offerCount: 0,
  };
}

export function StoreLocationPanel({ store }: StoreLocationPanelProps) {
  const addressLine = formatStoreAddress(store.address);
  const geo = getStoreGeopoint(store);
  const marker = toMarker(store);

  return (
    <section
      aria-labelledby="store-location-heading"
      className="space-y-3 rounded-2xl border border-brand/10 bg-background p-4"
    >
      <h2
        id="store-location-heading"
        className="font-display text-lg font-semibold text-brand-dark"
      >
        Location
      </h2>

      {addressLine ? (
        <p className="text-sm text-muted">{addressLine}</p>
      ) : (
        <p className="text-sm text-muted">Address not provided yet.</p>
      )}

      {geo && marker ? (
        <>
          <StoreMapDynamic
            markers={[marker]}
            singleMarkerId={store._id}
            heightClassName="h-48 sm:h-56"
          />
          <Link
            href={buildOsmDirectionsUrl(geo.lat, geo.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            Get directions
          </Link>
        </>
      ) : (
        <p className="text-sm text-muted">
          Map coordinates are not set for this store yet. The seller can add
          them in the seller dashboard.
        </p>
      )}
    </section>
  );
}
