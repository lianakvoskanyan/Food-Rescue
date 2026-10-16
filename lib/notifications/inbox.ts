import "server-only";

import { syncOnVisitReminders } from "@/lib/notifications/reminders";
import {
  getNotificationInbox,
  getUnreadNotificationCount,
} from "@/lib/notifications/service";
import type { AuthState } from "@/lib/auth/types";
import type { NotificationRecord } from "@/lib/sanity/types";

export type NotificationBellData = {
  unreadCount: number;
  recent: NotificationRecord[];
};

export async function loadNotificationBellData(
  auth: AuthState,
): Promise<NotificationBellData> {
  await syncOnVisitReminders({
    profileId: auth.profile.id,
    role: auth.profile.role,
  });

  const [unreadCount, recent] = await Promise.all([
    getUnreadNotificationCount(auth.profile.id),
    getNotificationInbox(auth.profile.id, 8),
  ]);

  return { unreadCount, recent };
}

export async function loadNotificationsPage(
  auth: AuthState,
): Promise<{ unreadCount: number; items: NotificationRecord[] }> {
  await syncOnVisitReminders({
    profileId: auth.profile.id,
    role: auth.profile.role,
  });

  const [unreadCount, items] = await Promise.all([
    getUnreadNotificationCount(auth.profile.id),
    getNotificationInbox(auth.profile.id, 50),
  ]);

  return { unreadCount, items };
}
