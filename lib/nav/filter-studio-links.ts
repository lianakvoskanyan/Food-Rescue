import { normalizeSitePathHref } from "@/lib/nav/normalize-nav-href";

/** Sanity Studio links in header/footer — admin only. */
export function isStudioNavHref(href: string): boolean {
  const normalized = href.trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return false;
  }
  const path = normalized.split("?")[0]?.split("#")[0] ?? "";
  return path === "/studio" || path.startsWith("/studio/");
}

export function filterStudioNavLinks<T extends { href: string }>(
  links: T[],
  showStudioLink: boolean,
): T[] {
  if (showStudioLink) {
    return links;
  }
  return links.filter((link) => !isStudioNavHref(link.href));
}

/** Logo already links home — hide redundant Home item in the header. */
export function withoutHomeHeaderLink<T extends { href: string }>(links: T[]): T[] {
  return links.filter((link) => normalizeSitePathHref(link.href) !== "/");
}
