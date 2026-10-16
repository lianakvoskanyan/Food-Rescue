/** Turn CMS / legacy URLs into safe in-app paths (no localhost absolute links). */

const INTERNAL_PATH = /^\/(?!\/)/;

export function normalizeSitePathHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return "/";
  }

  if (INTERNAL_PATH.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const path = url.pathname || "/";
      return `${path}${url.search}${url.hash}`;
    } catch {
      return "/";
    }
  }

  if (trimmed.startsWith("#")) {
    return `/${trimmed}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
