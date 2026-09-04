import type { Block } from "payload";

/**
 * A run of rich text, centred in a 720px column under an optional ornament and
 * heading.
 *
 * Pulled forward into phase 3 because Projects needs a `body` and Payload
 * refuses a `blocks` field with an empty block list; phase 4 adds the two fields
 * the about page's prose runs actually carry. `content` keeps its name — it is
 * already a column in the database and a rename would be a migration bought with
 * nothing.
 *
 * `ornament` is a checkbox, not an upload. It is the same leaves drawing above
 * every prose run the template ships, the same way the sprig and the petals are
 * the same everywhere — ornament, not content.
 *
 * Banding `shared`. The paragraph calibration §3 asks for is in
 * `components/Prose.module.css`, measured, like the service panel's, off the
 * phase-0 baseline.
 */
export const Prose: Block = {
  slug: "prose",
  interfaceName: "ProseBlock",
  labels: { singular: "Prose", plural: "Prose" },
  fields: [
    {
      name: "ornament",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "The leaves drawing above the heading." },
    },
    {
      name: "heading",
      type: "text",
      admin: { description: "Optional. Set as an h3." },
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
  ],
};
