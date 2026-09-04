import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

/**
 * What a crawler may look at (spec §8).
 *
 * `/admin` and `/api` are disallowed because there is nothing there for a
 * crawler and something there for anyone reading a log of what it found. Neither
 * is a security measure — access control is in `access/index.ts`, and robots.txt
 * is a request, not a fence.
 *
 * `/next/preview` is listed for a different reason: it is the one URL on the site
 * whose whole job is to show unpublished work. It refuses anyone without a
 * session, so a crawler gets a 403 rather than a draft, but there is no reason to
 * let it try.
 *
 * **It lives at the root of `app/`, not in `(frontend)`, and that is load-bearing.**
 * Next's docs put both metadata conventions at the app root, and inside the route
 * group this file registered no route at all — `/robots.txt` fell through to the
 * Pages catch-all, which looked up a page slugged `robots.txt`, found none and
 * answered 404. `sitemap.ts` happened to work in the group, which is what made the
 * failure look like a bug in this file rather than a misplacement; it is at the
 * root too now, for the same documented reason rather than by luck.
 */
export default function robots(): MetadataRoute.Robots {
  const base = (SITE_URL?.origin ?? "").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/next/"],
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}

