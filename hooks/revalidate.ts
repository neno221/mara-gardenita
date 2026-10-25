import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { pathFor } from "@/lib/links";

/**
 * Publishing updates the live site within a request (spec §10).
 *
 * The pages are statically generated, which is what makes these hooks necessary
 * and also what makes them worth having: without them an edit would land at the
 * next deploy, and decision C means there is no next deploy.
 *
 * ## Why paths and not tags
 *
 * The spec offers `revalidatePath` / `revalidateTag`. Tags are the wrong tool
 * here: Next attaches them to `fetch`, and nothing on this site fetches — the
 * Local API talks to Postgres in-process. Tagging would mean wrapping every query
 * in `unstable_cache` to invent a cache entry to tag, which is machinery in
 * service of an API rather than of the site.
 *
 * ## Why so much of it is `("/", "layout")`
 *
 * Because the content really is site-wide. A Service appears in a `serviceGrid`
 * on any page that places one; a Testimonial in any `testimonials` block; the
 * Instagram tiles and both globals render in the chrome on every route. There is
 * no query that answers "which pages render this document" without walking every
 * block on every page, and a hook that walked them would be slower and wronger
 * than revalidating the tree.
 *
 * So the rule is: revalidate the document's own path where it has one, and the
 * whole tree where the document is furniture. It over-invalidates on a busy site.
 * This site has six pages and one editor.
 */

/**
 * `revalidatePath`, but survivable outside a request.
 *
 * Next keeps its cache handle in a per-request store, so `revalidatePath` throws
 * `Invariant: static generation store missing` when nothing is serving a request
 * — which is exactly the situation `scripts/seed.ts` and any `payload run` script
 * writes from. Those callers are not editors publishing a change; they are a
 * process that will hand a cold cache to the next `next dev` anyway, so there is
 * nothing there to invalidate and nothing to report.
 *
 * Swallowed narrowly and deliberately. A hook that took the seed down would make
 * the seed depend on Next being up, which is the wrong dependency in the wrong
 * direction — and one that would only show up the next time someone reseeded.
 */
function revalidate(path: string, type?: "layout" | "page"): void {
  try {
    revalidatePath(path, type);
  } catch {
    // No request in flight, so no cache to invalidate.
  }
}

/** Everything under the root layout — the blunt instrument, used deliberately. */
const revalidateEverything = () => {
  revalidate("/", "layout");
  revalidate("/gr", "layout");
};

/**
 * A Page's own URL, plus the tree.
 *
 * The tree as well as the path, because a Page is not only a page: renaming its
 * slug moves every CTA that points at it, and those live on other documents.
 *
 * `previousDoc` is what catches the rename itself. Revalidating only the new path
 * would leave the old URL serving a cached page that no longer exists.
 */
export const revalidatePage: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidate(pathFor(previousDoc.slug as string));
  }
  if (doc?.slug) revalidate(pathFor(doc.slug as string));
  if (doc?.slug) revalidate(pathFor(doc.slug as string, "gr"));
  revalidateEverything();
  return doc;
};

export const revalidatePageDelete: CollectionAfterDeleteHook = ({ doc }) => {
  if (doc?.slug) revalidate(pathFor(doc.slug as string));
  revalidateEverything();
  return doc;
};

/** A collection whose documents have a detail route of their own. */
const detailRoute = (prefix: string) => {
  const change: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      revalidate(`${prefix}/${previousDoc.slug}`);
    }
    if (doc?.slug) revalidate(`${prefix}/${doc.slug}`);
    revalidateEverything();
    return doc;
  };
  const remove: CollectionAfterDeleteHook = ({ doc }) => {
    if (doc?.slug) revalidate(`${prefix}/${doc.slug}`);
    revalidateEverything();
    return doc;
  };
  return { change, remove };
};

export const { change: revalidateProject, remove: revalidateProjectDelete } =
  detailRoute("/portfolio");

/** A collection that only ever appears inside someone else's page. */
export const revalidateSiteWide: CollectionAfterChangeHook = ({ doc }) => {
  revalidateEverything();
  return doc;
};

export const revalidateSiteWideDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateEverything();
  return doc;
};

/** The two globals, which the chrome renders on every route. */
export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  revalidateEverything();
  return doc;
};
