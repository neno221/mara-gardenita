import type { CollectionConfig } from "payload";

/**
 * The six tiles in the footer's feed.
 *
 * Sorted on `addedAt` rather than the `order` field the other four collections
 * carry: a feed is chronological by nature, and the seed backdates the six
 * entries a day apart so `-addedAt` reproduces the published `instagram-1` …
 * `instagram-6` sequence (docs/payload-plan.md, phase 3 step 6).
 *
 * **Decision H is an assumption, not source data.** Every tile on the published
 * site links to bare `instagram.com` and carries `alt=""`, so there is no post
 * URL and no caption to import. `postUrl` is required and validated because a
 * tile that links nowhere is a bug worth catching at the point of entry; the
 * seed fills it with the profile URL, which is what the site does today.
 * `caption` stays optional and empty, and phase 4's `InstagramFeed` gives the
 * link an accessible name whether or not one is set.
 */
export const Instagram: CollectionConfig = {
  slug: "instagram",

  access: { read: () => true },

  admin: {
    useAsTitle: "postUrl",
    defaultColumns: ["image", "addedAt", "postUrl"],
    description: "Newest first. The footer prints the six most recent.",
  },

  defaultSort: "-addedAt",

  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      name: "postUrl",
      type: "text",
      required: true,
      validate: (value: null | string | undefined) => {
        if (!value) return "Required.";
        try {
          const { protocol } = new URL(value);
          return protocol === "https:" || protocol === "http:" ? true : "Must be an http(s) URL.";
        } catch {
          return "Must be an absolute URL.";
        }
      },
      admin: { description: "The post on Instagram. Defaults to the profile, as published." },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description:
          "The link's accessible name. Empty on every seeded tile — the template shipped none.",
      },
    },
    {
      name: "addedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      index: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Sorts the feed. Newest first.",
      },
    },
  ],
};
