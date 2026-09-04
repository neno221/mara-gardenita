import type { GlobalConfig } from "payload";
import { admins, anyone } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";
import { linkFields } from "../blocks/fields";

/**
 * The bar on every page: two links, the wordmark, two links.
 *
 * The nav was four `SiteLink`s written into `SiteHeader.tsx`, which made adding
 * a menu entry a code change. It is an array now, split around the wordmark at
 * its midpoint — `Math.ceil(n / 2)` leading, the rest trailing — so five entries
 * put three on the left rather than refusing to render.
 *
 * Read-open, admin-only to write — decision F, settled in phase 5.
 */
export const Header: GlobalConfig = {
  slug: "header",

  // Decision F: editors may not touch the globals. One mistyped nav entry is
  // wrong on every page at once, which is a different blast radius from any
  // single document.
  access: { read: anyone, update: admins },

  hooks: { afterChange: [revalidateGlobal] },

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
