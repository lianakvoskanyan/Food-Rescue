import "server-only";

import {
  isReservationOpen,
} from "@/lib/offers/lifecycle";
import {
  notifyModerationNewStore,
  notifyModerationOfferDraft,
  notifyOfferChangedForBookingsStable,
  notifySellerPublicationUpdate,
} from "@/lib/notifications/triggers";
import {
  activeBookingBuyerIdsForOfferQuery,
  offerActiveBookedQuantitiesQuery,
  offerForSellerManageQuery,
  offerSlugExistsQuery,
  storeForSellerQuery,
  storeSlugExistsQuery,
} from "@/lib/sanity/queries";
import { sanityManageClient } from "@/lib/sanity/manageClient";
import { sanityServerClient } from "@/lib/sanity/serverClient";
import type { FoodOfferPublicationStatus, Store } from "@/lib/sanity/types";
import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/lib/sanity/writeClient";
import {
  parseOfferImageUpload,
  uploadOfferImageField,
} from "@/lib/seller/offer-image";
import { SellerServiceError } from "@/lib/seller/errors";
import { slugifyTitle } from "@/lib/seller/slug";
import {
  parseCategoryId,
  parseDatetimeLocal,
  parseOptionalReservationDeadline,
  parseOptionalStoreGeopoint,
  parseOptionalString,
  parseOptionalWebsiteUrl,
  parsePrice,
  parsePublicationStatus,
  parseQuantity,
  parseRequiredString,
} from "@/lib/seller/validation";

type SellerStore = Pick<
  Store,
  | "_id"
  | "title"
  | "slug"
  | "description"
  | "address"
  | "location"
  | "contactInfo"
  | "image"
  | "isPublished"
>;

type SellerOfferRow = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  originalPrice: number;
  quantityAvailable: number;
  publicationStatus: FoodOfferPublicationStatus;
  pickupWindow: { start: string; end: string };
  reservationDeadline?: string | null;
  storeId?: string;
  sellerProfileId?: string | null;
  categoryId?: string;
};

async function getOfferActiveBookedQuantity(offerId: string): Promise<number> {
  const quantities = await sanityManageClient.fetch<number[]>(
    offerActiveBookedQuantitiesQuery,
    { offerId },
  );
  if (!Array.isArray(quantities)) {
    return 0;
  }
  return quantities.reduce(
    (total, quantity) =>
      total + (Number.isFinite(quantity) ? quantity : 0),
    0,
  );
}

export async function getStoreOwnedBySeller(
  profileId: string,
): Promise<SellerStore | null> {
  return sanityManageClient.fetch<SellerStore | null>(storeForSellerQuery, {
    profileId,
  });
}

async function assertOfferOwnedBySeller(
  offerId: string,
  profileId: string,
): Promise<SellerOfferRow> {
  const offer = await sanityManageClient.fetch<SellerOfferRow | null>(
    offerForSellerManageQuery,
    { offerId },
  );

  if (!offer) {
    throw new SellerServiceError("Offer not found");
  }

  if (offer.sellerProfileId !== profileId) {
    throw new SellerServiceError("You do not have access to this offer");
  }

  return offer;
}

async function assertProfileIsSeller(profileId: string): Promise<void> {
  const row = await sanityManageClient.fetch<{ role: string } | null>(
    `*[_type == "userProfile" && _id == $profileId][0]{ role }`,
    { profileId },
  );
  if (row?.role !== "seller") {
    throw new SellerServiceError("Only accounts with the seller role can create a store.");
  }
}

async function uniqueStoreSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugifyTitle(title) || "store";
  let slug = base;
  let suffix = 2;

  while (true) {
    const count = await sanityServerClient.fetch<number>(storeSlugExistsQuery, {
      slug,
      excludeId: excludeId ?? "",
    });
    if (!count) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function parseStoreFormFields(input: {
  title: unknown;
  description: unknown;
  street: unknown;
  city: unknown;
  postalCode: unknown;
  phone: unknown;
  email: unknown;
  website: unknown;
  latitude: unknown;
  longitude: unknown;
}): {
  title: string;
  description: string | null;
  street: string;
  city: string;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  location: ReturnType<typeof parseOptionalStoreGeopoint>;
} {
  const titleError = parseRequiredString(input.title, "Name");
  if (titleError) {
    throw new SellerServiceError(titleError);
  }

  const streetError = parseRequiredString(input.street, "Street");
  if (streetError) {
    throw new SellerServiceError(streetError);
  }

  const cityError = parseRequiredString(input.city, "City");
  if (cityError) {
    throw new SellerServiceError(cityError);
  }

  let website: string | undefined;
  try {
    website = parseOptionalWebsiteUrl(input.website);
  } catch {
    throw new SellerServiceError(
      "Invalid website URL. Use https://… or leave the field empty.",
    );
  }

  let location: ReturnType<typeof parseOptionalStoreGeopoint>;
  try {
    location = parseOptionalStoreGeopoint(input.latitude, input.longitude);
  } catch (error) {
    throw new SellerServiceError(
      error instanceof Error ? error.message : "Invalid map coordinates",
    );
  }

  return {
    title: String(input.title).trim(),
    description: parseOptionalString(input.description),
    street: String(input.street).trim(),
    city: String(input.city).trim(),
    postalCode: parseOptionalString(input.postalCode),
    phone: parseOptionalString(input.phone),
    email: parseOptionalString(input.email),
    website: website ?? null,
    location,
  };
}

async function uniqueOfferSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugifyTitle(title);
  let slug = base;
  let suffix = 2;

  while (true) {
    const count = await sanityServerClient.fetch<number>(offerSlugExistsQuery, {
      slug,
      excludeId: excludeId ?? "",
    });
    if (!count) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function resolveOptionalStoreImage(
  imageFile: unknown,
): Promise<Awaited<ReturnType<typeof uploadOfferImageField>> | undefined> {
  const imageUpload = await parseOfferImageUpload(imageFile);
  if (!imageUpload) {
    return undefined;
  }
  return uploadOfferImageField(imageUpload);
}

export async function createStoreForSeller(input: {
  profileId: string;
  title: unknown;
  description: unknown;
  street: unknown;
  city: unknown;
  postalCode: unknown;
  phone: unknown;
  email: unknown;
  website: unknown;
  latitude: unknown;
  longitude: unknown;
  imageFile?: unknown;
}): Promise<{ storeId: string }> {
  if (!isSanityWriteConfigured()) {
    throw new SellerServiceError("SANITY_API_WRITE_TOKEN is not configured");
  }

  await assertProfileIsSeller(input.profileId);

  const existing = await getStoreOwnedBySeller(input.profileId);
  if (existing) {
    throw new SellerServiceError("You already have a store. Edit the existing one.");
  }

  const fields = parseStoreFormFields(input);
  const slug = await uniqueStoreSlug(fields.title);
  const imageField = await resolveOptionalStoreImage(input.imageFile);

  const contactInfo = {
    ...(fields.phone ? { phone: fields.phone } : {}),
    ...(fields.email ? { email: fields.email } : {}),
    ...(fields.website ? { website: fields.website } : {}),
  };

  try {
    const created = await sanityWriteClient.create({
      _type: "store",
      title: fields.title,
      slug: { _type: "slug", current: slug },
      description: fields.description,
      isPublished: false,
      sellerProfile: { _type: "reference", _ref: input.profileId },
      address: {
        street: fields.street,
        city: fields.city,
        postalCode: fields.postalCode ?? undefined,
      },
      ...(Object.keys(contactInfo).length > 0 ? { contactInfo } : {}),
      ...(imageField ? { image: imageField } : {}),
      ...(fields.location.kind === "set"
        ? {
            location: {
              _type: "geopoint",
              lat: fields.location.lat,
              lng: fields.location.lng,
            },
          }
        : {}),
    });

    try {
      await notifyModerationNewStore({
        storeId: created._id,
        storeTitle: fields.title,
      });
    } catch (notifyError) {
      console.error("[createStoreForSeller] notification", notifyError);
    }

    return { storeId: created._id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Sanity error";
    throw new SellerServiceError(
      `Could not save store in Sanity: ${message}`,
    );
  }
}

export async function updateStoreForSeller(input: {
  profileId: string;
  title: unknown;
  description: unknown;
  street: unknown;
  city: unknown;
  postalCode: unknown;
  phone: unknown;
  email: unknown;
  website: unknown;
  latitude: unknown;
  longitude: unknown;
  imageFile?: unknown;
}): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new SellerServiceError("SANITY_API_WRITE_TOKEN is not configured");
  }

  const store = await getStoreOwnedBySeller(input.profileId);
  if (!store) {
    throw new SellerServiceError(
      "Store not created yet. Fill in the store creation form below.",
    );
  }

  const fields = parseStoreFormFields(input);
  const imageField = await resolveOptionalStoreImage(input.imageFile);

  const contactInfo = {
    ...(fields.phone ? { phone: fields.phone } : {}),
    ...(fields.email ? { email: fields.email } : {}),
    ...(fields.website ? { website: fields.website } : {}),
  };

  const patch = sanityWriteClient.patch(store._id).set({
    title: fields.title,
    description: fields.description,
    address: {
      street: fields.street,
      city: fields.city,
      postalCode: fields.postalCode ?? undefined,
    },
    ...(Object.keys(contactInfo).length > 0 ? { contactInfo } : {}),
    ...(imageField ? { image: imageField } : {}),
    ...(fields.location.kind === "set"
      ? {
          location: {
            _type: "geopoint",
            lat: fields.location.lat,
            lng: fields.location.lng,
          },
        }
      : {}),
  });

  if (fields.location.kind === "unset") {
    patch.unset(["location"]);
  }

  await patch.commit();
}

export async function createOfferForSeller(input: {
  profileId: string;
  title: unknown;
  description: unknown;
  price: unknown;
  originalPrice: unknown;
  categoryId: unknown;
  quantityAvailable: unknown;
  pickupStart: unknown;
  pickupEnd: unknown;
  reservationDeadline?: unknown;
  imageFile?: unknown;
}): Promise<{ offerId: string }> {
  if (!isSanityWriteConfigured()) {
    throw new SellerServiceError("SANITY_API_WRITE_TOKEN is not configured");
  }

  const store = await getStoreOwnedBySeller(input.profileId);
  if (!store) {
    throw new SellerServiceError("Link a store to the seller profile first");
  }

  const titleError = parseRequiredString(input.title, "Name");
  if (titleError) {
    throw new SellerServiceError(titleError);
  }

  const price = parsePrice(input.price);
  const originalPrice = parsePrice(input.originalPrice);
  if (price === null || originalPrice === null) {
    throw new SellerServiceError("Enter valid prices");
  }

  const categoryId = parseCategoryId(input.categoryId);
  if (!categoryId) {
    throw new SellerServiceError("Select a category");
  }

  const quantity = parseQuantity(input.quantityAvailable);
  if (quantity === null) {
    throw new SellerServiceError("Enter a valid number of bundles");
  }

  const pickupStart = parseDatetimeLocal(input.pickupStart);
  const pickupEnd = parseDatetimeLocal(input.pickupEnd);
  if (!pickupStart || !pickupEnd) {
    throw new SellerServiceError("Enter pickup times");
  }
  if (new Date(pickupEnd) <= new Date(pickupStart)) {
    throw new SellerServiceError("Pickup end must be after pickup start");
  }

  const reservationDeadline = parseOptionalReservationDeadline(
    input.reservationDeadline,
  );
  if (reservationDeadline === null) {
    throw new SellerServiceError("Enter a valid reservation deadline or leave it empty");
  }
  if (
    reservationDeadline &&
    new Date(reservationDeadline).getTime() > new Date(pickupEnd).getTime()
  ) {
    throw new SellerServiceError(
      "Reservation deadline cannot be after the pickup window end",
    );
  }

  const title = String(input.title).trim();
  const slug = await uniqueOfferSlug(title);

  const imageUpload = await parseOfferImageUpload(input.imageFile);
  const imageField = imageUpload
    ? await uploadOfferImageField(imageUpload)
    : undefined;

  const created = await sanityWriteClient.create({
    _type: "foodOffer",
    title,
    slug: { _type: "slug", current: slug },
    description: parseOptionalString(input.description),
    price,
    originalPrice,
    quantityAvailable: quantity,
    publicationStatus: "draft",
    isFeatured: false,
    store: { _type: "reference", _ref: store._id },
    category: { _type: "reference", _ref: categoryId },
    pickupWindow: { start: pickupStart, end: pickupEnd },
    ...(reservationDeadline ? { reservationDeadline } : {}),
    ...(imageField ? { image: imageField } : {}),
  });

  try {
    await notifyModerationOfferDraft({
      offerId: created._id,
      offerTitle: title,
    });
  } catch (error) {
    console.error("[createOfferForSeller] notification", error);
  }

  return { offerId: created._id };
}

export async function updateOfferForSeller(input: {
  profileId: string;
  offerId: string;
  title: unknown;
  description: unknown;
  price: unknown;
  originalPrice: unknown;
  categoryId: unknown;
  quantityAvailable: unknown;
  pickupStart: unknown;
  pickupEnd: unknown;
  reservationDeadline?: unknown;
  publicationStatus: unknown;
  imageFile?: unknown;
}): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new SellerServiceError("SANITY_API_WRITE_TOKEN is not configured");
  }

  const existing = await assertOfferOwnedBySeller(input.offerId, input.profileId);

  const titleError = parseRequiredString(input.title, "Name");
  if (titleError) {
    throw new SellerServiceError(titleError);
  }

  const price = parsePrice(input.price);
  const originalPrice = parsePrice(input.originalPrice);
  if (price === null || originalPrice === null) {
    throw new SellerServiceError("Enter valid prices");
  }

  const categoryId = parseCategoryId(input.categoryId);
  if (!categoryId) {
    throw new SellerServiceError("Select a category");
  }

  const quantity = parseQuantity(input.quantityAvailable);
  if (quantity === null) {
    throw new SellerServiceError("Enter a valid number of bundles");
  }

  const pickupStart = parseDatetimeLocal(input.pickupStart);
  const pickupEnd = parseDatetimeLocal(input.pickupEnd);
  if (!pickupStart || !pickupEnd) {
    throw new SellerServiceError("Enter pickup times");
  }
  if (new Date(pickupEnd) <= new Date(pickupStart)) {
    throw new SellerServiceError("Pickup end must be after pickup start");
  }

  const reservationDeadline = parseOptionalReservationDeadline(
    input.reservationDeadline,
  );
  if (reservationDeadline === null) {
    throw new SellerServiceError("Enter a valid reservation deadline or leave it empty");
  }
  if (
    reservationDeadline &&
    new Date(reservationDeadline).getTime() > new Date(pickupEnd).getTime()
  ) {
    throw new SellerServiceError(
      "Reservation deadline cannot be after the pickup window end",
    );
  }

  const timingFields = {
    reservationDeadline: reservationDeadline ?? null,
    pickupWindow: { start: pickupStart, end: pickupEnd },
  };

  const activeBooked = await getOfferActiveBookedQuantity(existing._id);
  if (quantity < activeBooked) {
    throw new SellerServiceError(
      `Bundles available cannot be less than active bookings (${activeBooked}).`,
    );
  }

  let publicationStatus = parsePublicationStatus(input.publicationStatus);
  if (!publicationStatus) {
    throw new SellerServiceError("Invalid publication status");
  }

  if (existing.publicationStatus === "draft") {
    if (publicationStatus === "published") {
      throw new SellerServiceError(
        "An administrator confirms publication. Wait for review or contact support.",
      );
    }
    publicationStatus = "draft";
  } else if (existing.publicationStatus === "published") {
    if (publicationStatus === "draft") {
      throw new SellerServiceError(
        'To unpublish, use the "Unpublish" button in the offers list.',
      );
    }
    if (publicationStatus === "published" && quantity < 1) {
      throw new SellerServiceError(
        'When quantity is zero, set status to "Sold out" or increase quantity.',
      );
    }
  } else if (
    existing.publicationStatus === "expired" ||
    existing.publicationStatus === "soldOut"
  ) {
    if (publicationStatus === "draft") {
      throw new SellerServiceError(
        'To unpublish, use the "Unpublish" button in the offers list.',
      );
    }
    if (publicationStatus === "published") {
      if (quantity < 1) {
        throw new SellerServiceError(
          "Increase available bundles before republishing.",
        );
      }
      if (!isReservationOpen(timingFields)) {
        throw new SellerServiceError(
          "Extend the reservation deadline to a future time before republishing.",
        );
      }
    }
  }

  if (
    publicationStatus === "published" &&
    existing.publicationStatus !== "draft" &&
    quantity < 1
  ) {
    throw new SellerServiceError(
      'When quantity is zero, set status to "Sold out" or increase quantity.',
    );
  }

  if (
    publicationStatus === "published" &&
    existing.publicationStatus !== "draft" &&
    !isReservationOpen(timingFields)
  ) {
    throw new SellerServiceError(
      "Published offers need an open reservation window. Extend the deadline or change status.",
    );
  }

  const title = String(input.title).trim();
  const slugChanged = title !== existing.title;
  const slug = slugChanged
    ? await uniqueOfferSlug(title, existing._id)
    : existing.slug.current;

  const imageUpload = await parseOfferImageUpload(input.imageFile);
  const imageField = imageUpload
    ? await uploadOfferImageField(imageUpload)
    : undefined;

  const description = parseOptionalString(input.description);

  let patch = sanityWriteClient.patch(existing._id).set({
    title,
    ...(slugChanged ? { slug: { _type: "slug", current: slug } } : {}),
    ...(description ? { description } : {}),
    price,
    originalPrice,
    quantityAvailable: quantity,
    publicationStatus,
    category: { _type: "reference", _ref: categoryId },
    pickupWindow: { start: pickupStart, end: pickupEnd },
    ...(reservationDeadline ? { reservationDeadline } : {}),
    ...(imageField ? { image: imageField } : {}),
  });

  if (!description) {
    patch = patch.unset(["description"]);
  }
  if (reservationDeadline === undefined) {
    patch = patch.unset(["reservationDeadline"]);
  }

  const timingChanged =
    existing.pickupWindow.start !== pickupStart ||
    existing.pickupWindow.end !== pickupEnd ||
    (existing.reservationDeadline ?? "") !== (reservationDeadline ?? "");

  try {
    await patch.commit();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sanity rejected the update";
    throw new SellerServiceError(message);
  }

  if (timingChanged) {
    try {
      const buyerIds = await sanityManageClient.fetch<string[]>(
        activeBookingBuyerIdsForOfferQuery,
        { offerId: existing._id },
      );
      await notifyOfferChangedForBookingsStable({
        offerId: existing._id,
        offerTitle: title,
        buyerProfileIds: buyerIds,
        changeBucket: `${pickupStart}|${pickupEnd}|${reservationDeadline ?? ""}`,
      });
    } catch (error) {
      console.error("[updateOfferForSeller] offer-changed notification", error);
    }
  }
}

export async function completeOfferForSeller(input: {
  profileId: string;
  offerId: string;
}): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new SellerServiceError("SANITY_API_WRITE_TOKEN is not configured");
  }

  const existing = await assertOfferOwnedBySeller(input.offerId, input.profileId);

  if (existing.publicationStatus === "draft") {
    throw new SellerServiceError("Draft offers are not marked complete this way.");
  }

  await sanityWriteClient
    .patch(existing._id)
    .set({ publicationStatus: "expired" })
    .commit();

  try {
    await notifySellerPublicationUpdate({
      sellerProfileId: input.profileId,
      offerId: existing._id,
      offerTitle: existing.title,
      message: "{title} was marked completed (expired).",
      dedupeSuffix: "seller-complete",
    });
  } catch (error) {
    console.error("[completeOfferForSeller] notification", error);
  }
}

export async function unpublishOfferForSeller(input: {
  profileId: string;
  offerId: string;
}): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new SellerServiceError("SANITY_API_WRITE_TOKEN is not configured");
  }

  const existing = await assertOfferOwnedBySeller(input.offerId, input.profileId);

  await sanityWriteClient
    .patch(existing._id)
    .set({ publicationStatus: "draft" })
    .commit();

  try {
    await notifySellerPublicationUpdate({
      sellerProfileId: input.profileId,
      offerId: existing._id,
      offerTitle: existing.title,
      message: "{title} was unpublished and moved to draft.",
      dedupeSuffix: "seller-unpublish",
    });
  } catch (error) {
    console.error("[unpublishOfferForSeller] notification", error);
  }
}
