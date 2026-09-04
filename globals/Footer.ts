import type { GlobalConfig } from "payload";
import { admins, anyone } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";
import { linkFields } from "../blocks/fields";

/**
 * The band that closes every page: the Instagram feed, two columns of links,
 * the wordmark and a credit.
 *
 * The Instagram tiles are **not** fields here. They come from the Instagram
 * collection, which is what lets the same six tiles appear in the footer and in
 * an `instagramFeed` block on a page without either one owning them (spec §9).
 * The heading above them is a field, because it is a string someone might want
 * to change.
 *
 * The quick links are where [decision G](../docs/payload-plan.md) lands. The
 * three `/template-info/*` destinations do not exist on this site and never did;
 * they are seeded through `externalUrl`, the escape hatch, so they render
 * exactly as published and dropping them is an edit in the admin rather than a
 * code change. The `#` credit link is the same story with one link.
 */
export const Footer: GlobalConfig = {
  slug: "footer",

  // Decision F: editors may not touch the globals. One mistyped nav entry is
  // wrong on every page at once, which is a different blast radius from any
  // single document.
  access: { read: anyone, update: admins },

  hooks: { afterChange: [revalidateGlobal] },

  admin: { description: "The closing band on every page." },

  fields: [
    {
      name: "instagramHeading",
      type: "text",
      required: true,
      defaultValue: "Instagram",
      admin: { description: "Above the feed. The tiles themselves are the Instagram collection." },
    },
    {
      name: "socialHeading",
      type: "text",
      required: true,
      defaultValue: "Social",
      admin: { width: "50%" },
    },
    {
      name: "social",
      type: "array",
      labels: { singular: "Social link", plural: "Social links" },
      admin: { description: "Off-site, so each opens in a new tab." },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "quickLinksHeading",
      type: "text",
      required: true,
      defaultValue: "Quick Links",
      admin: { width: "50%" },
    },
    {
      name: "quickLinks",
      type: "array",
      labels: { singular: "Quick link", plural: "Quick links" },
      fields: linkFields,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The wordmark above the credit, drawn 100px wide." },
    },
    {
      name: "credit",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "url", type: "text" },
      ],
    },
  ],
};
