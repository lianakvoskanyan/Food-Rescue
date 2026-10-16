export type NotificationEventType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "offer_changed_for_booking"
  | "pickup_reminder"
  | "booking_new_seller"
  | "booking_cancelled_by_buyer"
  | "offer_deadline_soon"
  | "offer_deadline_passed"
  | "offer_publication_update"
  | "moderation_offer_draft"
  | "moderation_store_new"
  | "system_booking_error";

export type CreateNotificationInput = {
  recipientProfileId: string;
  eventType: NotificationEventType;
  title: string;
  body?: string | null;
  href?: string | null;
  dedupeKey: string;
};
