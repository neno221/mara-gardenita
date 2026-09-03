/**
 * Server-side access to the Local API.
 *
 * Kept apart from `lib/media.ts` so the mapping layer stays importable from client
 * components: this module reaches the database, that one only reshapes what comes
 * back.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

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
