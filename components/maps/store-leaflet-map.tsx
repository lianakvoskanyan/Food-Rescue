"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import Link from "next/link";
import { formatPrice, getDiscountPercent } from "@/lib/sanity/format";
import { offersCatalogStoreHref } from "@/lib/offers/catalog-hrefs";
import { createStorePhotoMarkerIcon } from "@/components/maps/store-map-marker-icon";
import type { StoreMapMarkerData } from "@/lib/stores/map-markers";
import "leaflet/dist/leaflet.css";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type StoreLeafletMapProps = {
  markers: StoreMapMarkerData[];
  className?: string;
  /** Single-marker mode (offer detail). */
  singleMarkerId?: string;
  interactive?: boolean;
};

function FitBounds({ markers }: { markers: StoreMapMarkerData[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      map.setView([20, 0], 2);
      return;
    }
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.lat, marker.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 });
  }, [map, markers]);

  return null;
}

function StorePhotoPlaceholder({ title }: { title: string }) {
  const initial = title.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-brand/15 to-brand/5 font-display text-3xl font-semibold text-brand"
      aria-hidden
    >
      {initial}
    </div>
  );
}

function MarkerPopupContent({ marker }: { marker: StoreMapMarkerData }) {
  const best = marker.bestOffer;
  const extraOffers =
    marker.offerCount > marker.offersPreview.length
      ? marker.offerCount - marker.offersPreview.length
      : 0;
  const showBestDiscount =
    best &&
    best.originalPrice > best.price &&
    getDiscountPercent(best.price, best.originalPrice) > 0;

  return (
    <div className="store-map-popup w-[min(280px,calc(100vw-2.5rem))] overflow-hidden text-sm text-brand-dark">
      {marker.storePopupImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Leaflet popup (optimized Sanity URL)
        <img
          src={marker.storePopupImageUrl}
          alt=""
          className="h-24 w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <StorePhotoPlaceholder title={marker.title} />
      )}

      <div className="space-y-2.5 p-3">
        <div>
          <p className="font-semibold leading-snug">{marker.title}</p>
          {marker.addressLine ? (
            <p className="mt-0.5 text-xs leading-snug text-muted">
              {marker.addressLine}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted">
            {marker.offerCount}{" "}
            {marker.offerCount === 1 ? "offer" : "offers"} available
          </p>
        </div>

        {best ? (
          <div className="flex gap-2.5 rounded-xl border border-brand/10 bg-surface/80 p-2">
            {best.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={best.imageUrl}
                alt=""
                className="size-14 shrink-0 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-xs font-semibold text-brand">
                Deal
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Best deal
              </p>
              <p className="truncate font-medium leading-snug">{best.title}</p>
              <p className="mt-0.5 text-xs">
                <span className="font-semibold text-brand-dark">
                  {formatPrice(best.price)}
                </span>
                {showBestDiscount ? (
                  <>
                    {" "}
                    <span className="text-muted line-through">
                      {formatPrice(best.originalPrice)}
                    </span>
                    <span className="text-brand">
                      {" "}
                      −{best.discountPercent}%
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ) : null}

        {marker.offersPreview.length > 1 ? (
          <ul className="space-y-1 border-t border-brand/10 pt-2 text-xs">
            {marker.offersPreview.slice(1).map((offer) => (
              <li key={offer.id} className="leading-snug">
                <Link
                  href={`/offers/${offer.slug}`}
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  {offer.title}
                </Link>
                <span className="text-muted"> · {formatPrice(offer.price)}</span>
              </li>
            ))}
            {extraOffers > 0 ? (
              <li className="text-muted">+{extraOffers} more offer(s)</li>
            ) : null}
          </ul>
        ) : null}

        <Link
          href={offersCatalogStoreHref(marker.storeSlug)}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          View offers
        </Link>
      </div>
    </div>
  );
}

function StoreMapMarker({
  marker,
  interactive,
}: {
  marker: StoreMapMarkerData;
  interactive: boolean;
}) {
  const icon = useMemo(() => createStorePhotoMarkerIcon(marker), [marker]);

  return (
    <Marker position={[marker.lat, marker.lng]} icon={icon}>
      {interactive ? (
        <Popup className="store-map-leaflet-popup" minWidth={240} maxWidth={300}>
          <MarkerPopupContent marker={marker} />
        </Popup>
      ) : null}
    </Marker>
  );
}

function StoreLeafletMapCanvas({
  markers,
  className = "",
  singleMarkerId,
  interactive = true,
  mapKey,
}: StoreLeafletMapProps & { mapKey: string }) {
  const visibleMarkers = useMemo(() => {
    if (singleMarkerId) {
      return markers.filter((marker) => marker.storeId === singleMarkerId);
    }
    return markers;
  }, [markers, singleMarkerId]);

  const defaultCenter = visibleMarkers[0]
    ? ([visibleMarkers[0].lat, visibleMarkers[0].lng] as [number, number])
    : ([20, 0] as [number, number]);
  const defaultZoom = visibleMarkers.length === 1 ? 15 : visibleMarkers.length > 1 ? 12 : 2;

  return (
    <div key={mapKey} className="h-full min-h-[280px] w-full">
      <MapContainer
        key={mapKey}
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className={`z-0 h-full min-h-[280px] w-full rounded-2xl ${className}`}
        aria-label="Store locations map"
      >
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={visibleMarkers} />
        {visibleMarkers.map((marker) => (
          <StoreMapMarker
            key={marker.storeId}
            marker={marker}
            interactive={interactive}
          />
        ))}
      </MapContainer>
    </div>
  );
}

function MapLoadingShell() {
  return (
    <div
      className="flex h-full min-h-[280px] w-full items-center justify-center bg-surface text-sm text-muted"
      role="status"
    >
      Loading map…
    </div>
  );
}

export function StoreLeafletMap(props: StoreLeafletMapProps) {
  const [mapKey, setMapKey] = useState("");

  useEffect(() => {
    let active = true;
    const mountTimer = window.setTimeout(() => {
      if (active) {
        setMapKey(`map-${Math.random().toString(36).slice(2)}`);
      }
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(mountTimer);
    };
  }, []);

  if (!mapKey) {
    return <MapLoadingShell />;
  }

  return <StoreLeafletMapCanvas {...props} mapKey={mapKey} />;
}
