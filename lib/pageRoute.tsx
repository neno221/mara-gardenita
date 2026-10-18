import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChrome } from "@/lib/chrome";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getPage, getPageSlugs } from "@/lib/payload";
import { RenderBlocks } from "@/components/RenderBlocks";
import { SiteShell } from "@/components/SiteShell";

/**
 * The catch-all page route, once for each language.
 *
 * `app/(frontend)/[[...slug]]` serves English and `app/(greek)/gr/[[...slug]]`
 * serves Greek; both are a few lines that hand their locale to these functions.
 */
export type PageParams = { params: Promise<{ slug?: string[] }> };

const slugFrom = (segments?: string[]) => (segments?.length ? segments.join("/") : "home");

/** Every published page, `home` as the empty segment list. */
export async function pageStaticParams() {
  const pages = await getPageSlugs();
  return pages.map((slug) => ({ slug: slug === "home" ? [] : slug.split("/") }));
}

export async function pageMetadataFor({ params }: PageParams, locale: Locale): Promise<Metadata> {
  const page = await getPage(slugFrom((await params).slug), locale);

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

export async function PageView({ params }: PageParams, locale: Locale) {
  const slug = slugFrom((await params).slug);
  const [page, chrome] = await Promise.all([getPage(slug, locale), getChrome(locale)]);
  if (!page) notFound();

  return (
    <SiteShell {...chrome}>
      <RenderBlocks blocks={page.layout} locale={locale} />
    </SiteShell>
  );
}
