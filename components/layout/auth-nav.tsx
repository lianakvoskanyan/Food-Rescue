"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ButtonLink } from "@/components/ui/button";
import type { NotificationBellData } from "@/lib/notifications/inbox";
import type { AuthState } from "@/lib/auth/types";
import { normalizeSitePathHref } from "@/lib/nav/normalize-nav-href";
import type { NavLink } from "@/lib/sanity/types";

type AuthNavProps = {
  links: NavLink[];
  auth: AuthState | null;
  notifications?: NotificationBellData | null;
  mobile?: boolean;
  onNavigate?: () => void;
};

function roleLinks(role: AuthState["profile"]["role"]) {
  if (role === "admin") {
    return [{ href: "/admin", label: "Admin" }];
  }
  if (role === "seller") {
    return [{ href: "/seller", label: "Orders" }];
  }
  return [{ href: "/account/bookings", label: "My bookings" }];
}

export function AuthNavDesktop({ links, auth, notifications }: AuthNavProps) {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-1">
          {links.map((link, index) => (
            <li key={`${link.href}-${link.label}-${index}`}>
              <Link
                href={normalizeSitePathHref(link.href)}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand/8 hover:text-brand-dark"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {auth ? (
        <div className="flex items-center gap-2">
          {notifications ? (
            <NotificationBell
              unreadCount={notifications.unreadCount}
              recent={notifications.recent}
            />
          ) : null}
          {roleLinks(auth.profile.role).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-brand/5 hover:text-brand-dark"
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink
            href={auth.profile.role === "customer" ? "/account" : "/profile"}
            variant="secondary"
          >
            {auth.profile.role === "customer" ? "Account" : "Profile"}
          </ButtonLink>
          <LogoutButton />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" variant="secondary">
            Register
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

export function AuthNavMobile({ links, auth, notifications, onNavigate }: AuthNavProps) {
  return (
    <ul className="space-y-3">
      {links.map((link, index) => (
        <li key={`${link.href}-${link.label}-${index}`}>
          <Link
            href={normalizeSitePathHref(link.href)}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand/5"
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        </li>
      ))}

      {auth ? (
        <>
          <li>
            <Link
              href="/notifications"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand/5"
              onClick={onNavigate}
            >
              Notifications
              {notifications && notifications.unreadCount > 0 ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-brand-dark">
                  {notifications.unreadCount > 99
                    ? "99+"
                    : notifications.unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
          {roleLinks(auth.profile.role).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand/5"
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={auth.profile.role === "customer" ? "/account" : "/profile"}
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
              onClick={onNavigate}
            >
              {auth.profile.role === "customer" ? "Account" : "Profile"}
            </Link>
          </li>
          <li className="px-3 py-2">
            <LogoutButton />
          </li>
        </>
      ) : (
        <>
          <li>
            <Link
              href="/login"
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
              onClick={onNavigate}
            >
              Sign in
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand/5"
              onClick={onNavigate}
            >
              Register
            </Link>
          </li>
        </>
      )}
    </ul>
  );
}
