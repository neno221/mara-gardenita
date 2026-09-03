import type { CollectionConfig } from "payload";
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

  access: { read: () => true },

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
