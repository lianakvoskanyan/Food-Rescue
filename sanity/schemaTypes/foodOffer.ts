import { defineField, defineType } from "sanity";

export const publicationStatusOptions = [
  { title: "Draft", value: "draft" },
  { title: "Published", value: "published" },
  { title: "Sold out", value: "soldOut" },
  { title: "Expired", value: "expired" },
] as const;

export const foodOffer = defineType({
  name: "foodOffer",
  title: "Offer (bundle)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "originalPrice",
      title: "Original price",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "store",
      title: "Store",
      type: "reference",
      to: [{ type: "store" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quantityAvailable",
      title: "Bundles available",
      type: "number",
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "reservationDeadline",
      title: "Reservation deadline",
      type: "datetime",
      description:
        "Last moment customers can book. If empty, pickup window end is used.",
    }),
    defineField({
      name: "pickupWindow",
      title: "Pickup window",
      type: "object",
      fields: [
        defineField({
          name: "start",
          title: "Start",
          type: "datetime",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "end",
          title: "End",
          type: "datetime",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isFeatured",
      title: "Featured offer",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publicationStatus",
      title: "Publication status",
      type: "string",
      options: {
        list: [...publicationStatusOptions],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
  ],
});
