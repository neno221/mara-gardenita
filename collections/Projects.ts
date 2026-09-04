import type { CollectionConfig } from "payload";
import { authenticated, publishedOnly } from "../access";
import { PhotoRow } from "../blocks/PhotoRow";
import { Prose } from "../blocks/Prose";
import { revalidateProject, revalidateProjectDelete } from "../hooks/revalidate";
import { previewUrl } from "../lib/preview";
import { order, slug } from "./fields";

/**
 * The four case studies behind `/portfolio` and the home page's four-up grid.
 *
 * **One photograph, not two** (docs/payload-plan.md §1.2, decision D). The spec
 * asked for a `gridImage` and a `featureImage`; the code uses the same file for
 * both, and the taller `/portfolio` crop comes from `PortfolioCard`'s
 * `styles.imageTall`, not from a second export. A second upload would mean
 * cropping four new images, which guarantees the phase-3 diff fails. The `sizes`
 * hint is supplied by whichever grid renders the card — `SIZES.portfolioGrid`
 * four-up, `SIZES.portfolioList` two-up — which is what `withSizes()` does today,
 * moved up a layer.
 */
export const Projects: CollectionConfig = {
  slug: "projects",

  // Decision F: an editor may write and delete a case study — only Pages are
  // protected from deletion, because a deleted Page takes a URL with it.
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  hooks: {
    afterChange: [revalidateProject],
    afterDelete: [revalidateProjectDelete],
  },

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "order"],
    description: "The case studies. Order is the sequence both portfolio grids print.",

    // The three widths the fingerprint captures at, plus the tablet step, so an
    // editor checking a layout is looking at the same viewports the gate does.
    livePreview: {
      url: ({ data }) => previewUrl({ collection: "projects", slug: data?.slug }),
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 812 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },

    preview: ({ slug }) => previewUrl({ collection: "projects", slug: slug as string }),
  },

  defaultSort: "order",

  versions: { drafts: true, maxPerDoc: 20 },

  fields: [
    { name: "name", type: "text", required: true },
    slug,
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "One photograph, cropped taller by CSS on /portfolio. Decision D: there is no second crop.",
      },
    },
    {
      name: "body",
      type: "blocks",
      // Two of the thirteen, both banded `shared`, so a write-up coalesces into
      // one band the way the about page's six bodies do. Not the whole library:
      // a project page has no use for a masthead it already has, or for an index
      // of every other project.
      blocks: [Prose, PhotoRow],
      admin: {
        description:
          "The detail page. Empty on all four seeded projects — the template shipped no copy " +
          "for it, and decision B forbids inventing any.",
      },
    },
    order,
  ],
};
