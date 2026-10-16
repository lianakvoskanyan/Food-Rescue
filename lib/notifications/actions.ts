"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAuth } from "@/lib/auth/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
  NotificationServiceError,
} from "@/lib/notifications/service";

export type NotificationActionState = {
  error?: string;
  success?: string;
};

export async function markNotificationReadAction(
  _prev: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  try {
    const auth = await requireAuth("/notifications");
    const notificationId = String(formData.get("notificationId") ?? "").trim();
    const href = String(formData.get("href") ?? "").trim();

    if (!notificationId) {
      return { error: "Notification not specified" };
    }

    await markNotificationRead({
      notificationId,
      profileId: auth.profile.id,
    });

    revalidatePath("/notifications");
    revalidatePath("/", "layout");

    if (href.startsWith("/") && !href.startsWith("//")) {
      redirect(href);
    }

    return { success: "Marked as read" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof NotificationServiceError) {
      return { error: error.message };
    }
    return { error: "Could not update notification" };
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const auth = await requireAuth("/notifications");
  await markAllNotificationsRead(auth.profile.id);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
