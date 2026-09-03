import Link from "next/link";
import type { ComponentProps } from "react";

/** Routes that exist. The navigation points at the full template sitemap. */
const LIVE_ROUTES = new Set([
  "/",
  "/portfolio",
  "/about",
  "/blog",
  "/services",
]);

/**
 * Every journal post has a page, and the only `/post/` links the site renders
 * are built from `JOURNAL_POSTS`. Matched by prefix so this stays a leaf
 * module — importing the journal here would pull all four posts, their copy
 * and their srcSets into the client bundle of every page that links anywhere.
 */
const LIVE_PREFIXES = ["/post/"];

/**
 * Prefetching is left on for the pages that ship and turned off for the rest of
 * the sitemap, so the router does not fire requests for routes that would only
 * come back as 404s. Add to `LIVE_ROUTES` as each page lands.
 */
export function SiteLink(props: ComponentProps<typeof Link>) {
  const href = typeof props.href === "string" ? props.href : props.href.pathname;
  const live =
    href != null && (LIVE_ROUTES.has(href) || LIVE_PREFIXES.some((p) => href.startsWith(p)));
  return <Link prefetch={live ? undefined : false} {...props} />;
}
