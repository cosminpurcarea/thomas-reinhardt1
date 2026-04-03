import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article",
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
      name: "summary",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "publishDate",
      type: "datetime",
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

