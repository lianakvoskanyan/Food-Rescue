import Link from "next/link";
import { AuthNavDesktop } from "@/components/layout/auth-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { NotificationBellData } from "@/lib/notifications/inbox";
import type { AuthState } from "@/lib/auth/types";
import type { SiteSettings } from "@/lib/sanity/types";

type SiteHeaderProps = {
  settings: SiteSettings | null;
  auth: AuthState | null;
  notifications?: NotificationBellData | null;
};

export function SiteHeader({ settings, auth, notifications }: SiteHeaderProps) {
  const links = settings?.headerLinks ?? [];
  const title = settings?.siteTitle ?? "Food Rescue";
  const tagline = settings?.siteTagline ?? "Marketplace";

  return (
    <header className="sticky top-0 z-50 border-b border-brand/10 bg-surface/75 shadow-[0_8px_30px_-20px_rgba(27,67,50,0.35)] backdrop-blur-xl">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-md shadow-brand/30 transition-transform group-hover:scale-105"
          >
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25),transparent)]" />
            FR
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold tracking-tight text-brand-dark sm:text-xl">
              {title}
            </span>
            <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {tagline}
            </span>
          </span>
        </Link>

        <AuthNavDesktop links={links} auth={auth} notifications={notifications} />
        <MobileNav links={links} auth={auth} notifications={notifications} />
      </div>
    </header>
  );
}

export function SiteHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand/10 bg-surface/90">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-brand/10" />
        <div className="hidden h-10 w-56 animate-pulse rounded-full bg-brand/10 md:block" />
      </div>
    </header>
  );
}
