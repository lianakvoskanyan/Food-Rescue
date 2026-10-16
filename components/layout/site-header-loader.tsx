import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentAuthState } from "@/lib/auth/session";
import { loadNotificationBellData } from "@/lib/notifications/inbox";
import { filterStudioNavLinks } from "@/lib/nav/filter-studio-links";
import { getSiteSettings } from "@/lib/sanity/fetch";
import type { SiteSettings } from "@/lib/sanity/types";

export async function SiteHeaderLoader() {
  let settings: SiteSettings | null = null;

  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  const auth = await getCurrentAuthState();
  let notifications = null;
  if (auth) {
    try {
      notifications = await loadNotificationBellData(auth);
    } catch {
      notifications = { unreadCount: 0, recent: [] };
    }
  }
  const isAdmin = auth?.profile.role === "admin";

  const visibleSettings =
    settings && !isAdmin
      ? {
          ...settings,
          headerLinks: filterStudioNavLinks(settings.headerLinks ?? [], false),
        }
      : settings;

  return (
    <SiteHeader
      settings={visibleSettings}
      auth={auth}
      notifications={notifications}
    />
  );
}
