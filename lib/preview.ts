/**
 * The draft-preview URLs, built in one place so the admin and the route that
 * serves them cannot disagree (docs/payload-plan.md, phase 5; spec §10).
 *
 * ## The route is `/next/preview`, not `/api/preview`
 *
 * The spec says `/api/preview`. It cannot be: `app/(payload)/api/[...slug]` is
 * Payload's own catch-all and owns every path under `/api`. `/next/*` is the
 * segment Payload's own templates reserve for exactly this, and it is out of the
 * way of the Pages catch-all as well — a page slugged `next` would collide, which
 * is a trade worth making against colliding with the entire REST API.
 *
 * ## What actually authorises a preview
 *
 * Two things, and the order matters. The secret makes the URL unguessable, which
 * is all it does — it is in the admin's DOM, so it is not a credential. The
 * session is the authorisation: the route calls `payload.auth()` on the incoming
 * cookies and refuses anyone who is not signed in. A secret alone would publish
 * every draft on the site to anyone who read the page source once.
 */

/**
 * The path a document is previewed at.
 *
 * Pages resolve through `pathFor` so `home` previews at `/` like it serves at
 * `/`; the two detail collections have fixed prefixes.
 */
export function previewPath(collection: string, slug: string): string {
  if (collection === "pages") return slug === "home" ? "/" : `/${slug}`;
  if (collection === "projects") return `/portfolio/${slug}`;
  if (collection === "posts") return `/post/${slug}`;
  throw new Error(`${collection} has no public URL, so it cannot be previewed.`);
}

/**
 * The admin's live-preview iframe source, and the "Preview" button's href.
 *
 * Returns a relative URL on purpose. An absolute one would need the server's
 * origin baked in at config time, and the admin is served from the same origin
 * as the site — so a relative URL is correct in dev, correct behind a tunnel, and
 * correct if decision C is ever reversed.
 */
export function previewUrl({
  collection,
  slug,
}: {
  collection: string;
  slug: string | undefined;
}): string {
  const params = new URLSearchParams({
    collection,
    slug: slug ?? "",
    path: slug ? previewPath(collection, slug) : "/",
    secret: process.env.PAYLOAD_PUBLIC_DRAFT_SECRET ?? "",
  });
  return `/next/preview?${params.toString()}`;
}
