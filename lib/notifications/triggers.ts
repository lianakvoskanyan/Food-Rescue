import "server-only";

import { createNotificationIfNew } from "@/lib/notifications/service";
import { adminProfileIdsQuery } from "@/lib/sanity/queries";
import { sanityManageClient } from "@/lib/sanity/manageClient";

async function notifyAllAdmins(input: {
  eventType: "moderation_offer_draft" | "moderation_store_new" | "system_booking_error";
  title: string;
  body: string;
  href: string;
  dedupeKey: string;
}): Promise<void> {
  const adminIds = await sanityManageClient.fetch<string[]>(adminProfileIdsQuery);
  await Promise.all(
    adminIds.map((adminId) =>
      createNotificationIfNew({
        recipientProfileId: adminId,
        eventType: input.eventType,
        title: input.title,
        body: input.body,
        href: input.href,
        dedupeKey: `${input.dedupeKey}:admin:${adminId}`,
      }),
    ),
  );
}

export async function notifyBookingCreated(input: {
  buyerProfileId: string;
  sellerProfileId: string | null | undefined;
  bookingId: string;
  bookingNumber: string;
  offerTitle: string;
  offerSlug?: string | null;
}): Promise<void> {
  await createNotificationIfNew({
    recipientProfileId: input.buyerProfileId,
    eventType: "booking_created",
    title: "Booking received",
    body: `Your booking ${input.bookingNumber} for "${input.offerTitle}" is pending confirmation.`,
    href: "/account/bookings",
    dedupeKey: `booking-created:${input.bookingId}`,
  });

  if (input.sellerProfileId) {
    await createNotificationIfNew({
      recipientProfileId: input.sellerProfileId,
      eventType: "booking_new_seller",
      title: "New booking",
      body: `New order ${input.bookingNumber} on "${input.offerTitle}".`,
      href: "/seller/bookings",
      dedupeKey: `booking-new-seller:${input.bookingId}`,
    });
  }
}

export async function notifyBookingStatusChange(input: {
  buyerProfileId: string;
  sellerProfileId?: string | null;
  bookingId: string;
  bookingNumber: string;
  offerTitle: string;
  nextStatus: "confirmed" | "cancelled" | "completed";
  cancelledBy: "buyer" | "seller" | "system";
}): Promise<void> {
  if (input.nextStatus === "confirmed") {
    await createNotificationIfNew({
      recipientProfileId: input.buyerProfileId,
      eventType: "booking_confirmed",
      title: "Booking confirmed",
      body: `${input.bookingNumber} for "${input.offerTitle}" was confirmed by the store.`,
      href: "/account/bookings",
      dedupeKey: `booking-confirmed:${input.bookingId}`,
    });
    return;
  }

  if (input.nextStatus === "completed") {
    await createNotificationIfNew({
      recipientProfileId: input.buyerProfileId,
      eventType: "booking_completed",
      title: "Booking completed",
      body: `${input.bookingNumber} for "${input.offerTitle}" is marked completed. Thank you!`,
      href: "/account/bookings",
      dedupeKey: `booking-completed:${input.bookingId}`,
    });
    return;
  }

  if (input.nextStatus === "cancelled") {
    await createNotificationIfNew({
      recipientProfileId: input.buyerProfileId,
      eventType: "booking_cancelled",
      title: "Booking cancelled",
      body:
        input.cancelledBy === "buyer"
          ? `You cancelled ${input.bookingNumber} for "${input.offerTitle}".`
          : `${input.bookingNumber} for "${input.offerTitle}" was cancelled by the store.`,
      href: "/account/bookings",
      dedupeKey: `booking-cancelled-buyer:${input.bookingId}`,
    });

    if (input.cancelledBy === "buyer" && input.sellerProfileId) {
      await createNotificationIfNew({
        recipientProfileId: input.sellerProfileId,
        eventType: "booking_cancelled_by_buyer",
        title: "Booking cancelled by customer",
        body: `Order ${input.bookingNumber} on "${input.offerTitle}" was cancelled.`,
        href: "/seller/bookings",
        dedupeKey: `booking-cancelled-seller:${input.bookingId}`,
      });
    }
  }
}

export async function notifyOfferChangedForBookingsStable(input: {
  offerId: string;
  offerTitle: string;
  buyerProfileIds: string[];
  changeBucket: string;
}): Promise<void> {
  const uniqueBuyers = [...new Set(input.buyerProfileIds.filter(Boolean))];
  await Promise.all(
    uniqueBuyers.map((buyerId) =>
      createNotificationIfNew({
        recipientProfileId: buyerId,
        eventType: "offer_changed_for_booking",
        title: "Offer details updated",
        body: `"${input.offerTitle}" was updated. Check pickup times on your booking.`,
        href: "/account/bookings",
        dedupeKey: `offer-changed:${input.offerId}:buyer:${buyerId}:${input.changeBucket}`,
      }),
    ),
  );
}

export async function notifySellerPublicationUpdate(input: {
  sellerProfileId: string;
  offerId: string;
  offerTitle: string;
  message: string;
  dedupeSuffix: string;
}): Promise<void> {
  await createNotificationIfNew({
    recipientProfileId: input.sellerProfileId,
    eventType: "offer_publication_update",
    title: "Offer publication update",
    body: input.message.replace("{title}", `"${input.offerTitle}"`),
    href: `/seller/offers/${input.offerId}`,
    dedupeKey: `offer-publication:${input.offerId}:${input.dedupeSuffix}`,
  });
}

export async function notifyModerationOfferDraft(input: {
  offerId: string;
  offerTitle: string;
}): Promise<void> {
  await notifyAllAdmins({
    eventType: "moderation_offer_draft",
    title: "Offer awaiting review",
    body: `Draft offer "${input.offerTitle}" needs publication review.`,
    href: "/admin/offers",
    dedupeKey: `moderation-offer:${input.offerId}`,
  });
}

export async function notifyModerationNewStore(input: {
  storeId: string;
  storeTitle: string;
}): Promise<void> {
  await notifyAllAdmins({
    eventType: "moderation_store_new",
    title: "New store submitted",
    body: `Store "${input.storeTitle}" is not published yet — review when ready.`,
    href: "/admin/stores",
    dedupeKey: `moderation-store:${input.storeId}`,
  });
}

export async function notifyAdminBookingProcessingError(input: {
  offerId: string;
  detail: string;
}): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  await notifyAllAdmins({
    eventType: "system_booking_error",
    title: "Booking processing issue",
    body: input.detail,
    href: "/admin/bookings",
    dedupeKey: `system-booking-error:${input.offerId}:${day}`,
  });
}
