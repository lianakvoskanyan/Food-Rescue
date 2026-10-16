import type { NavLink, SiteSettings } from "@/lib/sanity/types";
import { normalizeSitePathHref } from "@/lib/nav/normalize-nav-href";

function sanitizeLinks(links: NavLink[] | undefined): NavLink[] | undefined {
  if (!links) {
    return links;
  }
  return links.map((link) => ({
    ...link,
    href: normalizeSitePathHref(link.href),
  }));
}

function sanitizeOptionalHref(href: string | undefined): string | undefined {
  if (!href?.trim()) {
    return href;
  }
  return normalizeSitePathHref(href);
}

export function sanitizeSiteSettingsNav(
  settings: SiteSettings | null,
): SiteSettings | null {
  if (!settings) {
    return null;
  }

  return {
    ...settings,
    headerLinks: sanitizeLinks(settings.headerLinks),
    footerLinks: sanitizeLinks(settings.footerLinks),
    heroCtaHref: sanitizeOptionalHref(settings.heroCtaHref),
    loginHref: sanitizeOptionalHref(settings.loginHref),
  };
}
