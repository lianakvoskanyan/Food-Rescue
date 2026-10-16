import type { Store } from "@/lib/sanity/types";

export type SanityGeopoint = {
  lat: number;
  lng: number;
  alt?: number;
};

export function isValidGeopoint(
  value: SanityGeopoint | null | undefined,
): value is SanityGeopoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { lat, lng } = value;
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function getStoreGeopoint(
  store: Pick<Store, "location"> | null | undefined,
): SanityGeopoint | null {
  if (!store?.location) {
    return null;
  }
  return isValidGeopoint(store.location) ? store.location : null;
}

/** OpenStreetMap directions (no API key). */
export function buildOsmDirectionsUrl(lat: number, lng: number): string {
  const destination = encodeURIComponent(`${lat},${lng}`);
  return `https://www.openstreetmap.org/directions?to=${destination}`;
}

export function buildOsmMapUrl(lat: number, lng: number, zoom = 16): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}
