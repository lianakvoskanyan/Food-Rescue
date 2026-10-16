import Link from "next/link";
import { normalizeSitePathHref } from "@/lib/nav/normalize-nav-href";
import { Container } from "@/components/ui/container";
import type { SiteSettings } from "@/lib/sanity/types";

type SiteFooterProps = {
  settings: SiteSettings | null;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const links = settings?.footerLinks ?? [];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-brand/15 bg-gradient-to-br from-brand-dark via-[#1a3d2e] to-[#0f2419] text-white">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-brand-light/15 blur-3xl"
        aria-hidden
      />
      <Container className="relative py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-4">
            <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {settings?.siteTitle ?? "Food Rescue Marketplace"}
            </p>
            {settings?.footerDescription ? (
              <p className="max-w-xl text-sm leading-relaxed text-white/78 sm:text-base">
                {settings.footerDescription}
              </p>
            ) : null}
          </div>

          {links.length > 0 ? (
            <nav aria-label="Footer links">
              <ul className="grid gap-2 sm:grid-cols-2">
                {links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={normalizeSitePathHref(link.href)}
                      className="text-sm text-white/82 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="mt-12 border-t border-white/12 pt-6 text-sm text-white/55">
          {settings?.footerCopyright ?? "© Food Rescue Marketplace"}
        </div>
      </Container>
    </footer>
  );
}

export function SiteFooterSkeleton() {
  return (
    <footer className="mt-auto border-t border-brand/10 bg-brand-dark">
      <div className="mx-auto h-40 max-w-6xl animate-pulse px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-md rounded bg-white/10" />
      </div>
    </footer>
  );
}
