import type { Block } from "payload";

/**
 * The two-up project index on `/portfolio` — the same cards as the home grid,
 * cropped taller by CSS and captioned on a white plate.
 *
 * `showAll` is the difference between an index and a selection. `/portfolio`
 * wants every published project in collection order and wants a project added
 * next year to appear without anyone editing this page; a curated strip
 * somewhere else wants the four it names. Both are the same block.
 *
 * Banding `shared` — it is bare today, wrapped by the view.
 */
export const PortfolioList: Block = {
  slug: "portfolioList",
  interfaceName: "PortfolioListBlock",
  labels: { singular: "Portfolio list", plural: "Portfolio lists" },
  fields: [
    {
      name: "showAll",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Every published project, in collection order. Ignores the list below." },
    },
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      admin: {
        condition: (_, siblingData) => !siblingData?.showAll,
        description: "In the order they are printed.",
      },
    },
  ],
};
