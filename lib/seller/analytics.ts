import type { BookingStatus, SellerDashboardStats } from "@/lib/sanity/types";

type OfferCatalogRow = {
  quantityAvailable?: number;
  price?: number;
  originalPrice?: number;
  publicationStatus?: string;
};

type BookingAnalyticsRow = {
  quantity?: number;
  status?: BookingStatus | string;
  price?: number;
  originalPrice?: number;
};

type DashboardCountsRow = {
  offersCount?: number;
  publishedOffersCount?: number;
  draftOffersCount?: number;
  bookingsTotal?: number;
  bookingsActive?: number;
  bookingsPending?: number;
  bookingsConfirmed?: number;
  bookingsCompleted?: number;
  bookingsCancelled?: number;
};

function lineTotal(quantity: number, unitPrice: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return 0;
  }
  return Math.max(0, quantity) * Math.max(0, unitPrice);
}

function sumBookingRevenue(
  rows: BookingAnalyticsRow[],
  statuses: BookingStatus[],
): number {
  return rows.reduce((total, row) => {
    if (!row.status || !statuses.includes(row.status as BookingStatus)) {
      return total;
    }
    return total + lineTotal(row.quantity ?? 0, row.price ?? 0);
  }, 0);
}

function sumBookingRescueValue(
  rows: BookingAnalyticsRow[],
  statuses: BookingStatus[],
): number {
  return rows.reduce((total, row) => {
    if (!row.status || !statuses.includes(row.status as BookingStatus)) {
      return total;
    }
    return total + lineTotal(row.quantity ?? 0, row.originalPrice ?? 0);
  }, 0);
}

function sumBookingQuantity(
  rows: BookingAnalyticsRow[],
  statuses: BookingStatus[],
): number {
  return rows.reduce((total, row) => {
    if (!row.status || !statuses.includes(row.status as BookingStatus)) {
      return total;
    }
    return total + Math.max(0, row.quantity ?? 0);
  }, 0);
}

export function buildSellerDashboardStats(input: {
  counts: DashboardCountsRow | null;
  offers: OfferCatalogRow[];
  bookings: BookingAnalyticsRow[];
}): SellerDashboardStats {
  const offers = input.offers ?? [];
  const bookings = input.bookings ?? [];
  const counts = input.counts ?? {};

  const portionsAvailable = offers.reduce(
    (total, row) => total + Math.max(0, row.quantityAvailable ?? 0),
    0,
  );

  const publishedOffersCount =
    counts.publishedOffersCount ??
    offers.filter((row) => row.publicationStatus === "published").length;

  const draftOffersCount =
    counts.draftOffersCount ??
    offers.filter((row) => row.publicationStatus === "draft").length;

  const inventoryRetailValue = offers
    .filter((row) => row.publicationStatus === "published")
    .reduce(
      (total, row) =>
        total + lineTotal(row.quantityAvailable ?? 0, row.price ?? 0),
      0,
    );

  const inventoryFullValue = offers
    .filter((row) => row.publicationStatus === "published")
    .reduce(
      (total, row) =>
        total + lineTotal(row.quantityAvailable ?? 0, row.originalPrice ?? 0),
      0,
    );

  const completedStatuses: BookingStatus[] = ["completed"];
  const pipelineStatuses: BookingStatus[] = ["pending", "confirmed"];

  const revenueCompleted = sumBookingRevenue(bookings, completedStatuses);
  const revenuePipeline = sumBookingRevenue(bookings, pipelineStatuses);
  const rescueValueCompleted = sumBookingRescueValue(bookings, completedStatuses);
  const customerSavingsCompleted = Math.max(
    0,
    rescueValueCompleted - revenueCompleted,
  );
  const setsSoldCompleted = sumBookingQuantity(bookings, completedStatuses);
  const averageOrderCompleted =
    setsSoldCompleted > 0 ? Math.round(revenueCompleted / setsSoldCompleted) : 0;

  return {
    offersCount: counts.offersCount ?? offers.length,
    publishedOffersCount,
    draftOffersCount,
    portionsAvailable,
    inventoryRetailValue,
    inventoryFullValue,
    bookingsTotal: counts.bookingsTotal ?? bookings.length,
    bookingsActive:
      counts.bookingsActive ??
      (counts.bookingsPending ?? 0) + (counts.bookingsConfirmed ?? 0),
    bookingsPending:
      counts.bookingsPending ??
      bookings.filter((row) => row.status === "pending").length,
    bookingsConfirmed:
      counts.bookingsConfirmed ??
      bookings.filter((row) => row.status === "confirmed").length,
    bookingsCompleted:
      counts.bookingsCompleted ??
      bookings.filter((row) => row.status === "completed").length,
    bookingsCancelled:
      counts.bookingsCancelled ??
      bookings.filter((row) => row.status === "cancelled").length,
    revenueCompleted,
    revenuePipeline,
    rescueValueCompleted,
    customerSavingsCompleted,
    setsSoldCompleted,
    averageOrderCompleted,
  };
}
