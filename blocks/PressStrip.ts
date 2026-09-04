import type { Block } from "payload";

/**
 * The row of publication logos on the about page: a hairline with a label
 * sitting on it, and the logos beneath, divided by vertical rules.
 *
 * **An array of any length is what breaks the published CSS.** The dividers were
 * written by ordinal — `.press1` … `.press5`, restated at three breakpoints,
 * because the grid goes 6-up, 3-up, 2-up and whichever logo opens a row drops
 * its left rule. Six logos was not a default; it was the arithmetic. Phase 4
 * rewrites those rules as `:nth-child` expressions keyed to the column count at
 * each breakpoint (`components/PressStrip.module.css`), so the strip is correct
 * for any number of logos — which is what makes this field an array rather than
 * six slots.
 *
 * Banding `shared`.
 */
export const PressStrip: Block = {
  slug: "pressStrip",
  interfaceName: "PressStripBlock",
  labels: { singular: "Press strip", plural: "Press strips" },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      defaultValue: "Featured in",
      admin: { description: "Sits on the rule, punching a gap in it." },
    },
    {
      name: "logos",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Logo", plural: "Logos" },
      fields: [
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "name",
          type: "text",
          required: true,
          admin: {
            description:
              "The publication. Used as the admin label — the logos render decoratively, " +
              'with alt="", exactly as published.',
          },
        },
      ],
    },
  ],
};
