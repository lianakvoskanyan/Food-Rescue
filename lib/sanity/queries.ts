export const categoryFields = /* groq */ `
  _id,
  title,
  slug,
  description,
  image
`;

export const storeFields = /* groq */ `
  _id,
  title,
  slug,
  description,
  address,
  location,
  image,
  contactInfo,
  isPublished
`;

/** На документе store: isPublished не задан или true. */
export const storeIsPublishedFilter = /* groq */ `
  (!defined(isPublished) || isPublished == true)
`;

/** На foodOffer: связанный магазин опубликован (корректный синтаксис GROQ). */
export const offerLinkedStorePublishedFilter = /* groq */ `
  (!defined(store->isPublished) || store->isPublished == true)
`;

/** Reservation still open (deadline defaults to pickup end). */
export const offerReservationOpenFilter = /* groq */ `
  coalesce(reservationDeadline, pickupWindow.end) > now()
`;

export const foodOfferListFields = /* groq */ `
  _id,
  title,
  slug,
  description,
  price,
  originalPrice,
  image,
  quantityAvailable,
  reservationDeadline,
  pickupWindow,
  publicationStatus,
  isFeatured,
  "store": store->{${storeFields}},
  "category": category->{${categoryFields}}
`;

export const publishedFoodOffersQuery = /* groq */ `
  *[
    _type == "foodOffer"
    && publicationStatus == "published"
    && ${offerReservationOpenFilter}
    && ${offerLinkedStorePublishedFilter}
  ] | order(pickupWindow.start asc) {
      ${foodOfferListFields}
    }
`;

export const featuredFoodOffersQuery = /* groq */ `
  *[
    _type == "foodOffer"
    && publicationStatus == "published"
    && ${offerReservationOpenFilter}
    && isFeatured == true
    && ${offerLinkedStorePublishedFilter}
  ] | order(pickupWindow.start asc) [0...8] {
      ${foodOfferListFields}
    }
`;

/** Published, in-stock, reservation open, deadline within the next 3 hours (Sanity `now()`). */
export const endingSoonFoodOffersQuery = /* groq */ `
  *[
    _type == "foodOffer"
    && publicationStatus == "published"
    && quantityAvailable > 0
    && ${offerReservationOpenFilter}
    && coalesce(reservationDeadline, pickupWindow.end) <= dateTime(now()) + 10800
    && ${offerLinkedStorePublishedFilter}
  ] | order(coalesce(reservationDeadline, pickupWindow.end) asc) {
      ${foodOfferListFields}
    }
`;

export const foodOfferBySlugQuery = /* groq */ `
  *[_type == "foodOffer" && slug.current == $slug][0] {
    ${foodOfferListFields},
    "relatedOffers": *[
      _type == "foodOffer"
      && publicationStatus == "published"
      && ${offerReservationOpenFilter}
      && slug.current != ^.slug.current
      && (
        store._ref == ^.store._ref
        || category._ref == ^.category._ref
      )
    ] | order(pickupWindow.start asc) [0...3] {
      ${foodOfferListFields}
    }
  }
`;

export const storesQuery = /* groq */ `
  *[_type == "store" && ${storeIsPublishedFilter}] | order(title asc) {
    ${storeFields}
  }
`;

export const storeBySlugQuery = /* groq */ `
  *[_type == "store" && slug.current == $slug && ${storeIsPublishedFilter}][0] {
    ${storeFields},
    "offers": *[
      _type == "foodOffer"
      && references(^._id)
      && publicationStatus == "published"
      && ${offerReservationOpenFilter}
    ] | order(pickupWindow.start asc) {
      ${foodOfferListFields}
    }
  }
`;

/** Админ-предпросмотр: любой магазин по slug, все предложения магазина. */
export const storeBySlugAdminPreviewQuery = /* groq */ `
  *[_type == "store" && slug.current == $slug][0] {
    ${storeFields},
    "offers": *[
      _type == "foodOffer"
      && references(^._id)
    ] | order(pickupWindow.start asc) {
      ${foodOfferListFields}
    }
  }
`;

/** Админ-предпросмотр: любое предложение по slug (включая черновики). */
export const foodOfferBySlugAdminPreviewQuery = /* groq */ `
  *[_type == "foodOffer" && slug.current == $slug][0] {
    ${foodOfferListFields},
    "relatedOffers": *[
      _type == "foodOffer"
      && publicationStatus == "published"
      && ${offerReservationOpenFilter}
      && slug.current != ^.slug.current
      && (
        store._ref == ^.store._ref
        || category._ref == ^.category._ref
      )
    ] | order(pickupWindow.start asc) [0...3] {
      ${foodOfferListFields}
    }
  }
`;

export const categoriesQuery = /* groq */ `
  *[_type == "category"] | order(title asc) {
    ${categoryFields}
  }
`;

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    siteTitle,
    siteTagline,
    headerLinks[]{ label, href },
    loginLabel,
    loginHref,
    heroBadge,
    heroTitle,
    heroSubtitle,
    searchPlaceholder,
    heroCtaLabel,
    heroCtaHref,
    popularSectionTitle,
    popularSectionDescription,
    storesSectionTitle,
    storesSectionDescription,
    categoriesSectionTitle,
    categoriesSectionDescription,
    offersSectionTitle,
    offersSectionDescription,
    benefitsSectionTitle,
    benefits[]{ title, description },
    footerDescription,
    footerCopyright,
    footerLinks[]{ label, href }
  }
`;

export const foodOfferForBookingQuery = /* groq */ `
  *[_type == "foodOffer" && _id == $offerId][0] {
    _id,
    _rev,
    title,
    slug,
    quantityAvailable,
    publicationStatus,
    reservationDeadline,
    pickupWindow,
    "storeIsPublished": store->isPublished,
    "sellerProfileId": store->sellerProfile._ref
  }
`;

export const offerActiveBookedQuantitiesQuery = /* groq */ `
  *[
    _type == "booking"
    && offer._ref == $offerId
    && status in ["pending", "confirmed"]
  ].quantity
`;

export const bookingOwnedByProfileQuery = /* groq */ `
  *[_type == "booking" && _id == $bookingId && buyer._ref == $profileId][0] {
    _id,
    _rev,
    bookingNumber,
    quantity,
    status,
    createdAt,
    "offerRef": offer._ref,
    "offerTitle": offer->title,
    "sellerProfileId": offer->store->sellerProfile._ref,
    "buyerProfileId": buyer._ref
  }
`;

export const bookingIdByNumberQuery = /* groq */ `
  *[_type == "booking" && bookingNumber == $bookingNumber][0]._id
`;

export const activeBookingBuyerIdsForOfferQuery = /* groq */ `
  *[
    _type == "booking"
    && offer._ref == $offerId
    && status in ["pending", "confirmed"]
  ].buyer._ref
`;

export const adminProfileIdsQuery = /* groq */ `
  *[_type == "userProfile" && role == "admin"]._id
`;

export const notificationDedupeExistsQuery = /* groq */ `
  count(*[
    _type == "notification"
    && dedupeKey == $dedupeKey
    && recipient._ref == $recipientProfileId
  ]) > 0
`;

export const notificationsUnreadCountQuery = /* groq */ `
  count(*[
    _type == "notification"
    && recipient._ref == $profileId
    && !defined(readAt)
  ])
`;

export const notificationInboxQuery = /* groq */ `
  *[
    _type == "notification"
    && recipient._ref == $profileId
  ] | order(createdAt desc) [0...$limit] {
    _id,
    eventType,
    title,
    body,
    href,
    createdAt,
    readAt
  }
`;

export const sellerDeadlineReminderCandidatesQuery = /* groq */ `
  *[
    _type == "foodOffer"
    && store->sellerProfile._ref == $profileId
    && publicationStatus == "published"
  ] {
    _id,
    title,
    publicationStatus,
    reservationDeadline,
    pickupWindow
  }
`;

export const customerPickupReminderCandidatesQuery = /* groq */ `
  *[
    _type == "booking"
    && buyer._ref == $profileId
    && status in ["pending", "confirmed"]
  ] {
    _id,
    bookingNumber,
    "offerTitle": offer->title,
    "pickupEnd": offer->pickupWindow.end
  }
`;

export const offerNotifyContextQuery = /* groq */ `
  *[_type == "foodOffer" && _id == $offerId][0] {
    _id,
    title,
    "sellerProfileId": store->sellerProfile._ref
  }
`;

export const bookingsForSellerQuery = /* groq */ `
  *[
    _type == "booking"
    && (
      $isAdmin == true
      || offer->store->sellerProfile._ref == $profileId
    )
  ] | order(createdAt desc) {
    _id,
    bookingNumber,
    quantity,
    status,
    createdAt,
    "buyer": buyer->{
      email,
      displayName
    },
    "offer": offer->{
      _id,
      title,
      slug,
      price,
      quantityAvailable,
      pickupWindow,
      publicationStatus,
      "store": store->{
        title,
        slug,
        "sellerProfileId": sellerProfile._ref
      }
    }
  }
`;

export const bookingForSellerManageQuery = /* groq */ `
  *[_type == "booking" && _id == $bookingId][0] {
    _id,
    _rev,
    bookingNumber,
    quantity,
    status,
    "buyerProfileId": buyer._ref,
    "offerRef": offer._ref,
    "offerTitle": offer->title,
    "sellerProfileId": offer->store->sellerProfile._ref
  }
`;

export const storeForSellerQuery = /* groq */ `
  *[_type == "store" && sellerProfile._ref == $profileId][0] {
    _id,
    title,
    slug,
    description,
    address,
    location,
    contactInfo,
    image,
    isPublished
  }
`;

export const storeForSellerByIdQuery = /* groq */ `
  *[
    _type == "store"
    && _id == $storeId
    && sellerProfile._ref == $profileId
  ][0] {
    _id,
    title,
    slug,
    description,
    address,
    contactInfo,
    image,
    isPublished
  }
`;

export const sellerDashboardCountsQuery = /* groq */ `{
  "offersCount": count(*[
    _type == "foodOffer"
    && ($isAdmin == true || store->sellerProfile._ref == $profileId)
  ]),
  "publishedOffersCount": count(*[
    _type == "foodOffer"
    && ($isAdmin == true || store->sellerProfile._ref == $profileId)
    && publicationStatus == "published"
  ]),
  "draftOffersCount": count(*[
    _type == "foodOffer"
    && ($isAdmin == true || store->sellerProfile._ref == $profileId)
    && publicationStatus == "draft"
  ]),
  "bookingsTotal": count(*[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
  ]),
  "bookingsActive": count(*[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
    && status in ["pending", "confirmed"]
  ]),
  "bookingsPending": count(*[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
    && status == "pending"
  ]),
  "bookingsConfirmed": count(*[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
    && status == "confirmed"
  ]),
  "bookingsCompleted": count(*[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
    && status == "completed"
  ]),
  "bookingsCancelled": count(*[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
    && status == "cancelled"
  ])
}`;

export const sellerOfferCatalogAnalyticsQuery = /* groq */ `
  *[
    _type == "foodOffer"
    && ($isAdmin == true || store->sellerProfile._ref == $profileId)
  ] {
    quantityAvailable,
    price,
    originalPrice,
    publicationStatus
  }
`;

export const sellerBookingsAnalyticsQuery = /* groq */ `
  *[
    _type == "booking"
    && ($isAdmin == true || offer->store->sellerProfile._ref == $profileId)
  ] {
    quantity,
    status,
    "price": offer->price,
    "originalPrice": offer->originalPrice
  }
`;

export const offersForSellerQuery = /* groq */ `
  *[
    _type == "foodOffer"
    && ($isAdmin == true || store->sellerProfile._ref == $profileId)
  ] | order(_updatedAt desc) {
    _id,
    title,
    slug,
    price,
    originalPrice,
    quantityAvailable,
    publicationStatus,
    reservationDeadline,
    pickupWindow,
    "storeId": store._ref,
    "category": category->{ _id, title }
  }
`;

export const offerForSellerManageQuery = /* groq */ `
  *[_type == "foodOffer" && _id == $offerId][0] {
    _id,
    title,
    slug,
    description,
    price,
    originalPrice,
    quantityAvailable,
    publicationStatus,
    reservationDeadline,
    pickupWindow,
    image,
    "storeId": store._ref,
    "sellerProfileId": store->sellerProfile._ref,
    "categoryId": category._ref
  }
`;

export const offerSlugExistsQuery = /* groq */ `
  count(*[
    _type == "foodOffer"
    && slug.current == $slug
    && ($excludeId == "" || _id != $excludeId)
  ])
`;

export const storeSlugExistsQuery = /* groq */ `
  count(*[
    _type == "store"
    && slug.current == $slug
    && ($excludeId == "" || _id != $excludeId)
  ])
`;

export const bookingStatsForProfileQuery = /* groq */ `{
  "total": count(*[_type == "booking" && buyer._ref == $profileId]),
  "active": count(*[
    _type == "booking"
    && buyer._ref == $profileId
    && status in ["pending", "confirmed"]
  ])
}`;

export const bookingsByProfileQuery = /* groq */ `
  *[_type == "booking" && buyer._ref == $profileId] | order(createdAt desc) {
    _id,
    bookingNumber,
    quantity,
    status,
    createdAt,
    "offer": offer->{
      _id,
      title,
      slug,
      price,
      quantityAvailable,
      pickupWindow,
      publicationStatus,
      "store": store->{
        title,
        slug
      }
    }
  }
`;

export const adminDashboardStatsQuery = /* groq */ `{
  "storesTotal": count(*[_type == "store"]),
  "storesPublished": count(*[_type == "store" && ${storeIsPublishedFilter}]),
  "offersTotal": count(*[_type == "foodOffer"]),
  "offersPublished": count(*[_type == "foodOffer" && publicationStatus == "published"]),
  "offersDraft": count(*[_type == "foodOffer" && publicationStatus == "draft"]),
  "bookingsTotal": count(*[_type == "booking"]),
  "bookingsPending": count(*[_type == "booking" && status == "pending"]),
  "bookingsActive": count(*[
    _type == "booking" && status in ["pending", "confirmed"]
  ]),
  "usersTotal": count(*[_type == "userProfile"]),
  "usersCustomer": count(*[_type == "userProfile" && role == "customer"]),
  "usersSeller": count(*[_type == "userProfile" && role == "seller"]),
  "usersAdmin": count(*[_type == "userProfile" && role == "admin"])
}`;

export const adminStoresListQuery = /* groq */ `
  *[_type == "store"] | order(title asc) {
    _id,
    title,
    slug,
    isPublished,
    "offersCount": count(*[_type == "foodOffer" && references(^._id)]),
    "publishedOffersCount": count(*[
      _type == "foodOffer"
      && references(^._id)
      && publicationStatus == "published"
    ]),
    "sellerEmail": sellerProfile->email
  }
`;

export const adminOffersListQuery = /* groq */ `
  *[_type == "foodOffer"] | order(_updatedAt desc) {
    _id,
    title,
    slug,
    price,
    quantityAvailable,
    publicationStatus,
    "store": store->{
      title,
      isPublished
    },
    "category": category->{
      title
    }
  }
`;

export const adminBookingsListQuery = /* groq */ `
  *[_type == "booking"] | order(createdAt desc) {
    _id,
    bookingNumber,
    quantity,
    status,
    createdAt,
    "buyer": buyer->{
      email,
      displayName
    },
    "offer": offer->{
      _id,
      title,
      slug,
      price,
      publicationStatus,
      "store": store->{
        title,
        slug
      }
    }
  }
`;
