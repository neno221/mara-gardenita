import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSiteWide, revalidateSiteWideDelete } from "../hooks/revalidate";
import { order } from "./fields";

/**
 * The three services: summarised three-up on the home page, then set out in full
 * on `/services`.
 *
 * `copy` is rich text rather than the `[string, string]` tuple the hardcoded
 * `lib/services.ts` kept. That is the conversion §3 warns about: the published markup
 * was one `<p>` holding `copy[0]<br><br>copy[1]`, and Lexical emits two `<p>` elements, which
 * `globals.css`'s 28px paragraph margin does not render at the same height as the
 * empty line box the `<br>`s produced. `ServicePanel.module.css` calibrates the
 * gap back; see the note there for the measurement.
 */
export const Services: CollectionConfig = {
  slug: "services",

  // No drafts here, so there is nothing to filter — every document is live the
  // moment it is saved. These three render inside someone else's page, which is
  // why the hooks revalidate the whole tree rather than a path.
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  hooks: {
    afterChange: [revalidateSiteWide],
    afterDelete: [revalidateSiteWideDelete],
  },

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
