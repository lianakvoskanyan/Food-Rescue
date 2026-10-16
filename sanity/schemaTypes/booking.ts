import { defineField, defineType } from "sanity";

export const bookingStatusOptions = [
  { title: "Pending", value: "pending" },
  { title: "Confirmed", value: "confirmed" },
  { title: "Cancelled", value: "cancelled" },
  { title: "Completed", value: "completed" },
] as const;

export const booking = defineType({
  name: "booking",
  title: "Booking",
  type: "document",
  fields: [
    defineField({
      name: "bookingNumber",
      title: "Booking number",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "offer",
      title: "Offer",
      type: "reference",
      to: [{ type: "foodOffer" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "buyer",
      title: "Buyer",
      type: "reference",
      to: [{ type: "userProfile" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quantity",
      title: "Number of bundles",
      type: "number",
      validation: (rule) => rule.required().min(1).integer(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [...bookingStatusOptions],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      bookingNumber: "bookingNumber",
      quantity: "quantity",
      status: "status",
      offerTitle: "offer.title",
      buyerEmail: "buyer.email",
    },
    prepare({ bookingNumber, quantity, status, offerTitle, buyerEmail }) {
      return {
        title: bookingNumber || "Booking",
        subtitle: [offerTitle, buyerEmail, status, quantity ? `×${quantity}` : null]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
