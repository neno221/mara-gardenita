import type { CollectionConfig } from "payload";
import { authenticated, publishedOnly } from "../access";
import { revalidatePost, revalidatePostDelete } from "../hooks/revalidate";
import { previewUrl } from "../lib/preview";
import { order, slug } from "./fields";

/**
 * The journal: four entries on `/blog`, each with a page at `/post/<slug>`.
 *
 * **One date, not two.** `lib/journal.ts` carried a `date` ("August 7, 2021")
 * and a `published` ("2021-08-07") side by side — the printed form and the
 * `<time datetime>` form of the same fact, kept in sync by hand. They collapse
 * into one timestamp here and `JournalCard` formats it at render, which is the
 * only way an editor can change a publication date without the two drifting.
 *
 * **One body, planted four times** (§1.3). `JournalPost.tsx` renders a single
 * hardcoded lorem body for all four posts, so the seed converts that body to
 * Lexical once and writes it to every post. They are four documents from here
 * on, so a writer editing one no longer edits all of them — which is the point,
 * and also the deferred cost decision B accepted.
 */
export const Posts: CollectionConfig = {
  slug: "posts",

  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  hooks: {
    afterChange: [revalidatePost],
    afterDelete: [revalidatePostDelete],
  },

  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "published", "order"],
    description: "Journal entries. Order is the sequence /blog prints, which is not date order.",

    // The three widths the fingerprint captures at, plus the tablet step, so an
    // editor checking a layout is looking at the same viewports the gate does.
    livePreview: {
      url: ({ data }) => previewUrl({ collection: "posts", slug: data?.slug }),
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 812 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },

    preview: ({ slug }) => previewUrl({ collection: "posts", slug: slug as string }),
  },

  defaultSort: "order",

  versions: { drafts: true, maxPerDoc: 20 },

  fields: [
    { name: "title", type: "text", required: true },
    slug,
    {
      name: "published",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "MMMM d, yyyy" },
        description: "Printed as the eyebrow and emitted as <time datetime>. One field, two forms.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      admin: { description: "The index card's blurb, and the page's meta description." },
    },
    {
      name: "card",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The /blog index crop, 735 x 647." },
    },
    {
      name: "hero",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The full-bleed plate at the top of the post, 1372 x 855." },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      admin: {
        description:
          "Paragraphs, h3, blockquote, lists and figures. globals.css already styles all of " +
          "those as bare elements, so the output inherits the site's typography.",
      },
    },
    order,
  ],
};
