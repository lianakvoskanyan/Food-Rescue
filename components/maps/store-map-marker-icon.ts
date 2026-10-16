import L from "leaflet";
import type { StoreMapMarkerData } from "@/lib/stores/map-markers";

const MARKER_SIZE = 44;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function storeInitial(title: string): string {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function createStorePhotoMarkerIcon(
  marker: StoreMapMarkerData,
): L.DivIcon {
  const label = escapeHtml(marker.title);
  const inner = marker.storeMarkerImageUrl
    ? `<img src="${escapeHtml(marker.storeMarkerImageUrl)}" alt="" width="${MARKER_SIZE}" height="${MARKER_SIZE}" loading="lazy" decoding="async" style="display:block;width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;object-fit:cover;border-radius:9999px;border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.28)" />`
    : `<span title="${label}" style="display:flex;width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;align-items:center;justify-content:center;border-radius:9999px;border:2.5px solid #fff;background:linear-gradient(145deg,#2d6a4f,#1a4332);color:#fff;font:600 16px/1 system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.28)">${escapeHtml(storeInitial(marker.title))}</span>`;

  return L.divIcon({
    className: "leaflet-store-photo-marker",
    html: inner,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
    popupAnchor: [0, -(MARKER_SIZE / 2 + 6)],
  });
}

export const STORE_PHOTO_MARKER_SIZE = MARKER_SIZE;
