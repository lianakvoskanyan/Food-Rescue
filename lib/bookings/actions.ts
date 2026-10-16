"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireRole } from "@/lib/auth/session";
import {
  BookingServiceError,
  cancelBookingForProfile,
  createBookingForProfile,
  updateBookingBySeller,
} from "@/lib/bookings/service";
import type { SellerBookingAction } from "@/lib/bookings/validation";

export type BookingFormState = {
  error?: string;
  success?: string;
  bookingNumber?: string;
};

export async function createBookingAction(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  try {
    const offerId = String(formData.get("offerId") ?? "");
    const returnPath = String(formData.get("returnPath") ?? "/offers");
    const safeReturnPath =
      returnPath.startsWith("/") && !returnPath.startsWith("//")
        ? returnPath
        : "/offers";

    const auth = await requireRole(["customer"], safeReturnPath);
    const quantity = formData.get("quantity");

    const result = await createBookingForProfile({
      offerId,
      profileId: auth.profile.id,
      buyerRole: auth.profile.role,
      quantityRaw: quantity,
    });

    revalidatePath("/offers");
    revalidatePath("/account/bookings");
    revalidatePath("/seller");
    revalidatePath("/notifications");

    return {
      success: "Bundle booked successfully",
      bookingNumber: result.bookingNumber,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof BookingServiceError) {
      return { error: error.message };
    }
    return { error: "Could not create booking" };
  }
}

export type CancelBookingFormState = {
  error?: string;
};

export async function cancelBookingAction(
  _prevState: CancelBookingFormState,
  formData: FormData,
): Promise<CancelBookingFormState> {
  try {
    const auth = await requireRole(["customer"], "/account/bookings");
    const bookingId = String(formData.get("bookingId") ?? "").trim();

    if (!bookingId) {
      return { error: "Booking not specified" };
    }

    await cancelBookingForProfile({
      bookingId,
      profileId: auth.profile.id,
    });

    revalidatePath("/account/bookings");
    revalidatePath("/offers");
    revalidatePath("/seller");
    revalidatePath("/notifications");
    redirect("/account/bookings?cancelled=1");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof BookingServiceError) {
      return { error: error.message };
    }
    return { error: "Could not cancel booking" };
  }
}

export type SellerBookingFormState = {
  error?: string;
};

function parseSellerAction(raw: unknown): SellerBookingAction | null {
  if (raw === "confirm" || raw === "complete" || raw === "cancel") {
    return raw;
  }
  return null;
}

export async function sellerBookingAction(
  _prevState: SellerBookingFormState,
  formData: FormData,
): Promise<SellerBookingFormState> {
  try {
    const auth = await requireRole(["seller", "admin"], "/seller");
    const bookingId = String(formData.get("bookingId") ?? "").trim();
    const action = parseSellerAction(formData.get("action"));

    if (!bookingId || !action) {
      return { error: "Invalid request" };
    }

    await updateBookingBySeller({
      bookingId,
      profileId: auth.profile.id,
      role: auth.profile.role,
      action,
    });

    revalidatePath("/seller");
    revalidatePath("/account/bookings");
    revalidatePath("/offers");
    revalidatePath("/notifications");
    redirect("/seller/bookings?updated=1");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof BookingServiceError) {
      return { error: error.message };
    }
    return { error: "Could not update order" };
  }
}
