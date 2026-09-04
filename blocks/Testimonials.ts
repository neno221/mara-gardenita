import type { Block } from "payload";
import { eyebrow, heading } from "./fields";

/**
 * The cross-fading quote carousel, on the home and about pages — the block the
 * spec's own table uses to show that reuse works.
 *
 * No CTA: the published band has none.
 *
 * Banding `own`.
 */
export const Testimonials: Block = {
  slug: "testimonials",
  interfaceName: "TestimonialsBlock",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [
    eyebrow,
    heading,
    {
      name: "quotes",
      type: "relationship",
      relationTo: "testimonials",
      hasMany: true,
      required: true,
      admin: { description: "The carousel's order." },
    },
  ],
};
