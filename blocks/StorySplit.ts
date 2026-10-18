import type { Block } from "payload";
import { heading, link } from "./fields";

/**
 * A photograph on one side, a short run of copy and a button on the other.
 *
 * The home page carries two, mirrored — which is the reuse the spec's block
 * table points at: one config, two documents' worth of content, opposite
 * `side` values.
 *
 * `copy` is a textarea rather than rich text. The published markup is a single
 * `<p class="paragraph">`, and rich text here would buy an editor the ability to
 * add a second paragraph in exchange for the calibration §3 describes — a cost
 * with no caller asking for it. The prose block exists for prose.
 *
 * Banding `own`.
 */
export const StorySplit: Block = {
  slug: "storySplit",
  interfaceName: "StorySplitBlock",
  labels: { singular: "Story split", plural: "Story splits" },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      admin: { description: "The uppercase label above the headline. Optional." },
    },
    heading,
    {
      name: "copy",
      type: "textarea",
      required: true,
      admin: { description: "A new line starts a new paragraph." },
    },
    {
      name: "signature",
      type: "text",
      admin: { description: "A closing line under the copy, such as a name and role." },
    },
    link("cta", "Button"),
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "side",
          type: "select",
          required: true,
          defaultValue: "left",
          options: [
            { label: "Photograph left", value: "left" },
            { label: "Photograph right", value: "right" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "petals",
          type: "select",
          required: true,
          defaultValue: "tall",
          options: [
            { label: "Tall — hangs off the lower left", value: "tall" },
            { label: "Wide — tucks into the lower right", value: "wide" },
          ],
          admin: { width: "50%", description: "Which cut-out drifts behind the frame." },
        },
      ],
    },
  ],
};
