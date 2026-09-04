import type { Block } from "payload";

/**
 * The journal index: photograph left, a white plate carrying the date, headline
 * and excerpt overlapping its right edge.
 *
 * `mode` separates the two things a list of posts can mean. `latest` is a feed —
 * `/blog` wants whatever has been published, in collection order, without anyone
 * editing the page. `picked` is a selection, for a page that names three posts
 * on purpose.
 *
 * "Collection order" and not date order: `collections/fields.ts` explains why the
 * journal is the case that proves the `order` field earns its keep — the four
 * posts are dated 7, 7, 13, 7 August, so sorting by date puts the third first.
 *
 * Banding `shared` — it is bare today, wrapped by the view.
 */
export const JournalList: Block = {
  slug: "journalList",
  interfaceName: "JournalListBlock",
  labels: { singular: "Journal list", plural: "Journal lists" },
  fields: [
    {
      name: "mode",
      type: "select",
      required: true,
      defaultValue: "latest",
      options: [
        { label: "Latest — every published post, in collection order", value: "latest" },
        { label: "Picked — the posts named below", value: "picked" },
      ],
    },
    {
      name: "limit",
      type: "number",
      min: 1,
      admin: {
        condition: (_, siblingData) => siblingData?.mode !== "picked",
        description: "How many to print. Empty prints them all.",
      },
    },
    {
      name: "posts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.mode === "picked",
        description: "In the order they are printed.",
      },
    },
  ],
};
