import type { Block } from "payload";
import { link } from "./fields";

/**
 * The three-up services summary: a glyph, a title, a blurb and a link per card.
 *
 * The services are picked rather than queried. Three documents in a chosen order
 * is what the home page shows, and a `hasMany` relationship stores that order —
 * so adding a fourth service does not silently rearrange the home page.
 *
 * The spec names the link fields `ctaLabel` and `ctaPage`. They are the shared
 * `cta` group here instead, so the label/page/externalUrl triple and its
 * validation exist once rather than five times. Same information, one shape.
 * Note it is *per card*: the same destination is printed on every title and on
 * every "learn more" beneath it, which is what `SERVICES_HREF` did as a const.
 *
 * Banding `own`.
 */
export const ServiceGrid: Block = {
  slug: "serviceGrid",
  interfaceName: "ServiceGridBlock",
  labels: { singular: "Service grid", plural: "Service grids" },
  fields: [
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      required: true,
      admin: { description: "In the order they are printed." },
    },
    link("cta", "Link on every card"),
  ],
};
