"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdminDashboard } from "@/lib/admin/access";
import { AdminServiceError } from "@/lib/admin/errors";
import { notifySellerPublicationUpdate } from "@/lib/notifications/triggers";
import { offerNotifyContextQuery } from "@/lib/sanity/queries";
import { sanityServerClient } from "@/lib/sanity/serverClient";
import {
  setOfferPublicationStatus,
  setStorePublished,
} from "@/lib/admin/service";

export type AdminFormState = {
  error?: string;
  success?: string;
};

async function notifySellerOfferPublication(
  offerId: string,
  status: "published" | "draft",
): Promise<void> {
  const offer = await sanityServerClient.fetch<{
    _id: string;
    title: string;
    sellerProfileId?: string | null;
  } | null>(offerNotifyContextQuery, { offerId });

  if (!offer?.sellerProfileId) {
    return;
  }

  const message =
    status === "published"
      ? "{title} was approved and published by an administrator."
      : "{title} was unpublished by an administrator (draft).";

  await notifySellerPublicationUpdate({
    sellerProfileId: offer.sellerProfileId,
    offerId: offer._id,
    offerTitle: offer.title,
    message,
    dedupeSuffix: `admin-${status}`,
  });
}

function revalidateCatalogPaths(): void {
  revalidatePath("/");
  revalidatePath("/offers");
  revalidatePath("/stores");
  revalidatePath("/admin");
  revalidatePath("/admin/stores");
  revalidatePath("/admin/offers");
}

export async function adminSetStorePublishedAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await requireAdminDashboard("/admin/stores");

    const storeId = String(formData.get("storeId") ?? "").trim();
    const action = String(formData.get("action") ?? "");

    if (!storeId) {
      return { error: "Store not specified." };
    }

    if (action === "publish") {
      await setStorePublished({ storeId, published: true });
      revalidateCatalogPaths();
      return { success: "Store is published on the site again." };
    }

    if (action === "unpublish") {
      await setStorePublished({ storeId, published: false });
      revalidateCatalogPaths();
      return { success: "Store is hidden from the storefront." };
    }

    return { error: "Invalid action." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AdminServiceError) {
      return { error: error.message };
    }
    return { error: "Could not update store." };
  }
}

export async function adminSetOfferStatusAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await requireAdminDashboard("/admin/offers");

    const offerId = String(formData.get("offerId") ?? "").trim();
    const action = String(formData.get("action") ?? "");

    if (!offerId) {
      return { error: "Offer not specified." };
    }

    if (action === "publish") {
      await setOfferPublicationStatus({ offerId, status: "published" });
      try {
        await notifySellerOfferPublication(offerId, "published");
      } catch (notifyError) {
        console.error("[adminSetOfferStatusAction] notification", notifyError);
      }
      revalidateCatalogPaths();
      revalidatePath("/seller");
      return { success: "Offer published." };
    }

    if (action === "unpublish") {
      await setOfferPublicationStatus({ offerId, status: "draft" });
      try {
        await notifySellerOfferPublication(offerId, "draft");
      } catch (notifyError) {
        console.error("[adminSetOfferStatusAction] notification", notifyError);
      }
      revalidateCatalogPaths();
      revalidatePath("/seller");
      return { success: "Offer unpublished (draft)." };
    }

    return { error: "Invalid action." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AdminServiceError) {
      return { error: error.message };
    }
    return { error: "Could not update offer." };
  }
}
