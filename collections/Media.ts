import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Every photograph, glyph and ornament on the site.
 *
 * The three image sizes are the widths the existing library already ships:
 * `<stem>-500.jpg`, `-800.jpg`, `-1080.jpg`. Reproducing them exactly is what lets
 * phase 2 swap `lib/artwork.ts` for a Payload lookup without moving a single
 * `srcSet` width descriptor.
 *
 * `withoutEnlargement` is the load-bearing option. Five images in the library
 * shipped single-source — `portfolio-briana-richard` and the three-up about rows —
 * and upscaling them into invented derivatives would hand the browser candidates
 * the original never had. It also preserves the existing invariant that no `sizes`
 * hint is emitted without a real `srcSet` to pick from.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "category"],
  },
  upload: {
    // Decision C keeps media on local disk; public/media is gitignored, so it is
    // covered by scripts/db-dump.ps1 rather than by version control.
    staticDir: path.resolve(dirname, "../public/media"),
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "w500", width: 500, withoutEnlargement: true },
      { name: "w800", width: 800, withoutEnlargement: true },
      { name: "w1080", width: 1080, withoutEnlargement: true },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      admin: {
        description:
          'Left empty for decorative art, which the components already render with alt="".',
      },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description:
          "The <figcaption> under a figure in a post body. The spec calls this unused; it is not — " +
          "the Lexical upload converter reads it.",
      },
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Photography", value: "photography" },
        { label: "Glyph", value: "glyph" },
        { label: "Ornament", value: "ornament" },
      ],
      admin: {
        description: "Lets the admin filter, and keeps the petal cut-outs out of a hero picker.",
      },
    },
  ],
};
