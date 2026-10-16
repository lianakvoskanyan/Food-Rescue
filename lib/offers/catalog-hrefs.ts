/** Shared catalog URL helpers (safe for client and server). */

export function offersCatalogStoreHref(
  storeSlug: string,
  options?: { view?: "map" | "list" },
): string {
  const search = new URLSearchParams();
  search.set("store", storeSlug);
  if (options?.view === "map") {
    search.set("view", "map");
  }
  return `/offers?${search.toString()}`;
}

export function offersCatalogMapHref(): string {
  return "/offers?view=map";
}
