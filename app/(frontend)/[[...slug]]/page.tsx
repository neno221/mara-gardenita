import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChrome } from "@/lib/chrome";
import { pageMetadata } from "@/lib/metadata";
import { getPage, getPageSlugs } from "@/lib/payload";
import { RenderBlocks } from "@/components/RenderBlocks";
import { SiteShell } from "@/components/SiteShell";

/**
 * Every page on the site, except the two detail routes.
 *
 * This one file replaces `app/(frontend)/{page,about,services,portfolio,blog}`
 * and the five `*View` components behind them. A page is a row in a table and a
 * list of blocks now, so building the sixth is an afternoon in the admin rather
 * than a route, a view and a deploy — which is the sentence the whole migration
 * was for.
 *
 * The optional catch-all is what lets `/` come through here too: `home` is the
 * only slug with a path that is not its own, and `pathFor` in `lib/links.ts`
 * knows it in one line.
 *
 * Statically generated, and revalidated by the `afterChange` hooks in
 * `hooks/revalidate.ts` — phase 5 added both halves at once, because either one
 * alone is worse than neither: a cache with no invalidation serves stale pages,
 * and invalidation with no cache is a no-op that looks like it works.
 */
type Params = { params: Promise<{ slug?: string[] }> };

const slugFrom = (segments?: string[]) => (segments?.length ? segments.join("/") : "home");

/**
 * Every published page, `home` as the empty segment list.
 *
 * `dynamicParams` stays on its default, so a page published after the last build
 * still renders on first request rather than 404ing.
 */
export async function generateStaticParams() {
  const pages = await getPageSlugs();
  return pages.map((slug) => ({ slug: slug === "home" ? [] : slug.split("/") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = await getPage(slugFrom((await params).slug));

  // No title of its own is not a gap to fill: the layout's metadata is the
  // site's, and inheriting it is what the home page wants.
  if (!page?.meta?.title) return {};

  return pageMetadata({
    title: page.meta.title,
    description: page.meta.description ?? undefined,
    image: page.meta.image,
    noIndex: page.meta.noIndex,
  });
}

export default async function Page({ params }: Params) {
  const slug = slugFrom((await params).slug);
  const [page, chrome] = await Promise.all([getPage(slug), getChrome()]);
  if (!page) notFound();

  return (
    <SiteShell {...chrome}>
      <RenderBlocks blocks={page.layout} />
    </SiteShell>
  );
}
