import type { Block } from "payload";
import { eyebrow, heading, link } from "./fields";

/**
 * The home page's opening band: the masthead, and the collage of three
 * photographs that drifts apart as the page scrolls past.
 *
 * The three plates were wired through Payload in phase 2 by *filename*, because
 * there was nothing yet to hold a relationship. These fields are what
 * `lib/payload.ts`'s `mediaByFilename` was standing in for, and it goes with the
 * view that used it.
 *
 * The petals are not fields. They are ornament rather than content — the same
 * two cut-outs on every hero the template ships — and an editor who swaps them
 * is changing the drawing, not the page.
 *
 * Banding `none`: it brings its own `HeroSection`.
 */
export const Hero: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    eyebrow,
    heading,
    {
      name: "lede",
      type: "textarea",
      admin: { description: "A paragraph under the headline." },
    },
    link("cta", "Call to action"),
    {
      type: "row",
      fields: [
        {
          name: "collageLeft",
          type: "upload",
          relationTo: "media",
          required: true,
          admin: { width: "33%", description: "Hangs left, tilted." },
        },
        {
          name: "collageCenter",
          type: "upload",
          relationTo: "media",
          required: true,
          admin: { width: "33%", description: "The taller plate in the middle." },
        },
        {
          name: "collageRight",
          type: "upload",
          relationTo: "media",
          required: true,
          admin: { width: "33%", description: "Hangs right, tilted the other way." },
        },
      ],
    },
  ],
};
