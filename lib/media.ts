/**
 * Turns a Payload Media document into the `Artwork` shape every photograph on the
 * site already renders through (docs/payload-plan.md, phase 2).
 *
 * This module is deliberately pure — no `getPayload`, no config import — because
 * `Artwork` crosses into client components (`Hero`, `StorySplit`, `PortfolioCard`),
 * and pulling the Local API into that graph would drag the database driver with it.
 * Fetching lives in `lib/payload.ts`; mapping lives here.
 *
 * ## The two invariants
 *
 * **1. The `sizes` hint is the switch.** Pass a hint and you get a `srcSet`; omit
 * it and you get a bare `src`. This is not a convenience — it is the only way to
 * preserve the library as published.
 *
 * Ten photographs shipped single-source. For seven of them Payload *would* generate
 * a usable derivative, so nothing about the file itself says they should not have
 * one:
 *
 * | Photograph | Intrinsic | Payload would offer | Why it shipped bare |
 * |---|---|---|---|
 * | `portfolio-briana-richard` | 628w | 500, 628 | its three siblings are also 628w and *did* ship a 500 |
 * | `journal-napkin-fold-card` | 735w | 500, 735 | its three siblings are also 735w and *did* ship a 500 |
 * | `journal-post-figure-one/-two` | 930w | 500, 800, 930 | — |
 * | `about-poppy-field` | 699w | 500, 699 | — |
 * | `about-lace-gown`, `about-florists` | 506w | 500, 506 | — |
 *
 * The remaining three (`about-hat-box`, `-bride-tulle`, `-lemon-cake`, all 498w) are
 * narrower than the smallest image size, so invariant 2 below already covers them.
 *
 * So "did this image ship alternates?" cannot be recovered from the pixels — it is a
 * fact about the export, and for those seven it is an *arbitrary* one. Inferring the
 * `srcSet` from what Payload produced would hand the browser candidates the
 * published site never offered. The caller states the intent instead, exactly as
 * `lib/artwork.ts`'s `responsive()`/`single()` split does today.
 *
 * *(The plan and `collections/Media.ts` both say five, and name the wrong set.
 * Measured against `public/images` and the phase-0 captures, it is ten.)*
 *
 * **2. No `sizes` hint without a `srcSet` to pick from.** Even with a hint, an image
 * that yields fewer than two distinct candidate widths renders as a bare `src`. A
 * hint alone tells the browser how wide the slot is and then gives it nothing to
 * choose with, which is worse than silent: it is a promise with no payload.
 *
 * ## Why the de-duplication is load-bearing
 *
 * `withoutEnlargement: true` stops Payload *upscaling* into a size; it does not stop
 * it *declaring* one. `hero-left.jpg` is 803w, so its `w1080` derivative clamps back
 * to 803 — the original's own width. Naively concatenating the three derivatives and
 * the original emits `803w` twice, and a duplicated descriptor is a candidate list no
 * browser was ever handed here. `scripts/verify-media.ts` established this in phase 1;
 * the `Map` below is the fix.
 */
import type { Media } from "@/payload-types";
import type { Artwork } from "./artwork";
import type { SizesHint } from "./sizes";

/**
 * The fields `toArtwork` reads. Structural rather than the whole `Media`, so an
 * upload field's populated value, a `payload.find()` result and a document mid-seed
 * all satisfy it — while `Pick` still keeps it tied to the generated types, so a
 * renamed field fails the typecheck instead of silently reading `undefined`.
 */
export type MediaLike = Pick<Media, "url" | "width" | "filename" | "sizes">;

/** An upload field's value: a populated document, an unresolved id, or nothing. */
export type Upload = MediaLike | number | null | undefined;

/**
 * Narrows an upload field to a populated document, or `null`.
 *
 * A relationship queried below its `depth` comes back as a bare id, which is not a
 * failure — it is a query that needs a deeper `depth`. Callers render nothing and
 * the block stays standing.
 */
export function asMedia(value: Upload): MediaLike | null {
  return typeof value === "object" && value !== null ? value : null;
}

/**
 * The document's own file.
 *
 * `url` resolves to `/api/media/file/<name>`, which is Payload's own route rather
 * than a static file. That looks like the slower option next to `/media/<name>` —
 * `staticDir` does put the uploads under `public/`, and Next will serve them from
 * there — but **Next only serves `public/` files that existed at build time**.
 * Anything uploaded afterwards 404s, which is every photograph a CMS exists to
 * accept. The route handler is the correct answer, not merely the portable one.
 *
 * Portable too, though: `url` is the field a storage adapter rewrites, so decision C
 * reverses without this module changing. The `filename` branch is a last resort for
 * a document read back with `url` deselected.
 *
 * Note that the route is access-controlled. `collections/Media.ts` opens `read` to
 * everyone for exactly this reason; on Payload's default it answers 403 and every
 * photograph on the public site silently disappears.
 */
function fileUrl(media: MediaLike): string {
  if (media.url) return media.url;
  if (media.filename) return `/media/${media.filename}`;
  throw new Error(
    "Media document has neither a url nor a filename, so it has no file to render. " +
      "A `select` that drops both, or an upload that failed?",
  );
}

/**
 * A Media document as an `<img>`'s worth of attributes.
 *
 * ```ts
 * toArtwork(media)                    // { src }                  — single-source
 * toArtwork(media, SIZES.heroSide)    // { src, srcSet, sizes }   — responsive
 * ```
 *
 * Spread straight onto an `<img>`, as `lib/artwork.ts`'s tables are today.
 */
export function toArtwork(media: MediaLike, sizes?: SizesHint): Artwork {
  const src = fileUrl(media);
  if (!sizes) return { src };

  const intrinsic = media.width ?? 0;

  // Width -> URL, so a width can only appear once. The derivatives are inserted
  // first and the original last, which means the original wins a collision: at 803w
  // the `w1080` entry is a re-encode of the source at the source's own width, and
  // the source is the better file to hand the browser.
  const candidates = new Map<number, string>();
  for (const size of Object.values(media.sizes ?? {})) {
    const url = size?.url;
    const width = size?.width;
    if (!url || !width) continue;
    // `withoutEnlargement` should make this unreachable. If someone drops it, an
    // upscaled derivative is a candidate the browser would prefer and the original
    // cannot beat, so it is refused here rather than served.
    if (intrinsic && width > intrinsic) continue;
    candidates.set(width, url);
  }
  if (intrinsic) candidates.set(intrinsic, src);

  // Invariant 2: a hint with one candidate has nothing to pick from.
  if (candidates.size < 2) return { src };

  const srcSet = [...candidates.entries()]
    .sort(([a], [b]) => a - b)
    .map(([width, url]) => `${url} ${width}w`)
    .join(", ");

  return { src, srcSet, sizes };
}

/**
 * An upload field's value as an `<img>`'s worth of attributes.
 *
 * The composition of `asMedia` and `toArtwork` that every view performs, and it
 * **throws** on an unpopulated relationship rather than rendering a placeholder.
 * Every upload field on the phase-3 collections is `required`, so a bare id can
 * only mean the query asked for too shallow a `depth` — and a silent fallback
 * would let the fingerprint pass on a page whose photographs were missing, which
 * is the same trap `lib/payload.ts`'s `mediaByFilename` refuses. Better a loud
 * 500 on one route than a green check that proves nothing.
 *
 * `asMedia` stays exported for the optional case: a rich-text upload node, where
 * an unresolved value is a reason to render nothing and keep the body standing.
 */
export function artworkFrom(value: Upload, sizes?: SizesHint): Artwork {
  const media = asMedia(value);
  if (!media) {
    throw new Error(
      `Upload field is ${value === null || value === undefined ? "empty" : `the bare id ${value}`}, ` +
        "not a populated Media document. A required relationship read below its depth?",
    );
  }
  return toArtwork(media, sizes);
}
