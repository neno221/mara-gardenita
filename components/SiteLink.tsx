import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Every internal link on the site.
 *
 * **The allowlist is gone.** It existed because the navigation pointed at the
 * template's full sitemap while only five routes shipped, so prefetching had to
 * be switched off for the paths that would answer 404. Nothing types a path any
 * more: `hrefFor` resolves a Pages relationship, and a relationship cannot
 * dangle — you cannot point at a document that does not exist, and renaming a
 * slug moves every link to it. Prefetch goes back to Next's default because the
 * thing it was guarding against cannot happen.
 *
 * What is left is the `externalUrl` escape hatch, which the allowlist never had
 * to think about. An absolute URL is not a route — handing it to `next/link`
 * asks the router to prefetch and client-navigate to another origin — so it
 * renders as a plain anchor that opens in a new tab, the way the footer's social
 * links always have.
 */
export function SiteLink({ href, ...props }: ComponentProps<typeof Link>) {
  const path = typeof href === "string" ? href : href.pathname;

  if (path && /^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
    const { prefetch: _prefetch, ...anchorProps } = props;
    return <a href={path} target="_blank" rel="noreferrer" {...anchorProps} />;
  }

  return <Link href={href} {...props} />;
}
