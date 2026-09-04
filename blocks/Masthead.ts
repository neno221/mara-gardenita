import type { Block } from "payload";
import { eyebrow, heading, link } from "./fields";

/**
 * The band an interior page opens with: hairline, sprig, label, headline, an
 * optional lede, an optional link, hairline. Four of the seven seeded pages
 * start with one.
 *
 * Banding `none`: it brings its own `HeroSection tight`.
 */
export const Masthead: Block = {
  slug: "masthead",
  interfaceName: "MastheadBlock",
  labels: { singular: "Masthead", plural: "Mastheads" },
  fields: [
    eyebrow,
    heading,
    {
      name: "lede",
      type: "textarea",
      admin: { description: "A paragraph under the headline, where the page opens on prose." },
    },
    link("cta", "Call to action"),
  ],
};
