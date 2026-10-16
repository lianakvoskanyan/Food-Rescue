/**
 * Idempotent demo seed for Sanity (server-side only).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-sanity.mjs --dry-run
 *   node --env-file=.env.local scripts/seed-sanity.mjs
 *
 * Requires SANITY_API_WRITE_TOKEN with create permissions.
 * Never commit the write token. Do not use NEXT_PUBLIC_* for tokens.
 */

import { createClient } from "@sanity/client";

const SEED_PREFIX = "demo-seed.";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-01-01";
const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim();
const dryRun = process.argv.includes("--dry-run");

function slug(current) {
  return { _type: "slug", current };
}

function ref(id) {
  return { _type: "reference", _ref: id };
}

function pickupWindowHoursFromNow(startOffsetHours, durationHours) {
  const start = new Date(Date.now() + startOffsetHours * 60 * 60 * 1000);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

const SITE_SETTINGS_ID = "siteSettings";

/** @type {import('@sanity/client').SanityDocumentLike[]} */
const seedDocuments = [
  {
    _id: SITE_SETTINGS_ID,
    _type: "siteSettings",
    siteTitle: "Food Rescue",
    siteTagline: "Marketplace",
    headerLinks: [
      { label: "Offers", href: "/offers" },
      { label: "Categories", href: "/#categories" },
    ],
    heroBadge: "Less waste · more value",
    heroTitle: "Rescue great food before the day ends",
    heroSubtitle:
      "Buy surplus bakery boxes, cafe bites, and grocery bags from local partners across Yerevan at a fair discount.",
    searchPlaceholder: "Search by offer or store name",
    heroCtaLabel: "Browse offers",
    heroCtaHref: "/offers",
    popularSectionTitle: "Popular rescue bags",
    popularSectionDescription:
      "Hand-picked offers with limited pickup windows — updated from our partners in Sanity.",
    storesSectionTitle: "Partner stores",
    storesSectionDescription:
      "Bakeries, cafes, and grocers listing their daily surplus on the marketplace.",
    categoriesSectionTitle: "Browse by category",
    categoriesSectionDescription:
      "Filter the catalog by the type of food you want to rescue today.",
    offersSectionTitle: "All available offers",
    offersSectionDescription:
      "Published surprise bags ready for pickup. Quantities are synced from Sanity.",
    benefitsSectionTitle: "Why Food Rescue Marketplace",
    benefits: [
      {
        title: "Save money",
        description:
          "Enjoy quality food at a lower price while helping businesses recover costs.",
      },
      {
        title: "Cut food waste",
        description:
          "Every rescued bag keeps fresh products out of landfill and on someone’s table.",
      },
      {
        title: "Support local",
        description:
          "Discover independent bakeries, cafes, and stores in your neighborhood.",
      },
    ],
    footerDescription:
      "Food Rescue Marketplace connects Yerevan residents with same-day surplus food from trusted local partners.",
    footerCopyright: "© Food Rescue Marketplace",
    footerLinks: [
      { label: "Offers catalog", href: "/offers" },
      { label: "Categories", href: "/#categories" },
      { label: "Content studio", href: "/studio" },
    ],
  },
  {
    _id: `${SEED_PREFIX}category.bakery-pastry`,
    _type: "category",
    title: "Bakery & Pastry",
    slug: slug("bakery-pastry"),
    description: "Surplus bread, viennoiserie, and same-day baked goods.",
  },
  {
    _id: `${SEED_PREFIX}category.cafe-coffee`,
    _type: "category",
    title: "Cafe & Coffee",
    slug: slug("cafe-coffee"),
    description: "Leftover pastries, sandwiches, and cafe bites.",
  },
  {
    _id: `${SEED_PREFIX}category.grocery-surplus`,
    _type: "category",
    title: "Grocery Surplus",
    slug: slug("grocery-surplus"),
    description: "Fresh produce and grocery items nearing best-before dates.",
  },
  {
    _id: `${SEED_PREFIX}category.ready-meals`,
    _type: "category",
    title: "Ready Meals",
    slug: slug("ready-meals"),
    description: "Chilled meals and deli items ready for pickup today.",
  },
  {
    _id: `${SEED_PREFIX}store.green-loaf-bakery`,
    _type: "store",
    title: "Green Loaf Bakery",
    slug: slug("green-loaf-bakery"),
    description:
      "Neighborhood bakery in Yerevan rescuing unsold loaves and pastries every evening.",
    address: {
      street: "12 Abovyan Avenue",
      city: "Yerevan",
      postalCode: "0001",
    },
    contactInfo: {
      phone: "+374 10 123 456",
      email: "hello@greenloaf.example",
    },
  },
  {
    _id: `${SEED_PREFIX}store.morning-brew-cafe`,
    _type: "store",
    title: "Morning Brew Cafe",
    slug: slug("morning-brew-cafe"),
    description:
      "Specialty coffee shop offering end-of-day surprise bags from the display case.",
    address: {
      street: "4 Pushkin Street",
      city: "Yerevan",
      postalCode: "0010",
    },
    contactInfo: {
      phone: "+374 10 234 567",
      email: "pickup@morningbrew.example",
    },
  },
  {
    _id: `${SEED_PREFIX}store.citymart-grocery`,
    _type: "store",
    title: "CityMart Grocery",
    slug: slug("citymart-grocery"),
    description:
      "Local grocery store listing daily surplus fruit, vegetables, and deli items.",
    address: {
      street: "88 Komitas Avenue",
      city: "Yerevan",
      postalCode: "0051",
    },
    contactInfo: {
      phone: "+374 10 345 678",
      email: "rescue@citymart.example",
    },
  },
  {
    _id: `${SEED_PREFIX}offer.surprise-pastry-box`,
    _type: "foodOffer",
    title: "Surprise Pastry Box",
    slug: slug("surprise-pastry-box"),
    description:
      "A mixed box of same-day croissants, rolls, and sweet pastries. Contents vary.",
    price: 2500,
    originalPrice: 5200,
    store: ref(`${SEED_PREFIX}store.green-loaf-bakery`),
    category: ref(`${SEED_PREFIX}category.bakery-pastry`),
    quantityAvailable: 6,
    pickupWindow: pickupWindowHoursFromNow(24, 2),
    isFeatured: true,
    publicationStatus: "published",
  },
  {
    _id: `${SEED_PREFIX}offer.coffee-pastry-duo`,
    _type: "foodOffer",
    title: "Coffee & Pastry Duo Bag",
    slug: slug("coffee-pastry-duo"),
    description:
      "Two pastries plus a voucher for a filter coffee pickup before closing time.",
    price: 1800,
    originalPrice: 3600,
    store: ref(`${SEED_PREFIX}store.morning-brew-cafe`),
    category: ref(`${SEED_PREFIX}category.cafe-coffee`),
    quantityAvailable: 4,
    pickupWindow: pickupWindowHoursFromNow(30, 2),
    isFeatured: true,
    publicationStatus: "published",
  },
  {
    _id: `${SEED_PREFIX}offer.produce-rescue-bag`,
    _type: "foodOffer",
    title: "Fresh Produce Rescue Bag",
    slug: slug("fresh-produce-rescue-bag"),
    description:
      "Seasonal fruit and vegetables rescued from today’s fresh counter. Weight approx. 2–3 kg.",
    price: 3200,
    originalPrice: 6500,
    store: ref(`${SEED_PREFIX}store.citymart-grocery`),
    category: ref(`${SEED_PREFIX}category.grocery-surplus`),
    quantityAvailable: 8,
    pickupWindow: pickupWindowHoursFromNow(36, 3),
    isFeatured: false,
    publicationStatus: "published",
  },
];

function assertEnv() {
  const missing = [];
  if (!projectId) missing.push("NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!writeToken) missing.push("SANITY_API_WRITE_TOKEN");
  if (missing.length > 0) {
    throw new Error(
      `Missing required env: ${missing.join(", ")}. Use --env-file=.env.local`,
    );
  }
}

function printPlan() {
  console.log("\nFood Rescue Marketplace — Sanity demo seed plan\n");
  console.log(`Dataset: ${dataset}`);
  console.log(
    `Documents: ${seedDocuments.length} (siteSettings id "${SITE_SETTINGS_ID}", demo prefix "${SEED_PREFIX}")`,
  );
  console.log("Images: not included (optional in schema — upload in Studio if needed)\n");

  const groups = {
    siteSettings: [],
    category: [],
    store: [],
    foodOffer: [],
  };

  for (const doc of seedDocuments) {
    groups[doc._type]?.push(doc);
  }

  for (const [type, docs] of Object.entries(groups)) {
    console.log(`--- ${type} (${docs.length}) ---`);
    for (const doc of docs) {
      const extra =
        type === "foodOffer"
          ? ` · ${doc.price} AMD (was ${doc.originalPrice} AMD) · store ${doc.store._ref} · category ${doc.category._ref}`
          : "";
      const label = doc.title ?? doc.siteTitle ?? doc._id;
      console.log(`  ${doc._id} · ${label}${extra}`);
    }
    console.log("");
  }

  console.log(
    "Existing documents with the same _id are left unchanged (no overwrite).\n",
  );
}

async function main() {
  printPlan();

  if (dryRun) {
    console.log("Dry run only — no writes performed.");
    return;
  }

  assertEnv();

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  });

  let created = 0;
  let skipped = 0;

  for (const doc of seedDocuments) {
    const existing = await client.getDocument(doc._id).catch(() => null);
    if (existing) {
      console.log(`skip  ${doc._id} (already exists)`);
      skipped += 1;
      continue;
    }

    await client.create({ ...doc, _id: doc._id });
    console.log(`create ${doc._id}`);
    created += 1;
  }

  console.log(`\nDone. Created: ${created}, skipped: ${skipped}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
