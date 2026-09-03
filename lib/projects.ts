/** The four case studies, in the order the template lists them. */
export const PROJECTS = [
  { name: "Jennifer & Oliver", slug: "jennifer-oliver" },
  { name: "Briana & Richard", slug: "briana-richard" },
  { name: "Anne & Cameron", slug: "anne-cameron" },
  { name: "Linda & Charles", slug: "linda-charles" },
] as const satisfies readonly { name: string; slug: string }[];

export type PortfolioProject = (typeof PROJECTS)[number];

/** Keys the artwork maps, so a lookup cannot miss. */
export type ProjectSlug = PortfolioProject["slug"];
