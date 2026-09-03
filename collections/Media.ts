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
 * `withoutEnlargement` is the load-bearing option: upscaling a narrow original into
 * an invented derivative would hand the browser a candidate the source never had.
 *
 * It is not, however, enough to preserve the single-source photographs. Phase 2
 * measured that: **ten** images shipped bare, and seven of them are wide enough that
 * Payload generates a real derivative anyway (`portfolio-briana-richard` at 628w is
 * the same size as the three siblings that *did* ship a 500). Whether an image is
 * single-source is a fact about the old export, not about the pixels — so the
 * invariant lives in `lib/media.ts`, where the caller's `sizes` hint decides, and
 * `withoutEnlargement` only guarantees no derivative exceeds its source.
 */
export const Media: CollectionConfig = {
  slug: "media",

  // Payload's default access is `({ req: { user } }) => Boolean(user)` — logged-in
  // only, for every operation. Left at the default, `/api/media/file/<name>` answers
  // 403 to anyone not signed in, so every photograph on the public site breaks while
  // the admin panel looks perfectly healthy. Server components render fine either
  // way, because the Local API overrides access: the markup is right and the images
  // are missing.
  //
  // This is not the decision-F role work, which is about who may *write*. A public
  // site's photographs are public; that is a fact about the collection, not a policy
  // choice waiting on phase 5.
  access: { read: () => true },

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
