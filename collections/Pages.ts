import type { CollectionConfig } from "payload";
import { admins, authenticated, publishedOnly } from "../access";
import { blocks } from "../blocks";
import { revalidatePage, revalidatePageDelete } from "../hooks/revalidate";
import { previewUrl } from "../lib/preview";
import { slug } from "./fields";

/**
 * The spine of the migration: one document per URL, and a `layout` block array
 * that makes "every section visible and editable" true.
 *
 * Six documents replace the five hardcoded views: the five migrated pages, plus
 * the `contact` page decision A adds. (The plan says seven — it double-counts
 * `contact`, which spec §5's six already include. What decision A adds beyond the
 * spec is the `/portfolio/<slug>` route, which is not a Pages document.)
 * `home` resolves to `/`; everything else is reached at its slug by the
 * catch-all route.
 *
 * The `meta` group is `plugin-seo`'s, added in `payload.config.ts`. Phase 4 hand
 * rolled a two-field version of it under the same names so the seeded titles had
 * somewhere to live; the swap in phase 5 was a config edit and the data did not
 * move, because Postgres held `meta_title` and `meta_description` either way.
 */
export const Pages: CollectionConfig = {
  slug: "pages",

  // Decision F: an editor writes but cannot delete a Page. `publishedOnly`
  // filters drafts out of the API for anonymous callers; the render path is
  // closed separately in lib/payload.ts, for the reason access/index.ts gives.
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },

  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageDelete],
  },

  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    description: "One document per URL. `home` is the front page.",

    // The three widths the fingerprint captures at, plus the tablet step, so an
    // editor checking a layout is looking at the same viewports the gate does.
    livePreview: {
      url: ({ data }) => previewUrl({ collection: "pages", slug: data?.slug }),
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 812 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },

    preview: ({ slug }) => previewUrl({ collection: "pages", slug: slug as string }),
  },

  versions: { drafts: true, maxPerDoc: 20 },

  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slug,
    {
      name: "layout",
      type: "blocks",
      required: true,
      // The whole page is written once per language, so the Greek layout may
      // order and pick blocks differently from the English one.
      localized: true,
      minRows: 1,
      blocks,
      admin: { description: "The page, in order. Drag to rearrange." },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
  ],
};
