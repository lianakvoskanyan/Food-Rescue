import { defineField, defineType } from "sanity";

export const store = defineType({
  name: "store",
  title: "Store / venue",
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
      name: "address",
      title: "Address",
      type: "object",
      fields: [
        defineField({
          name: "street",
          title: "Street and number",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "postalCode",
          title: "Postal code",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "location",
      title: "Map coordinates",
      type: "geopoint",
      description:
        "Latitude and longitude for the storefront map. Sellers can set this in the seller dashboard.",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "isPublished",
      title: "Published on site",
      type: "boolean",
      initialValue: true,
      description:
        "When off, the store and its public page are hidden from the storefront (managed in the admin panel).",
    }),
    defineField({
      name: "sellerProfile",
      title: "Seller profile",
      type: "reference",
      to: [{ type: "userProfile" }],
      description:
        "User with the seller role who manages orders for this store's offers.",
    }),
    defineField({
      name: "contactInfo",
      title: "Contact information",
      type: "object",
      fields: [
        defineField({
          name: "phone",
          title: "Phone",
          type: "string",
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
        }),
        defineField({
          name: "website",
          title: "Website",
          type: "url",
        }),
      ],
    }),
  ],
});
