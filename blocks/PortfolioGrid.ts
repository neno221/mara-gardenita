import type { Block } from "payload";
import { eyebrow, heading, link } from "./fields";

/**
 * The four-up project grid, with a heading above it and one button below.
 *
 * `SIZES.portfolioGrid` is supplied by this block rather than by the Project,
 * which is decision D's whole point: one photograph per project, and whichever
 * grid renders it names the slot width.
 *
 * Banding `own`.
 */
export const PortfolioGrid: Block = {
  slug: "portfolioGrid",
  interfaceName: "PortfolioGridBlock",
  labels: { singular: "Portfolio grid", plural: "Portfolio grids" },
  fields: [
    eyebrow,
    heading,
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      required: true,
      admin: { description: "In the order they are printed." },
    },
    link("cta", "Button"),
  ],
};
