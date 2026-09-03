/**
 * Server-side access to the Local API.
 *
 * Kept apart from `lib/media.ts` so the mapping layer stays importable from client
 * components: this module reaches the database, that one only reshapes what comes
 * back.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media, Post, Project, Service, Testimonial } from "@/payload-types";

/**
 * The Local API client. `getPayload` memoises per config, so calling this per render
 * costs a promise, not a connection.
 */
export const getClient = () => getPayload({ config });

/**
 * Looks Media documents up by filename, and throws if any is absent.
 *
 * Phase 2 wires the home hero through Payload before Pages exist to hold an upload
 * relationship, so the filename is the only handle the collection offers. Phase 4
 * replaces every one of these calls with a relationship on a block, at which point
 * this is only useful to the seed for its own idempotency check.
 *
 * **It throws rather than falling back to `lib/artwork.ts` on purpose.** A silent
 * fallback would let the phase-2 fingerprint pass on the hardcoded artwork while the
 * Payload path was broken or the library empty — which would make decision E's gate
 * measure nothing at all. Better a loud 500 on one route than a green check that
 * proves nothing.
 */
export async function mediaByFilename<const T extends readonly string[]>(
  filenames: T,
): Promise<Record<T[number], Media>> {
  const client = await getClient();
  const { docs } = await client.find({
    collection: "media",
    where: { filename: { in: [...filenames] } },
    limit: filenames.length,
    depth: 0,
  });

  const found = new Map(docs.map((doc) => [doc.filename, doc]));
  const missing = filenames.filter((filename) => !found.has(filename));
  if (missing.length) {
    throw new Error(
      `Media not in the library: ${missing.join(", ")}.\n` +
        "Phase 2 renders the home hero from Payload rather than from lib/artwork.ts. " +
        "Upload the originals with:\n\n" +
        "  npm run payload -- run scripts/upload-media.ts\n",
    );
  }

  return Object.fromEntries(filenames.map((filename) => [filename, found.get(filename)!])) as Record<
    T[number],
    Media
  >;
}

/* --------------------------------------------------- the phase-3 collections */

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
