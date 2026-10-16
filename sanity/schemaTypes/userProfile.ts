import { defineField, defineType } from "sanity";

export const userRoleOptions = [
  { title: "Customer", value: "customer" },
  { title: "Seller", value: "seller" },
  { title: "Admin", value: "admin" },
] as const;

export const userProfile = defineType({
  name: "userProfile",
  title: "User profile",
  type: "document",
  fields: [
    defineField({
      name: "authId",
      title: "Auth ID",
      type: "string",
      description: "Internal key (email:…). Set during registration.",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "passwordHash",
      title: "Password hash",
      type: "string",
      description: "Bcrypt hash. Set only via site registration; do not edit manually.",
      readOnly: true,
      hidden: ({ document }) => !document?.passwordHash,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "displayName",
      title: "Display name",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [...userRoleOptions],
        layout: "radio",
      },
      initialValue: "customer",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "displayName",
      subtitle: "email",
      role: "role",
    },
    prepare({ title, subtitle, role }) {
      return {
        title: title || subtitle || "User profile",
        subtitle: role ? `${role} · ${subtitle ?? ""}` : subtitle,
      };
    },
  },
});
