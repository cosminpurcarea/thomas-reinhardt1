import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "priceType",
      type: "string",
      options: {
        list: [
          { title: "Free", value: "free" },
          { title: "Paid", value: "paid" },
        ],
      },
      initialValue: "free",
    }),
    defineField({
      name: "newsletterRequired",
      type: "boolean",
      title: "Newsletter / marketing tag",
      description:
        "Internal flag for campaigns only. It does not block downloads—only a signed-in account is required to download.",
      initialValue: false,
    }),
    defineField({
      name: "published",
      type: "boolean",
      title: "Published on site",
      description:
        "When off, the product is hidden from Free Downloads and product pages.",
      initialValue: true,
    }),
    defineField({
      name: "listingImage",
      type: "image",
      title: "Homepage thumbnail",
      description:
        "Square image (1:1) shown on the main page for the latest download. Use at least 800×800px for best results.",
      options: {
        accept: "image/png,image/jpeg,image/webp",
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Short description for screen readers (optional).",
        }),
      ],
    }),
    defineField({
      name: "downloads",
      type: "array",
      of: [
        {
          type: "object",
          name: "downloadItem",
          fields: [
            defineField({
              name: "downloadId",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "filename",
              type: "string",
            }),
            defineField({
              name: "downloadCount",
              type: "number",
              title: "Download count",
              description: "Incremented automatically when a user downloads this file.",
              initialValue: 0,
              validation: (Rule) => Rule.min(0).integer(),
            }),
            defineField({
              name: "file",
              type: "file",
              options: {
                accept:
                  "application/pdf,application/zip,application/octet-stream",
              },
            }),
          ],
        },
      ],
    }),
  ],
});

