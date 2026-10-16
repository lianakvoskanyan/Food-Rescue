"use client";

import { useEffect, useId, useState } from "react";
import { AuthNavMobile } from "@/components/layout/auth-nav";
import type { NotificationBellData } from "@/lib/notifications/inbox";
import type { AuthState } from "@/lib/auth/types";
import type { NavLink } from "@/lib/sanity/types";

type MobileNavProps = {
  links: NavLink[];
  auth: AuthState | null;
  notifications?: NotificationBellData | null;
};

export function MobileNav({ links, auth, notifications }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/15 bg-surface text-brand-dark"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
        </span>
      </button>

      {open ? (
        <nav
          id={panelId}
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full z-40 border-b border-brand/10 bg-surface px-4 py-4 shadow-lg"
        >
          <AuthNavMobile
            links={links}
            auth={auth}
            notifications={notifications}
            mobile
            onNavigate={() => setOpen(false)}
          />
        </nav>
      ) : null}
    </div>
  );
}
