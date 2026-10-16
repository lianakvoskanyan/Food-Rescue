"use client";

import type { ReactNode } from "react";
import { SiteNavLink } from "@/components/layout/site-nav-link";

type SiteLogoLinkProps = {
  children: ReactNode;
  className?: string;
};

export function SiteLogoLink({ children, className }: SiteLogoLinkProps) {
  return (
    <SiteNavLink href="/" className={className}>
      {children}
    </SiteNavLink>
  );
}
