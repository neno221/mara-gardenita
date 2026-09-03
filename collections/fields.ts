import type { Field } from "payload";

/**
 * The hand-ordered position of a document in its list.
 *
 * Four of the five phase-3 collections render as a fixed sequence — the three
 * services, the four projects, the three testimonials, the four journal cards —
 * and none of those sequences is derivable from the content. The journal is the
 * case that proves it: `lib/journal.ts` lists the posts 7 Aug, 7 Aug, 13 Aug,
 * 7 Aug, so sorting by date puts the third post first and the `/blog`
 * fingerprint fails. The published order is a decision someone made, so it is
 * stored as one.
 *
 * Payload has an `orderable: true` collection flag that does this with drag and
 * drop, but it is marked experimental with "frequent breaking changes", and
 * decision C makes this database the only copy of every edit. A number field
 * survives an upgrade.
 *
 * Instagram is the exception and sorts on `addedAt` instead: a feed is
 * chronological by nature, and the plan's phase-3 step 6 backdates the six
 * entries so `-addedAt` reproduces the published 1…6 order.
 */
export const order: Field = {
  name: "order",
  type: "number",
  required: true,
  defaultValue: 0,
  index: true,
  admin: {
    position: "sidebar",
    description: "Lowest first. The published order, which no field on the document implies.",
  },
};

/**
 * The URL segment a document is reached at.
 *
 * Not auto-generated from the title. Every slug on this site is already
 * published — `/post/napkin-fold-ideas-that-will-elevate-your-table` is a live
 * URL — and a hook that regenerated it from an edited headline would silently
 * break the link. Typed once, then left alone.
 */
export const slug: Field = {
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "The URL segment. Changing it changes a published address.",
  },
};
