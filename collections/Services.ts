import type { CollectionConfig } from "payload";
import { order } from "./fields";

/**
 * The three services: summarised three-up on the home page, then set out in full
 * on `/services`.
 *
 * `copy` is rich text rather than the `[string, string]` tuple `lib/services.ts`
 * keeps. That is the conversion §3 warns about: today's markup is one `<p>`
 * holding `copy[0]<br><br>copy[1]`, and Lexical emits two `<p>` elements, which
 * `globals.css`'s 28px paragraph margin does not render at the same height as the
 * empty line box the `<br>`s produced. `ServicePanel.module.css` calibrates the
 * gap back; see the note there for the measurement.
 */
export const Services: CollectionConfig = {
  slug: "services",

  access: { read: () => true },

  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order"],
    description: "Order is the sequence both the home grid and /services print.",
  },

  defaultSort: "order",

  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The flower glyph beside the title, drawn 69 x 55." },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The photograph above the copy on /services, 805 x 1000." },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "The one-line blurb the home page's three-up grid prints." },
    },
    {
      name: "copy",
      type: "richText",
      required: true,
      admin: { description: "The panel's prose on /services. Two paragraphs, as published." },
    },
    order,
  ],
};
