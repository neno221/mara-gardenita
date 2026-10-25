/**
 * Server-side access to the Local API.
 *
 * Kept apart from `lib/media.ts` so the mapping layer stays importable from client
 * components: this module reaches the database, that one only reshapes what comes
 * back.
 */
import { draftMode } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Locale } from "./i18n";
import type {
  Footer,
  Header,
  Instagram,
  Page,
  Project,
  Service,
  Testimonial,
} from "@/payload-types";

/**
 * The Local API client. `getPayload` memoises per config, so calling this per render
 * costs a promise, not a connection.
 */
export const getClient = () => getPayload({ config });

/**
 * Deep enough to populate an upload field into a whole Media document — which is
 * what `toArtwork` needs, and what the rich-text upload node needs before
 * `components/RichText` can read a caption off it. One level, not two: nothing
 * on these collections relates to anything but Media, so a deeper read would
 * only widen the join.
 */
const DEPTH = 1;

/**
 * Published only.
 *
 * Phase 5 added `publishedOnly` to the collections' read access, and this stayed.
 * The two are not redundant: access functions guard the REST and GraphQL APIs and
 * the admin panel, while the Local API defaults to `overrideAccess: true` and
 * runs every query here as root. Deleting this line would publish drafts through
 * the render path with the access rule still sitting there looking correct.
 *
 * That default is not a hole to plug, either — it is what lets the preview route
 * render an unpublished document for an editor at all. So the filter is applied
 * where the audience is the public, and lifted where it is a signed-in editor:
 * `draft: true` below is the switch.
 */
const PUBLISHED = { _status: { equals: "published" } };

/**
 * Whether this render is a draft preview.
 *
 * `draftMode()` reads a cookie the `/next/preview` route sets, and that route
 * sets it only after `payload.auth()` has confirmed a signed-in user. So by the
 * time this returns true, someone has already been authorised.
 *
 * It is read here rather than passed down from each route because a page renders
 * a tree of blocks that each fetch their own content — `portfolioList` queries
 * projects — and threading a flag through all of
 * them would mean every future block had to remember to.
 *
 * **It throws outside a request, and that is the interesting case.** The same
 * `getProjects` that renders a page also feeds the detail route's
 * `generateStaticParams`, which Next runs at build time with no HTTP
 * request to read a cookie from. There is no preview at build time — nobody is
 * signed in and nothing is being previewed — so the honest answer there is
 * `false`, and catching is how you get it. Letting it throw would mean the
 * static params of a route depended on a cookie that cannot exist.
 */
async function isDraft(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    return false;
  }
}

/**
 * The `where` and `draft` a public read uses, or an editor's preview.
 *
 * `draft: true` is what makes Payload return the *latest* version rather than the
 * published one — without it a preview of an edited-but-unpublished page would
 * show the last published copy and look, convincingly, like the edit had failed.
 */
async function visibility() {
  const draft = await isDraft();
  return { where: draft ? {} : PUBLISHED, draft };
}

/** The three services, in the order both the home grid and `/services` print. */
export async function getServices(): Promise<Service[]> {
  const client = await getClient();
  const { docs } = await client.find({ collection: "services", limit: 10, depth: DEPTH });
  return docs;
}

/** The four case studies, in the order both portfolio grids print. */
export async function getProjects(): Promise<Project[]> {
  const client = await getClient();
  const { where, draft } = await visibility();
  const { docs } = await client.find({
    collection: "projects",
    where,
    draft,
    limit: 50,
    depth: DEPTH,
  });
  return docs;
}

/** The carousel's quotes, in order. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const client = await getClient();
  const { docs } = await client.find({ collection: "testimonials", limit: 20, depth: DEPTH });
  return docs;
}

/** The footer's feed, newest first. `-addedAt` is the collection's default sort. */
export async function getInstagram(limit: number): Promise<Instagram[]> {
  const client = await getClient();
  const { docs } = await client.find({ collection: "instagram", limit, depth: DEPTH });
  return docs;
}

/* ------------------------------------------------- the phase-4 pages and globals */

/**
 * A page is read two levels deep, and that is the whole join budget.
 *
 * Depth 1 populates what a block points at — a Service, a Project, a
 * Testimonial, an upload. Depth 2 populates *their* uploads: the service's glyph
 * and photograph, the project's photograph, the testimonial's portrait. Every
 * one of those is a `toArtwork` call away from an `<img>`, so anything shallower
 * renders a page of bare ids.
 *
 * The cost is the risk register's "Postgres join blow-up", and it comes from one
 * field: a CTA's `page` relationship. Left alone it would populate the whole
 * related Page — its `layout` array, and then that array's own relationships —
 * once per link. Two things cap it. The field carries `maxDepth: 1`, and
 * `populate` trims the related document to the single column `hrefFor` reads.
 * A nav of four links then costs four slugs rather than four page trees.
 */
const PAGE_QUERY = {
  depth: 2,
  populate: { pages: { slug: true } },
} as const;

/** One page by slug, or null. `home` is the front page. */
export async function getPage(slug: string, locale: Locale = "en"): Promise<Page | null> {
  const client = await getClient();
  const { where, draft } = await visibility();
  const { docs } = await client.find({
    collection: "pages",
    where: { ...where, slug: { equals: slug } },
    draft,
    limit: 1,
    locale,
    ...PAGE_QUERY,
  });
  return docs[0] ?? null;
}

/**
 * Every published page's slug, for `generateStaticParams` and the sitemap.
 *
 * Deliberately *not* draft-aware. This answers "what does the site consist of",
 * which has one answer regardless of who is asking — an editor previewing a
 * draft reaches it by its own URL, and a build that pre-rendered unpublished
 * pages would serve them to everyone.
 */
export async function getPageSlugs(): Promise<string[]> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "pages",
    where: PUBLISHED,
    limit: 500,
    depth: 0,
    select: { slug: true },
  });
  return docs.map((doc) => doc.slug);
}

/**
 * Everything with a URL, for the sitemap: slug, when it changed, and whether it
 * has asked to be left out.
 *
 * One query per collection and three columns each. The sitemap is regenerated on
 * every content change by the same hooks that revalidate the pages, so it is
 * worth it being cheap.
 */
export async function getSitemapEntries(): Promise<
  { collection: "pages" | "projects"; slug: string; updatedAt: string }[]
> {
  const client = await getClient();
  const collections = ["pages", "projects"] as const;

  const results = await Promise.all(
    collections.map(async (collection) => {
      const { docs } = await client.find({
        collection,
        where: { ...PUBLISHED, "meta.noIndex": { not_equals: true } },
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true },
      });
      return docs.map((doc) => ({
        collection,
        slug: doc.slug as string,
        updatedAt: doc.updatedAt as string,
      }));
    }),
  );

  return results.flat();
}

/** One project by slug, or null — the detail page decision A puts in scope. */
export async function getProject(slug: string): Promise<Project | null> {
  const client = await getClient();
  const { where, draft } = await visibility();
  const { docs } = await client.find({
    collection: "projects",
    where: { ...where, slug: { equals: slug } },
    draft,
    limit: 1,
    ...PAGE_QUERY,
  });
  return docs[0] ?? null;
}

/**
 * The navigation. Populated the same way a page is, because its links are the
 * same field and resolve through the same `hrefFor`.
 */
export async function getHeader(): Promise<Header> {
  const client = await getClient();
  return client.findGlobal({ slug: "header", ...PAGE_QUERY });
}

/** The closing band. Its Instagram tiles come from the collection, not from here. */
export async function getFooter(): Promise<Footer> {
  const client = await getClient();
  return client.findGlobal({ slug: "footer", ...PAGE_QUERY });
}
