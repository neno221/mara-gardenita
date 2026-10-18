import type { Block } from "payload";

/**
 * The studio's contact details: a label above each value, one per row.
 *
 * Generic on purpose. An email, a phone number, an address and the opening hours
 * are all "a label and some lines", and a `href` turns a row into a `mailto:` or
 * `tel:` link. Hours and addresses run to several lines, so `value` is a
 * textarea and a new line is a line break.
 *
 * Banding `shared`: it sits in the body band under a masthead.
 */
export const ContactDetails: Block = {
  slug: "contactDetails",
  interfaceName: "ContactDetailsBlock",
  labels: { singular: "Contact details", plural: "Contact details" },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Detail", plural: "Details" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "textarea", required: true },
        {
          name: "href",
          type: "text",
          admin: { description: "Makes the value a link, e.g. mailto:… or tel:…" },
        },
      ],
    },
  ],
};
