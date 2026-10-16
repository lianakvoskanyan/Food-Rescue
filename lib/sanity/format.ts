import type { FoodOffer, Store } from "./types";

export function formatPrice(value: number, currency = "AMD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPickupWindow(pickupWindow: FoodOffer["pickupWindow"]) {
  const start = new Date(pickupWindow.start);
  const end = new Date(pickupWindow.end);

  const date = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(start);

  const time = `${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(start)}–${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(end)}`;

  return `${date}, ${time}`;
}

export function formatStoreAddress(address: Store["address"]) {
  if (!address) {
    return null;
  }

  return [address.street, address.city, address.postalCode]
    .filter(Boolean)
    .join(", ");
}

export function getDiscountPercent(price: number, originalPrice: number) {
  if (originalPrice <= 0 || price >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
