import type { GlobalConfig } from "payload";
import { linkFields } from "../blocks/fields";

/**
 * The bar on every page: two links, the wordmark, two links.
 *
 * The nav was four `SiteLink`s written into `SiteHeader.tsx`, which made adding
 * a menu entry a code change. It is an array now, split around the wordmark at
 * its midpoint — `Math.ceil(n / 2)` leading, the rest trailing — so five entries
 * put three on the left rather than refusing to render.
 *
 * Access is read-open and write-authenticated. Decision F would restrict the
 * globals to admins, but the role functions are phase 5's and this is not the
 * phase to invent half of them.
 */
export const Header: GlobalConfig = {
  slug: "header",

  access: { read: () => true },

  admin: { description: "The navigation on every page." },

  fields: [
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The wordmark, drawn 124 x 44." },
    },
    {
      name: "nav",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Link", plural: "Links" },
      admin: { description: "Split around the wordmark: the first half left, the rest right." },
      fields: linkFields,
    },
  ],
};
