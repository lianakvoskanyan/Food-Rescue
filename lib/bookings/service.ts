import "server-only";

import {
  notifyAdminBookingProcessingError,
  notifyBookingCreated,
  notifyBookingStatusChange,
} from "@/lib/notifications/triggers";
import {
  bookingForSellerManageQuery,
  bookingIdByNumberQuery,
  bookingOwnedByProfileQuery,
  foodOfferForBookingQuery,
} from "@/lib/sanity/queries";
import type { UserRole } from "@/lib/auth/types";
import { sanityServerClient } from "@/lib/sanity/serverClient";
import type { FoodOfferForBooking } from "@/lib/sanity/types";
import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/lib/sanity/writeClient";
import {
  canBuyerCancelBooking,
  isOfferBookable,
  parseBookingQuantity,
  resolveSellerBookingStatus,
  type SellerBookingAction,
} from "@/lib/bookings/validation";

export class BookingServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingServiceError";
  }
}

type OwnedBookingRow = {
  _id: string;
  _rev?: string;
  bookingNumber: string;
  quantity: number;
  status: string;
  createdAt: string;
  offerRef?: string;
  offerTitle?: string;
  sellerProfileId?: string | null;
  buyerProfileId?: string;
};

function requireDocumentRevision(rev: string | undefined, label: string): string {
  if (!rev?.trim()) {
    throw new BookingServiceError(
      `Could not verify ${label} is up to date. Refresh the page and try again.`,
    );
  }
  return rev;
}

function isOptimisticLockError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("revision") ||
    message.includes("conflict") ||
    message.includes("document was updated")
  );
}

function createBookingNumber(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FR-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

async function loadOfferForBooking(
  offerId: string,
): Promise<FoodOfferForBooking | null> {
  return sanityServerClient.fetch<FoodOfferForBooking | null>(
    foodOfferForBookingQuery,
    { offerId },
  );
}

async function commitCreateBooking(
  offerId: string,
  offerRev: string,
  profileId: string,
  quantity: number,
): Promise<string> {
  const bookingNumber = createBookingNumber();
  const createdAt = new Date().toISOString();

  await sanityWriteClient
    .transaction()
    .create({
      _type: "booking",
      bookingNumber,
      offer: { _type: "reference", _ref: offerId },
      buyer: { _type: "reference", _ref: profileId },
      quantity,
      status: "pending",
      createdAt,
    })
    .patch(offerId, (patch) =>
      patch.ifRevisionId(offerRev).dec({ quantityAvailable: quantity }),
    )
    .commit({ visibility: "sync" });

  return bookingNumber;
}

async function findBookingIdByNumber(bookingNumber: string): Promise<string | null> {
  return sanityServerClient.fetch<string | null>(bookingIdByNumberQuery, {
    bookingNumber,
  });
}

/**
 * Sanity does not provide atomic read-modify-write across two HTTP requests.
 * We re-read stock and use a transaction (create + dec) with one retry.
 * In a rare race, stock could go below zero — fix in Studio; full protection needs a DB with locks.
 */
export async function createBookingForProfile(input: {
  offerId: string;
  profileId: string;
  buyerRole: UserRole;
  quantityRaw: unknown;
}): Promise<{ bookingNumber: string }> {
  if (input.buyerRole !== "customer") {
    throw new BookingServiceError(
      "Only customers (customer role) can book bundles.",
    );
  }

  if (!isSanityWriteConfigured()) {
    throw new BookingServiceError(
      "Booking is unavailable: SANITY_API_WRITE_TOKEN is not configured.",
    );
  }

  const quantity = parseBookingQuantity(input.quantityRaw);
  if (!quantity) {
    throw new BookingServiceError("Enter a valid number of bundles");
  }

  const offerId = input.offerId.trim();
  if (!offerId) {
    throw new BookingServiceError("Offer not found");
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const offer = await loadOfferForBooking(offerId);
    if (!offer) {
      throw new BookingServiceError("Offer not found");
    }

    const availabilityError = isOfferBookable(offer, quantity);
    if (availabilityError) {
      throw new BookingServiceError(availabilityError);
    }

    const offerRev = requireDocumentRevision(offer._rev, "the offer");

    try {
      const bookingNumber = await commitCreateBooking(
        offerId,
        offerRev,
        input.profileId,
        quantity,
      );

      try {
        const bookingId = await findBookingIdByNumber(bookingNumber);
        if (bookingId) {
          await notifyBookingCreated({
            buyerProfileId: input.profileId,
            sellerProfileId: offer.sellerProfileId,
            bookingId,
            bookingNumber,
            offerTitle: offer.title ?? "Bundle",
            offerSlug: offer.slug?.current,
          });
        }
      } catch (notifyError) {
        console.error("[createBookingForProfile] notification", notifyError);
      }

      return { bookingNumber };
    } catch (error) {
      if (isOptimisticLockError(error)) {
        if (attempt === 1) {
          throw new BookingServiceError(
            "Could not complete the booking. Bundles may have just sold out — try again.",
          );
        }
        continue;
      }
      if (attempt === 1) {
        try {
          await notifyAdminBookingProcessingError({
            offerId,
            detail: `Repeated failure while creating a booking for offer ${offerId}. Check stock and Sanity write logs.`,
          });
        } catch {
          /* ignore notification errors */
        }
        throw new BookingServiceError(
          "Could not complete the booking. Bundles may have just sold out — try again.",
        );
      }
    }
  }

  throw new BookingServiceError("Could not create booking");
}

export async function cancelBookingForProfile(input: {
  bookingId: string;
  profileId: string;
}): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new BookingServiceError(
      "Cancellation is unavailable: SANITY_API_WRITE_TOKEN is not configured.",
    );
  }

  const booking = await sanityServerClient.fetch<OwnedBookingRow | null>(
    bookingOwnedByProfileQuery,
    {
      bookingId: input.bookingId,
      profileId: input.profileId,
    },
  );

  if (!booking) {
    throw new BookingServiceError("Booking not found");
  }

  if (!canBuyerCancelBooking(booking.status)) {
    throw new BookingServiceError("This booking cannot be cancelled");
  }

  const offerRef = booking.offerRef;
  if (!offerRef) {
    throw new BookingServiceError("Related offer not found");
  }

  const bookingRev = requireDocumentRevision(booking._rev, "the booking");

  try {
    await sanityWriteClient
      .transaction()
      .patch(booking._id, (patch) =>
        patch.ifRevisionId(bookingRev).set({ status: "cancelled" }),
      )
      .patch(offerRef, (patch) =>
        patch.inc({ quantityAvailable: booking.quantity }),
      )
      .commit({ visibility: "sync" });

    try {
      await notifyBookingStatusChange({
        buyerProfileId: booking.buyerProfileId ?? input.profileId,
        sellerProfileId: booking.sellerProfileId,
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        offerTitle: booking.offerTitle ?? "Bundle",
        nextStatus: "cancelled",
        cancelledBy: "buyer",
      });
    } catch (notifyError) {
      console.error("[cancelBookingForProfile] notification", notifyError);
    }
  } catch (error) {
    if (isOptimisticLockError(error)) {
      throw new BookingServiceError(
        "This booking was already updated. Refresh the page and check the status.",
      );
    }
    throw error;
  }
}

type SellerManageBookingRow = {
  _id: string;
  _rev?: string;
  bookingNumber: string;
  quantity: number;
  status: string;
  buyerProfileId?: string;
  offerRef?: string;
  offerTitle?: string;
  sellerProfileId?: string | null;
};

export async function updateBookingBySeller(input: {
  bookingId: string;
  profileId: string;
  role: UserRole;
  action: SellerBookingAction;
}): Promise<void> {
  if (input.role !== "seller" && input.role !== "admin") {
    throw new BookingServiceError("Insufficient permissions to manage this order");
  }

  if (!isSanityWriteConfigured()) {
    throw new BookingServiceError(
      "Action unavailable: SANITY_API_WRITE_TOKEN is not configured.",
    );
  }

  const booking = await sanityServerClient.fetch<SellerManageBookingRow | null>(
    bookingForSellerManageQuery,
    { bookingId: input.bookingId },
  );

  if (!booking) {
    throw new BookingServiceError("Booking not found");
  }

  if (
    input.role === "seller" &&
    booking.sellerProfileId !== input.profileId
  ) {
    throw new BookingServiceError("This booking does not belong to your store");
  }

  const nextStatus = resolveSellerBookingStatus(booking.status, input.action);
  if (!nextStatus) {
    throw new BookingServiceError("This action is not allowed for the current status");
  }

  const offerRef = booking.offerRef;
  if (!offerRef) {
    throw new BookingServiceError("Related offer not found");
  }

  const bookingRev = requireDocumentRevision(booking._rev, "the booking");

  try {
    if (nextStatus === "cancelled") {
      await sanityWriteClient
        .transaction()
        .patch(booking._id, (patch) =>
          patch.ifRevisionId(bookingRev).set({ status: "cancelled" }),
        )
        .patch(offerRef, (patch) =>
          patch.inc({ quantityAvailable: booking.quantity }),
        )
        .commit({ visibility: "sync" });

      if (booking.buyerProfileId) {
        try {
          await notifyBookingStatusChange({
            buyerProfileId: booking.buyerProfileId,
            sellerProfileId: booking.sellerProfileId,
            bookingId: booking._id,
            bookingNumber: booking.bookingNumber,
            offerTitle: booking.offerTitle ?? "Bundle",
            nextStatus: "cancelled",
            cancelledBy: input.role === "seller" ? "seller" : "system",
          });
        } catch (notifyError) {
          console.error("[updateBookingBySeller] notification", notifyError);
        }
      }
      return;
    }

    await sanityWriteClient
      .patch(booking._id)
      .ifRevisionId(bookingRev)
      .set({ status: nextStatus })
      .commit({ visibility: "sync" });

    if (
      booking.buyerProfileId &&
      (nextStatus === "confirmed" || nextStatus === "completed")
    ) {
      try {
        await notifyBookingStatusChange({
          buyerProfileId: booking.buyerProfileId,
          sellerProfileId: booking.sellerProfileId,
          bookingId: booking._id,
          bookingNumber: booking.bookingNumber,
          offerTitle: booking.offerTitle ?? "Bundle",
          nextStatus,
          cancelledBy: "system",
        });
      } catch (notifyError) {
        console.error("[updateBookingBySeller] notification", notifyError);
      }
    }
  } catch (error) {
    if (isOptimisticLockError(error)) {
      throw new BookingServiceError(
        "The order was changed by another action. Refresh the page.",
      );
    }
    throw error;
  }
}
