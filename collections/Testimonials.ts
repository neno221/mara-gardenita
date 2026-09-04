import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSiteWide, revalidateSiteWideDelete } from "../hooks/revalidate";
import { order } from "./fields";

/**
 * The three quotes the carousel cross-fades between, on the home and about pages.
 *
 * The quotation marks are **not** stored. `Testimonials.tsx` keeps them as typed
 * curly quotes inside each string; the seed strips them and the component prints
 * them, so an editor cannot paste a quote that renders with two opening marks or
 * none. The stored text is what was said; the punctuation is how it is set.
 *
 * The portraits are the petal cut-outs, exactly as today — ornament standing in
 * for a photograph nobody has.
 */
export const Testimonials: CollectionConfig = {
  slug: "testimonials",

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
    useAsTitle: "signature",
    defaultColumns: ["signature", "order"],
    description: "Order is the carousel's sequence.",
  },

  defaultSort: "order",

  fields: [
    {
      name: "quote",
      type: "textarea",
      required: true,
      admin: { description: "Without quotation marks — the component sets those." },
    },
    { name: "signature", type: "text", required: true },
    {
      name: "portrait",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "A petal cut-out, as published." },
    },
    order,
  ],
};
