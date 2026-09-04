import type { Field } from "payload";

/**
 * Fields shared across the block library (docs/payload-plan.md, phase 4).
 *
 * The link group is the one that carries weight. Everything else here is a
 * label with a default.
 */

/**
 * A link: a label, and either a Pages document or an off-site URL.
 *
 * **The relationship is the point.** Spec §6: pointing a CTA at a document
 * rather than at a typed path kills the dead links by construction — you cannot
 * reference a page that does not exist, and renaming a slug updates every link
 * to it. Four of the fourteen links §1.4 inventories were dead because they were
 * strings; `/services/services-b` and `/about/about-b` cannot be typed here.
 *
 * `externalUrl` is the escape hatch the spec asks for, and decision G's home:
 * the footer's three `/template-info/*` links have no destination on this site,
 * so they are seeded as URLs rather than deleted. That leaves the decision to
 * drop them an edit in the admin rather than a code change.
 *
 * `maxDepth: 1` is not decoration. A Pages relationship read at the request's
 * `depth: 2` would populate the whole related document — its `layout` array, and
 * then *that* array's own relationships — which is the join blow-up in the
 * plan's risk register. Capped at 1, and paired with `populate: { pages: { slug:
 * true } }` at the call site, a CTA costs the one column it actually reads.
 */
export const linkFields: Field[] = [
  {
    name: "label",
    type: "text",
    admin: { description: "Leave empty to omit the link entirely." },
  },
  {
    name: "page",
    type: "relationship",
    relationTo: "pages",
    maxDepth: 1,
    admin: { description: "Where it goes. Renaming that page's slug updates this link." },
    validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
      const sibling = siblingData as { label?: string | null; externalUrl?: string | null };
      if (!sibling?.label) return true;
      if (value || sibling.externalUrl) return true;
      return "A link with a label needs a page or an external URL.";
    },
  },
  {
    name: "externalUrl",
    type: "text",
    admin: {
      description: "Used instead of the page, for a destination this site does not hold.",
    },
  },
];

/**
 * The three fields above as a named group — the shape a block's CTA takes.
 *
 * The globals' nav arrays spread `linkFields` flat into their rows instead,
 * because a row *is* a link there and a group inside it would only add a
 * nesting level to click through.
 */
export function link(name: string, label: string): Field {
  return { name, type: "group", label, fields: linkFields };
}

/** The small uppercase label above a section heading. */
export const eyebrow: Field = {
  name: "eyebrow",
  type: "text",
  required: true,
  admin: { description: "The uppercase label above the headline." },
};

/** The section headline. */
export const heading: Field = {
  name: "heading",
  type: "text",
  required: true,
};
