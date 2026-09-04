import type { CollectionConfig } from "payload";
import { blocks } from "../blocks";
import { slug } from "./fields";

/**
 * The spine of the migration: one document per URL, and a `layout` block array
 * that makes "every section visible and editable" true.
 *
 * Seven documents replace the five hardcoded views — the five migrated pages,
 * plus `contact` and the `/portfolio/<slug>` route decision A puts in scope.
 * `home` resolves to `/`; everything else is reached at its slug by the
 * catch-all route.
 *
 * **`meta` is a hand-rolled group, and phase 5 replaces it with the plugin's.**
 * `document.title` is in the fingerprint, so the five migrated pages have to
 * keep the titles their route files declared — which needs somewhere to store
 * them now, a phase before `plugin-seo` lands. The field paths are the ones the
 * plugin uses, so Postgres sees `meta_title` and `meta_description` either way
 * and the swap is a config edit, not a data migration.
 */
export const Pages: CollectionConfig = {
  slug: "pages",

  // A public site's pages are public. Draft filtering is a `where` at the call
  // site until phase 5 moves it into read access, exactly as on Posts and
  // Projects — see the note on `PUBLISHED` in lib/payload.ts.
  access: { read: () => true },

  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    description: "One document per URL. `home` is the front page.",
  },

  versions: { drafts: true, maxPerDoc: 20 },

  fields: [
    { name: "title", type: "text", required: true },
    slug,
    {
      name: "layout",
      type: "blocks",
      required: true,
      minRows: 1,
      blocks,
      admin: { description: "The page, in order. Drag to rearrange." },
    },
    {
      name: "meta",
      type: "group",
      label: "SEO",
      fields: [
        {
          name: "title",
          type: "text",
          admin: {
            description: "The browser tab and the share card. Falls back to the site default.",
          },
        },
        {
          name: "description",
          type: "textarea",
          admin: { description: "The search result's second line, and the share card's." },
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
  ],
};
