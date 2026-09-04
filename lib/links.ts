/**
 * The one place a stored link becomes an `href` (docs/payload-plan.md, phase 4).
 *
 * Fourteen links on this site were dead before this function existed, and eleven
 * of them were dead for the same reason: they were typed paths.
 * `/services/services-b` and `/about/about-b` were guesses at the template's
 * full sitemap, `/contact` pointed at a page nobody had built, and eight
 * `/portfolio/<slug>` links were assembled from a slug with no route behind it.
 *
 * A `page` relationship cannot be any of those. It refers to a document that
 * exists, and renaming that document's slug moves every link to it at once —
 * which is why `hrefFor` reads the slug rather than storing the path.
 *
 * `home` is the only special case, and it is one line: the front page is `/`,
 * not `/home`.
 */
import type { Page } from "@/payload-types";

/** A stored link: a label, and either a Pages document or an off-site URL. */
export type LinkValue = {
  label?: string | null;
  page?: (number | null) | Page;
  externalUrl?: string | null;
};

/** A link the site can render: what it says, and where it goes. */
export type ResolvedLink = { label: string; href: string };

/** The path a Pages document is served at. `home` is the front page. */
export function pathFor(slug: string): string {
  return slug === "home" ? "/" : `/${slug}`;
}

/**
 * A stored link's destination.
 *
 * **Throws on an unpopulated relationship**, the way `lib/media.ts`'s
 * `artworkFrom` does and for the same reason: a bare id means the query asked
 * for too shallow a `depth`, and a link silently falling back to `#` would let
 * a page render whole with every destination wrong. The call sites all read
 * through `getPage`, which sets the depth and the `populate` that keeps it cheap.
 */
export function hrefFor(value: LinkValue): string {
  const { page, externalUrl } = value;

  if (typeof page === "object" && page !== null) return pathFor(page.slug);
  if (typeof page === "number") {
    throw new Error(
      `Link points at page ${page} but the document was not populated, so its slug is unknown. ` +
        "A query below the relationship's depth?",
    );
  }
  if (externalUrl) return externalUrl;

  throw new Error(
    `Link "${value.label ?? ""}" has neither a page nor an external URL. ` +
      "The field's validate() refuses this on save, so it can only reach here from a seed.",
  );
}

/**
 * A stored link, or `null` where there is no link to draw.
 *
 * An empty label is how a block says "no button" — the hero, the masthead and
 * the two grids all carry an optional CTA — so it is checked before the
 * destination is resolved, and an unlabelled link with no page is not an error.
 */
export function resolveLink(value: LinkValue | null | undefined): ResolvedLink | null {
  if (!value?.label) return null;
  return { label: value.label, href: hrefFor(value) };
}
