import type { SanityImageSource } from "@sanity/image-url";

export type SanitySlug = {
  current: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type SiteBenefit = {
  title: string;
  description: string;
};

export type SiteSettings = {
  siteTitle: string;
  siteTagline?: string;
  headerLinks?: NavLink[];
  loginLabel?: string;
  loginHref?: string;
  heroBadge?: string;
  heroTitle: string;
  heroSubtitle?: string;
  searchPlaceholder: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  popularSectionTitle?: string;
  popularSectionDescription?: string;
  storesSectionTitle?: string;
  storesSectionDescription?: string;
  categoriesSectionTitle?: string;
  categoriesSectionDescription?: string;
  offersSectionTitle?: string;
  offersSectionDescription?: string;
  benefitsSectionTitle?: string;
  benefits?: SiteBenefit[];
  footerDescription?: string;
  footerCopyright?: string;
  footerLinks?: NavLink[];
};

export type StoreAddress = {
  street: string;
  city: string;
  postalCode?: string;
};

export type StoreContactInfo = {
  phone?: string;
  email?: string;
  website?: string;
};

export type Category = {
  _id: string;
  title: string;
  slug: SanitySlug;
  description?: string;
  image?: SanityImageSource;
};

export type StoreGeopoint = {
  lat: number;
  lng: number;
  alt?: number;
};

export type Store = {
  _id: string;
  title: string;
  slug: SanitySlug;
  description?: string;
  address?: StoreAddress;
  location?: StoreGeopoint | null;
  image?: SanityImageSource;
  contactInfo?: StoreContactInfo;
  /** Отсутствие поля трактуется как опубликовано (старые документы). */
  isPublished?: boolean;
};

export type AdminDashboardStats = {
  storesTotal: number;
  storesPublished: number;
  offersTotal: number;
  offersPublished: number;
  offersDraft: number;
  bookingsTotal: number;
  bookingsPending: number;
  bookingsActive: number;
  usersTotal: number;
  usersCustomer: number;
  usersSeller: number;
  usersAdmin: number;
};

export type AdminStoreListItem = {
  _id: string;
  title: string;
  slug: SanitySlug;
  isPublished?: boolean;
  offersCount: number;
  publishedOffersCount: number;
  sellerEmail?: string | null;
};

export type AdminOfferListItem = {
  _id: string;
  title: string;
  slug: SanitySlug;
  price: number;
  quantityAvailable: number;
  publicationStatus: FoodOfferPublicationStatus;
  store?: { title: string; isPublished?: boolean } | null;
  category?: { title: string } | null;
};

export type FoodOfferPublicationStatus =
  | "draft"
  | "published"
  | "soldOut"
  | "expired";

export type PickupWindow = {
  start: string;
  end: string;
};

export type FoodOffer = {
  _id: string;
  title: string;
  slug: SanitySlug;
  description?: string;
  price: number;
  originalPrice: number;
  image?: SanityImageSource;
  quantityAvailable: number;
  reservationDeadline?: string | null;
  pickupWindow: PickupWindow;
  publicationStatus: FoodOfferPublicationStatus;
  isFeatured?: boolean;
  store?: Store | null;
  category?: Category | null;
};

export type FoodOfferWithRelated = FoodOffer & {
  relatedOffers?: FoodOffer[];
};

export type StoreWithOffers = Store & {
  offers?: FoodOffer[];
};

export type HomePageData = {
  settings: SiteSettings | null;
  categories: Category[];
  stores: Store[];
  offers: FoodOffer[];
  featuredOffers: FoodOffer[];
  endingSoonOffers: FoodOffer[];
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type BookingOfferSummary = Pick<
  FoodOffer,
  | "_id"
  | "title"
  | "slug"
  | "price"
  | "quantityAvailable"
  | "pickupWindow"
  | "publicationStatus"
> & {
  store?: Pick<Store, "title" | "slug"> | null;
};

export type BookingBuyerSummary = {
  email: string;
  displayName?: string | null;
};

export type Booking = {
  _id: string;
  bookingNumber: string;
  quantity: number;
  status: BookingStatus;
  createdAt: string;
  offer?: BookingOfferSummary | null;
  buyer?: BookingBuyerSummary | null;
};

export type SellerDashboardStats = {
  offersCount: number;
  publishedOffersCount: number;
  draftOffersCount: number;
  portionsAvailable: number;
  inventoryRetailValue: number;
  inventoryFullValue: number;
  bookingsTotal: number;
  bookingsActive: number;
  bookingsPending: number;
  bookingsConfirmed: number;
  bookingsCompleted: number;
  bookingsCancelled: number;
  revenueCompleted: number;
  revenuePipeline: number;
  rescueValueCompleted: number;
  customerSavingsCompleted: number;
  setsSoldCompleted: number;
  averageOrderCompleted: number;
};

export type SellerOfferListItem = {
  _id: string;
  title: string;
  slug: SanitySlug;
  price: number;
  originalPrice: number;
  quantityAvailable: number;
  publicationStatus: FoodOfferPublicationStatus;
  reservationDeadline?: string | null;
  pickupWindow: PickupWindow;
  storeId?: string;
  category?: Pick<Category, "_id" | "title"> | null;
};

export type FoodOfferForBooking = Pick<
  FoodOffer,
  | "_id"
  | "title"
  | "slug"
  | "quantityAvailable"
  | "publicationStatus"
  | "reservationDeadline"
  | "pickupWindow"
> & {
  _rev?: string;
  storeIsPublished?: boolean;
  sellerProfileId?: string | null;
};

export type NotificationRecord = {
  _id: string;
  eventType: string;
  title: string;
  body?: string | null;
  href?: string | null;
  createdAt: string;
  readAt?: string | null;
};
