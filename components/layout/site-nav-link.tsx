"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { toNextLinkHref } from "@/lib/nav/normalize-nav-href";

type SiteNavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

function linkTargetPath(href: ComponentProps<typeof Link>["href"]): string {
  if (typeof href === "string") {
    const path = href.split("?")[0]?.split("#")[0];
    return path || "/";
  }
  if (href && typeof href === "object" && "pathname" in href) {
    return href.pathname || "/";
  }
  return "/";
}

/** In-app nav with safe hashes and reliable return to `/`. */
export function SiteNavLink({ href, onClick, ...props }: SiteNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const linkHref = toNextLinkHref(href);
  const targetPath = linkTargetPath(linkHref);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const goingHome = targetPath === "/";
    if (!goingHome) {
      return;
    }

    const onHomeRoute = pathname === "/";
    const hasHash = window.location.hash.length > 0;

    if (!onHomeRoute || hasHash) {
      event.preventDefault();
      router.push("/");
      if (hasHash) {
        window.history.replaceState(null, "", "/");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  return <Link href={linkHref} onClick={handleClick} {...props} />;
}
