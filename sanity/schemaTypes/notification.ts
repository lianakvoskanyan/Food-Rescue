import { defineField, defineType } from "sanity";

export const notificationEventTypeOptions = [
  { title: "Booking created (customer)", value: "booking_created" },
  { title: "Booking confirmed", value: "booking_confirmed" },
  { title: "Booking cancelled", value: "booking_cancelled" },
  { title: "Booking completed", value: "booking_completed" },
  { title: "Offer changed for booking", value: "offer_changed_for_booking" },
  { title: "Pickup reminder", value: "pickup_reminder" },
  { title: "New booking (seller)", value: "booking_new_seller" },
  { title: "Booking cancelled by buyer", value: "booking_cancelled_by_buyer" },
  { title: "Offer deadline soon", value: "offer_deadline_soon" },
  { title: "Offer deadline passed", value: "offer_deadline_passed" },
  { title: "Offer publication update", value: "offer_publication_update" },
  { title: "Moderation: offer draft", value: "moderation_offer_draft" },
  { title: "Moderation: new store", value: "moderation_store_new" },
  { title: "System: booking error", value: "system_booking_error" },
] as const;

export const notification = defineType({
  name: "notification",
  title: "Notification",
  type: "document",
  fields: [
    defineField({
      name: "recipient",
      title: "Recipient",
      type: "reference",
      to: [{ type: "userProfile" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eventType",
      title: "Event type",
      type: "string",
      options: { list: [...notificationEventTypeOptions] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "href",
      title: "Link path",
      type: "string",
      description: "Internal path, e.g. /account/bookings",
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readAt",
      title: "Read at",
      type: "datetime",
    }),
    defineField({
      name: "dedupeKey",
      title: "Dedupe key",
      type: "string",
      description: "Prevents duplicate notifications for the same event.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "eventType",
      recipientEmail: "recipient.email",
    },
  },
});
