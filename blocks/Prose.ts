import type { Block } from "payload";

/**
 * A run of rich text.
 *
 * The first block of the phase-4 library, pulled forward because phase 3 gives
 * Projects a `body` (docs/payload-plan.md, decision A) and Payload refuses a
 * `blocks` field with an empty block list. The other twelve land in phase 4
 * alongside `RenderBlocks`; this one is already exactly what the about page's
 * prose runs and a project write-up both need, so it is not a placeholder.
 *
 * Its banding is `shared` under §2's rule — adjacent prose and photo rows
 * coalesce into one `<Section>` — but nothing reads that yet, so the declaration
 * waits for the component that acts on it.
 */
export const Prose: Block = {
  slug: "prose",
  interfaceName: "ProseBlock",
  labels: { singular: "Prose", plural: "Prose" },
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
    },
  ],
};
