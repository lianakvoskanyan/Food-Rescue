import "server-only";

import { getReservationDeadlineMs } from "@/lib/offers/lifecycle";
import { createNotificationIfNew } from "@/lib/notifications/service";
import type { UserRole } from "@/lib/auth/types";
import {
  customerPickupReminderCandidatesQuery,
  sellerDeadlineReminderCandidatesQuery,
} from "@/lib/sanity/queries";
import { sanityManageClient } from "@/lib/sanity/manageClient";

const SOON_MS = 24 * 60 * 60 * 1000;
const PICKUP_SOON_MS = 24 * 60 * 60 * 1000;

/**
 * On-demand reminders when the user opens the site (no background cron in this project).
 * Dedupe keys prevent repeat notifications for the same deadline/booking.
 */
export async function syncOnVisitReminders(input: {
  profileId: string;
  role: UserRole;
}): Promise<void> {
  const now = Date.now();

  if (input.role === "seller") {
    await syncSellerDeadlineReminders(input.profileId, now);
  }

  if (input.role === "customer") {
    await syncCustomerPickupReminders(input.profileId, now);
  }
}

async function syncSellerDeadlineReminders(
  profileId: string,
  nowMs: number,
): Promise<void> {
  const offers = await sanityManageClient.fetch<
    Array<{
      _id: string;
      title: string;
      publicationStatus: string;
      reservationDeadline?: string | null;
      pickupWindow?: { start?: string; end?: string };
    }>
  >(sellerDeadlineReminderCandidatesQuery, { profileId });

  for (const offer of offers) {
    if (offer.publicationStatus !== "published") {
      continue;
    }

    const deadlineMs = getReservationDeadlineMs(offer, nowMs);
    if (deadlineMs === null) {
      continue;
    }

    const href = `/seller/offers/${offer._id}`;
    const title = offer.title || "Offer";

    if (deadlineMs <= nowMs) {
      await createNotificationIfNew({
        recipientProfileId: profileId,
        eventType: "offer_deadline_passed",
        title: "Reservation deadline passed",
        body: `"${title}" is no longer open for booking. Extend the deadline, republish, or mark it completed.`,
        href,
        dedupeKey: `offer-deadline-passed:${offer._id}`,
      });
      continue;
    }

    const msUntil = deadlineMs - nowMs;
    if (msUntil <= SOON_MS) {
      await createNotificationIfNew({
        recipientProfileId: profileId,
        eventType: "offer_deadline_soon",
        title: "Reservation deadline approaching",
        body: `"${title}" stops accepting bookings soon. Review pickup times and remaining bundles.`,
        href,
        dedupeKey: `offer-deadline-soon:${offer._id}:${new Date(deadlineMs).toISOString().slice(0, 13)}`,
      });
    }
  }
}

async function syncCustomerPickupReminders(
  profileId: string,
  nowMs: number,
): Promise<void> {
  const bookings = await sanityManageClient.fetch<
    Array<{
      _id: string;
      bookingNumber: string;
      offerTitle?: string;
      pickupEnd?: string;
    }>
  >(customerPickupReminderCandidatesQuery, { profileId });

  for (const booking of bookings) {
    if (!booking.pickupEnd) {
      continue;
    }
    const endMs = Date.parse(booking.pickupEnd);
    if (Number.isNaN(endMs) || endMs <= nowMs) {
      continue;
    }
    if (endMs - nowMs > PICKUP_SOON_MS) {
      continue;
    }

    const label = booking.offerTitle || "your bundle";
    await createNotificationIfNew({
      recipientProfileId: profileId,
      eventType: "pickup_reminder",
      title: "Pickup window ending soon",
      body: `Pick up ${label} before the window closes. Booking ${booking.bookingNumber}.`,
      href: "/account/bookings",
      dedupeKey: `pickup-reminder:${booking._id}`,
    });
  }
}
