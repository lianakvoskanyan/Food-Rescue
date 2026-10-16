"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { assertSellerCanMutate, requireSellerDashboard } from "@/lib/seller/access";
import { SellerServiceError } from "@/lib/seller/errors";
import {
  completeOfferForSeller,
  createOfferForSeller,
  createStoreForSeller,
  unpublishOfferForSeller,
  updateOfferForSeller,
  updateStoreForSeller,
} from "@/lib/seller/service";

export type SellerFormState = {
  error?: string;
  success?: string;
};

export async function createStoreAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  try {
    const auth = await requireSellerDashboard("/seller/store");
    assertSellerCanMutate(auth);

    const { storeId } = await createStoreForSeller({
      profileId: auth.profile.id,
      title: formData.get("title"),
      description: formData.get("description"),
      street: formData.get("street"),
      city: formData.get("city"),
      postalCode: formData.get("postalCode"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      website: formData.get("website"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      imageFile: formData.get("image"),
    });

    revalidatePath("/", "layout");
    revalidatePath("/seller");
    revalidatePath("/seller/store");
    revalidatePath("/stores");
    revalidatePath("/offers");
    revalidatePath("/admin/stores");
    redirect(
      `/seller/store?created=1&id=${encodeURIComponent(storeId)}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof SellerServiceError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.trim()) {
      console.error("[createStoreAction]", error);
      return { error: `Could not create store: ${error.message}` };
    }
    return { error: "Could not create store" };
  }
}

export async function updateStoreAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  try {
    const auth = await requireSellerDashboard("/seller/store");
    assertSellerCanMutate(auth);

    await updateStoreForSeller({
      profileId: auth.profile.id,
      title: formData.get("title"),
      description: formData.get("description"),
      street: formData.get("street"),
      city: formData.get("city"),
      postalCode: formData.get("postalCode"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      website: formData.get("website"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      imageFile: formData.get("image"),
    });

    revalidatePath("/", "layout");
    revalidatePath("/seller");
    revalidatePath("/seller/store");
    revalidatePath("/stores");
    revalidatePath("/offers");
    return { success: "Store details saved" };
  } catch (error) {
    if (error instanceof SellerServiceError) {
      return { error: error.message };
    }
    return { error: "Could not save store" };
  }
}

export async function createOfferAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  try {
    const auth = await requireSellerDashboard("/seller/offers/new");
    assertSellerCanMutate(auth);

    const result = await createOfferForSeller({
      profileId: auth.profile.id,
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      originalPrice: formData.get("originalPrice"),
      categoryId: formData.get("categoryId"),
      quantityAvailable: formData.get("quantityAvailable"),
      pickupStart: formData.get("pickupStart"),
      pickupEnd: formData.get("pickupEnd"),
      reservationDeadline: formData.get("reservationDeadline"),
      imageFile: formData.get("image"),
    });

    revalidatePath("/seller");
    revalidatePath("/seller/offers");
    revalidatePath("/offers");
    revalidatePath(`/seller/offers/${result.offerId}`);
    redirect(`/seller/offers/${result.offerId}?created=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof SellerServiceError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.trim()) {
      console.error("[createOfferAction]", error);
      return { error: `Could not create offer: ${error.message}` };
    }
    return { error: "Could not create offer" };
  }
}

export async function updateOfferAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  try {
    const offerId = String(formData.get("offerId") ?? "").trim();
    const auth = await requireSellerDashboard(
      offerId ? `/seller/offers/${offerId}` : "/seller/offers",
    );
    assertSellerCanMutate(auth);

    if (!offerId) {
      return { error: "Offer not specified" };
    }

    await updateOfferForSeller({
      profileId: auth.profile.id,
      offerId,
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      originalPrice: formData.get("originalPrice"),
      categoryId: formData.get("categoryId"),
      quantityAvailable: formData.get("quantityAvailable"),
      pickupStart: formData.get("pickupStart"),
      pickupEnd: formData.get("pickupEnd"),
      reservationDeadline: formData.get("reservationDeadline"),
      publicationStatus: formData.get("publicationStatus"),
      imageFile: formData.get("image"),
    });

    revalidatePath("/seller");
    revalidatePath("/seller/offers");
    revalidatePath(`/seller/offers/${offerId}`);
    revalidatePath("/offers");
    return { success: "Offer updated" };
  } catch (error) {
    if (error instanceof SellerServiceError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.trim()) {
      console.error("[updateOfferAction]", error);
      return { error: `Could not update offer: ${error.message}` };
    }
    return { error: "Could not update offer" };
  }
}

export async function completeOfferAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  try {
    const offerId = String(formData.get("offerId") ?? "").trim();
    const auth = await requireSellerDashboard("/seller/offers");
    assertSellerCanMutate(auth);

    if (!offerId) {
      return { error: "Offer not specified" };
    }

    await completeOfferForSeller({
      profileId: auth.profile.id,
      offerId,
    });

    revalidatePath("/seller");
    revalidatePath("/seller/offers");
    revalidatePath(`/seller/offers/${offerId}`);
    revalidatePath("/offers");
    return { success: "Offer marked as completed" };
  } catch (error) {
    if (error instanceof SellerServiceError) {
      return { error: error.message };
    }
    return { error: "Could not complete offer" };
  }
}

export async function unpublishOfferAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  try {
    const offerId = String(formData.get("offerId") ?? "").trim();
    const auth = await requireSellerDashboard("/seller/offers");
    assertSellerCanMutate(auth);

    if (!offerId) {
      return { error: "Offer not specified" };
    }

    await unpublishOfferForSeller({
      profileId: auth.profile.id,
      offerId,
    });

    revalidatePath("/seller");
    revalidatePath("/seller/offers");
    revalidatePath("/offers");
    redirect("/seller/offers?unpublished=1");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof SellerServiceError) {
      return { error: error.message };
    }
    return { error: "Could not unpublish" };
  }
}
