/**
 * Server-side access to the Local API.
 *
 * Kept apart from `lib/media.ts` so the mapping layer stays importable from client
 * components: this module reaches the database, that one only reshapes what comes
 * back.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type {
  Footer,
  Header,
  Instagram,
  Media,
  Page,
  Post,
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
 * Drafts are enabled on Projects and Posts, and Payload does *not* filter them
 * out of a `find` — `_status` is an ordinary queryable field, so an unpublished
 * document is returned like any other unless something asks it not to be. Phase
 * 5 moves this into the collections' read access, where the admin panel and the
 * REST API are covered too; until then it lives at every call site that serves
 * the public site, because a filter that is missing from one query is worse than
 * one that has not been written yet.
 */
const PUBLISHED = { _status: { equals: "published" } };

/** The three services, in the order both the home grid and `/services` print. */
export async function getServices(): Promise<Service[]> {
  const client = await getClient();
  const { docs } = await client.find({ collection: "services", limit: 10, depth: DEPTH });
  return docs;
}

/** The four case studies, in the order both portfolio grids print. */
export async function getProjects(): Promise<Project[]> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "projects",
    where: PUBLISHED,
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

/** The journal index, in the order `/blog` prints — which is not date order. */
export async function getPosts(): Promise<Post[]> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "posts",
    where: PUBLISHED,
    limit: 100,
    depth: DEPTH,
  });
  return docs;
}

/** One post, or null. `null` rather than a throw: an unknown slug is a 404. */
export async function getPost(slug: string): Promise<Post | null> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "posts",
    where: { ...PUBLISHED, slug: { equals: slug } },
    limit: 1,
    depth: DEPTH,
  });
  return docs[0] ?? null;
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
export async function getPage(slug: string): Promise<Page | null> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "pages",
    where: { ...PUBLISHED, slug: { equals: slug } },
    limit: 1,
    ...PAGE_QUERY,
  });
  return docs[0] ?? null;
}

/** One project by slug, or null — the detail page decision A puts in scope. */
export async function getProject(slug: string): Promise<Project | null> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "projects",
    where: { ...PUBLISHED, slug: { equals: slug } },
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
