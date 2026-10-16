import { Suspense } from "react";
import type { Metadata } from "next";
import { NotificationsPageList } from "@/components/notifications/notifications-page-list";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { loadNotificationsPage } from "@/lib/notifications/inbox";
import { requireAuth } from "@/lib/auth/session";
import { SanityFetchError } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Notifications",
};

type NotificationsViewModel = {
  unreadCount: number;
  items: Awaited<ReturnType<typeof loadNotificationsPage>>["items"];
};

async function loadNotificationsViewModel(): Promise<
  NotificationsViewModel | "error"
> {
  const auth = await requireAuth("/notifications");
  try {
    return await loadNotificationsPage(auth);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return "error";
    }
    throw error;
  }
}

async function NotificationsContent() {
  const data = await loadNotificationsViewModel();

  if (data === "error") {
    return <ErrorState />;
  }

  return (
    <>
      <p className="text-sm text-muted">
        {data.unreadCount > 0
          ? `${data.unreadCount} unread notification${data.unreadCount === 1 ? "" : "s"}`
          : "All caught up"}
      </p>
      <NotificationsPageList items={data.items} />
    </>
  );
}

export default function NotificationsPage() {
  return (
    <main className="flex-1">
      <Container className="py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-brand-dark">
          Notifications
        </h1>
        <div className="mt-6">
          <Suspense
            fallback={<div className="h-48 animate-pulse rounded-2xl bg-brand/10" />}
          >
            <NotificationsContent />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
