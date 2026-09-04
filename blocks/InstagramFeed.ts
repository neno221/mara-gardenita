import type { Block } from "payload";

/**
 * The scattered grid of Instagram tiles, every other one hanging lower.
 *
 * The content is the Instagram collection, not fields here — that is the rule
 * §9 gives the widget, and it is why the footer and a page can both print the
 * feed without either one owning it.
 *
 * The spec gives this block no fields at all. Two are declared anyway: a block
 * that renders six tiles ought to say six, and a heading an editor cannot change
 * is exactly the hardcoded string the migration exists to retire. Neither is
 * content — both are how much of the feed to show and what to call it.
 *
 * Banding `own`.
 */
export const InstagramFeed: Block = {
  slug: "instagramFeed",
  interfaceName: "InstagramFeedBlock",
  labels: { singular: "Instagram feed", plural: "Instagram feeds" },
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
      defaultValue: "Instagram",
    },
    {
      name: "limit",
      type: "number",
      required: true,
      defaultValue: 6,
      min: 1,
      admin: { description: "How many tiles, newest first." },
    },
  ],
};
