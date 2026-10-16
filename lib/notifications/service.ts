import "server-only";

import {
  notificationDedupeExistsQuery,
  notificationInboxQuery,
  notificationsUnreadCountQuery,
} from "@/lib/sanity/queries";
import { sanityManageClient } from "@/lib/sanity/manageClient";
import type { NotificationRecord } from "@/lib/sanity/types";
import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/lib/sanity/writeClient";

export class NotificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

export async function createNotificationIfNew(
  input: import("@/lib/notifications/types").CreateNotificationInput,
): Promise<boolean> {
  if (!isSanityWriteConfigured()) {
    return false;
  }

  const recipientProfileId = input.recipientProfileId.trim();
  const dedupeKey = input.dedupeKey.trim();
  if (!recipientProfileId || !dedupeKey) {
    return false;
  }

  const exists = await sanityManageClient.fetch<boolean>(
    notificationDedupeExistsQuery,
    { dedupeKey, recipientProfileId },
  );
  if (exists) {
    return false;
  }

  await sanityWriteClient.create({
    _type: "notification",
    recipient: { _type: "reference", _ref: recipientProfileId },
    eventType: input.eventType,
    title: input.title,
    body: input.body ?? undefined,
    href: input.href ?? undefined,
    createdAt: new Date().toISOString(),
    dedupeKey,
  });

  return true;
}

export async function getUnreadNotificationCount(
  profileId: string,
): Promise<number> {
  const count = await sanityManageClient.fetch<number>(
    notificationsUnreadCountQuery,
    { profileId },
  );
  return Number.isFinite(count) ? count : 0;
}

export async function getNotificationInbox(
  profileId: string,
  limit = 20,
): Promise<NotificationRecord[]> {
  return sanityManageClient.fetch<NotificationRecord[]>(notificationInboxQuery, {
    profileId,
    limit,
  });
}

export async function markNotificationRead(input: {
  notificationId: string;
  profileId: string;
}): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new NotificationServiceError("Notifications are unavailable");
  }

  const row = await sanityManageClient.fetch<{
    _id: string;
    readAt?: string | null;
  } | null>(
    `*[
      _type == "notification"
      && _id == $notificationId
      && recipient._ref == $profileId
    ][0]{ _id, readAt }`,
    {
      notificationId: input.notificationId,
      profileId: input.profileId,
    },
  );

  if (!row) {
    throw new NotificationServiceError("Notification not found");
  }

  if (row.readAt) {
    return;
  }

  await sanityWriteClient
    .patch(row._id)
    .set({ readAt: new Date().toISOString() })
    .commit();
}

export async function markAllNotificationsRead(profileId: string): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new NotificationServiceError("Notifications are unavailable");
  }

  const unreadIds = await sanityManageClient.fetch<string[]>(
    `*[
      _type == "notification"
      && recipient._ref == $profileId
      && !defined(readAt)
    ]._id`,
    { profileId },
  );

  if (unreadIds.length === 0) {
    return;
  }

  const readAt = new Date().toISOString();
  const tx = sanityWriteClient.transaction();
  for (const id of unreadIds) {
    tx.patch(id, (patch) => patch.set({ readAt }));
  }
  await tx.commit();
}
