import type { MetadataRoute } from "next";
import { pathFor } from "@/lib/links";
import { SITE_URL } from "@/lib/metadata";
import { getSitemapEntries } from "@/lib/payload";

/**
 * Every published URL on the site (spec §8). There was none before phase 5.
 *
 * Generated from the two collections that have a URL, skipping anything with
 * `meta.noIndex` — a document that asks not to be indexed should not be listed
 * in the file whose entire purpose is to get it indexed. `robots.ts` points here.
 *
 * `NEXT_PUBLIC_SITE_URL` is `http://localhost:3000` under decision C. That reads
 * oddly for a sitemap, and it is the honest answer: this is where the site runs.
 * Changing one environment variable makes the whole file correct for a real host,
 * which is the property worth having.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (SITE_URL?.origin ?? "").replace(/\/$/, "");
  const entries = await getSitemapEntries();

  return entries.flatMap(({ collection, slug, updatedAt }) => {
    const path = collection === "pages" ? pathFor(slug) : `/portfolio/${slug}`;

    const paths = collection === "pages" ? [path, pathFor(slug, "gr")] : [path];

    return paths.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(updatedAt),
      // The front page above the rest; nothing here is finer-grained than that,
      // and inventing a priority per collection would be a number with no
      // measurement behind it.
      priority: p === "/" || p === "/gr" ? 1 : 0.7,
    }));
  });
}
