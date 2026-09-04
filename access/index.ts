import type { Access, FieldAccess } from "payload";

/**
 * Who may do what (docs/payload-plan.md, decision F; spec §12).
 *
 * Answered 4 September 2026, as the plan's assumption: an editor creates and
 * updates all content, cannot delete a Page, and cannot touch the Header or
 * Footer. Admins can do everything.
 *
 * The `role` field has been on Users since phase 1 for exactly this — retrofitting
 * access control after content exists is far more painful than declaring it early.
 * This is where it finally gets read.
 *
 * ## The thing to know about `read`
 *
 * These functions guard the REST and GraphQL APIs and the admin panel. They do
 * **not** guard the site's own rendering, because the Local API defaults to
 * `overrideAccess: true` — a server component's `payload.find()` runs as root and
 * sees drafts like any other document. That is not a hole to plug; it is what lets
 * the preview route render an unpublished page for an editor at all.
 *
 * So the draft filter lives in two places on purpose, and they are not redundant:
 * `publishedOnly` below closes the API, and the explicit `_status` clause in
 * `lib/payload.ts` closes the render path. Deleting either one publishes drafts
 * through the other.
 */

/** Signed in. The floor for every write on this site. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user);

/** Signed in as an admin. */
export const admins: Access = ({ req: { user } }) => user?.role === "admin";

/**
 * Public reads see published documents; a signed-in user sees everything.
 *
 * Returning a `Where` rather than `false` is what makes this a filter instead of a
 * wall: an anonymous request still gets a 200 and a list, just without the drafts
 * in it.
 */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (user) return true;
  return { _status: { equals: "published" } };
};

/** Public. A published site's photographs and copy are public. */
export const anyone: Access = () => true;

/** A user may read and update themselves; an admin may do it to anyone. */
export const selfOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return { id: { equals: user.id } };
};

/**
 * Only an admin may change a role.
 *
 * Without this an editor can promote themselves, which makes every rule above
 * decorative. Field-level, because the editor still needs to update the rest of
 * their own user document.
 */
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => user?.role === "admin";
