import type { FoodOfferPublicationStatus } from "@/lib/sanity/types";

const PUBLICATION_STATUSES: FoodOfferPublicationStatus[] = [
  "draft",
  "published",
  "soldOut",
  "expired",
];

export function parseRequiredString(
  value: unknown,
  fieldLabel: string,
): string | null {
  const text = String(value ?? "").trim();
  if (!text) {
    return `${fieldLabel} is required`;
  }
  return null;
}

export function parseOptionalString(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

/** Sanity `url` — valid http(s) only, or empty. */
export function parseOptionalWebsiteUrl(value: unknown): string | undefined {
  const text = parseOptionalString(value);
  if (!text) {
    return undefined;
  }

  const normalized = /^https?:\/\//i.test(text) ? text : `https://${text}`;

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return url.toString();
  } catch {
    throw new Error("INVALID_WEBSITE_URL");
  }
}

export function parsePrice(value: unknown): number | null {
  const num = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(num) || num < 0) {
    return null;
  }
  return Math.round(num);
}

export function parseQuantity(value: unknown): number | null {
  const num = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(num) || num < 0) {
    return null;
  }
  return num;
}

export function parseCategoryId(value: unknown): string | null {
  const id = String(value ?? "").trim();
  return id || null;
}

export function parsePublicationStatus(
  value: unknown,
): FoodOfferPublicationStatus | null {
  const status = String(value ?? "").trim() as FoodOfferPublicationStatus;
  return PUBLICATION_STATUSES.includes(status) ? status : null;
}

export function parseDatetimeLocal(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

/** Empty field clears explicit deadline (pickup end is used as fallback). */
export function parseOptionalReservationDeadline(
  value: unknown,
): string | null | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }
  return parseDatetimeLocal(raw);
}

export type ParsedStoreGeopoint =
  | { kind: "unset" }
  | { kind: "set"; lat: number; lng: number };

/** Both fields empty → unset; both filled → validated geopoint; one filled → error via throw in service. */
export function parseOptionalStoreGeopoint(
  latitude: unknown,
  longitude: unknown,
): ParsedStoreGeopoint {
  const latRaw = String(latitude ?? "").trim();
  const lngRaw = String(longitude ?? "").trim();

  if (!latRaw && !lngRaw) {
    return { kind: "unset" };
  }

  if (!latRaw || !lngRaw) {
    throw new Error(
      "Enter both latitude and longitude, or leave both empty to clear map coordinates.",
    );
  }

  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Latitude and longitude must be valid numbers.");
  }
  if (lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90.");
  }
  if (lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180.");
  }

  return { kind: "set", lat, lng };
}
