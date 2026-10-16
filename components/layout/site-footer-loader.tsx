import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentAuthState } from "@/lib/auth/session";
import { filterStudioNavLinks } from "@/lib/nav/filter-studio-links";
import { getSiteSettings } from "@/lib/sanity/fetch";
import type { SiteSettings } from "@/lib/sanity/types";

export async function SiteFooterLoader() {
  let settings: SiteSettings | null = null;

  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  const auth = await getCurrentAuthState();
  const isAdmin = auth?.profile.role === "admin";

  const visibleSettings =
    settings && !isAdmin
      ? {
          ...settings,
          footerLinks: filterStudioNavLinks(settings.footerLinks ?? [], false),
        }
      : settings;

  return <SiteFooter settings={visibleSettings} />;
}
