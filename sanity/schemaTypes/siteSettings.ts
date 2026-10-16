import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Brand name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "siteTagline",
      title: "Brand tagline",
      type: "string",
    }),
    defineField({
      name: "headerLinks",
      title: "Header links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL (e.g. /#offers)",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        }),
      ],
    }),
    defineField({
      name: "loginLabel",
      title: "Sign-in button label",
      type: "string",
      description: "Shown only together with the sign-in URL",
    }),
    defineField({
      name: "loginHref",
      title: "Sign-in URL",
      type: "string",
      description: "Leave empty until auth is implemented",
    }),
    defineField({
      name: "heroBadge",
      title: "Hero badge",
      type: "string",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "searchPlaceholder",
      title: "Search placeholder",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroCtaLabel",
      title: "Hero CTA label",
      type: "string",
    }),
    defineField({
      name: "heroCtaHref",
      title: "Hero CTA link",
      type: "string",
      description: "For example /#offers",
    }),
    defineField({
      name: "popularSectionTitle",
      title: "Popular offers section title",
      type: "string",
    }),
    defineField({
      name: "popularSectionDescription",
      title: "Popular offers section description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "storesSectionTitle",
      title: "Stores section title",
      type: "string",
    }),
    defineField({
      name: "storesSectionDescription",
      title: "Stores section description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "categoriesSectionTitle",
      title: "Categories section title",
      type: "string",
    }),
    defineField({
      name: "categoriesSectionDescription",
      title: "Categories section description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "offersSectionTitle",
      title: "Offers catalog section title",
      type: "string",
    }),
    defineField({
      name: "offersSectionDescription",
      title: "Offers catalog section description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "benefitsSectionTitle",
      title: "Benefits section title",
      type: "string",
    }),
    defineField({
      name: "benefits",
      title: "Service benefits",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        }),
      ],
    }),
    defineField({
      name: "footerDescription",
      title: "Footer text",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "footerCopyright",
      title: "Copyright",
      type: "string",
    }),
    defineField({
      name: "footerLinks",
      title: "Footer links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
  ],
});
