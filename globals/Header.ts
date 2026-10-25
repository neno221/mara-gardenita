import type { GlobalConfig } from "payload";
import { admins, anyone } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";
import { linkFields } from "../blocks/fields";

/**
 * The bar on every page: the wordmark, the links, then one outlined button.
 *
 * The nav was four `SiteLink`s written into `SiteHeader.tsx`, which made adding
 * a menu entry a code change. It is an array now, read left to right after the
 * wordmark, and the button that closes the bar is its own field — it is drawn
 * differently and always comes last, so it is not a row someone could drag into
 * the middle of the links.
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
      admin: { description: "Left to right, after the wordmark." },
      fields: linkFields,
    },
    {
      name: "cta",
      type: "group",
      label: "Button",
      admin: { description: "The outlined button at the end of the bar. Leave the label empty to omit it." },
      fields: linkFields,
    },
  ],
};
