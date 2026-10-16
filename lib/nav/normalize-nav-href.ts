import type { ComponentProps } from "react";
import type Link from "next/link";

/** Turn CMS / legacy URLs into safe in-app paths (no localhost absolute links). */
export function normalizeSitePathHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return "/";
  }

  let pathPart = trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      pathPart = `${url.pathname || "/"}${url.search}${url.hash}`;
    } catch {
      return "/";
    }
  } else if (trimmed.startsWith("#")) {
    pathPart = `/${trimmed}`;
  } else if (!trimmed.startsWith("/")) {
    pathPart = `/${trimmed}`;
  }

  const hashIndex = pathPart.indexOf("#");
  if (hashIndex === -1) {
    return pathPart || "/";
  }

  const pathname = pathPart.slice(0, hashIndex) || "/";
  const hashSection = pathPart.slice(hashIndex + 1);
  const uniqueFragments = [...new Set(hashSection.split("#").filter(Boolean))];

  if (uniqueFragments.length === 0) {
    return pathname;
  }

  return `${pathname}#${uniqueFragments.join("#")}`;
}

/** Next.js Link href — avoids `#categories#categories` when the page already has a hash. */
export function toNextLinkHref(
  href: string,
): ComponentProps<typeof Link>["href"] {
  const normalized = normalizeSitePathHref(href);
  const hashIndex = normalized.indexOf("#");

  if (hashIndex === -1) {
    return normalized;
  }

  const pathname = normalized.slice(0, hashIndex) || "/";
  const hashSection = normalized.slice(hashIndex + 1);
  const hash = hashSection.split("#").filter(Boolean)[0];

  if (!hash) {
    return pathname;
  }

  return { pathname, hash };
}
