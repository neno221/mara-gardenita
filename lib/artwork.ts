/**
 * What is left of the site's hardcoded art direction: one type and four PNGs.
 *
 * Everything else here was a lookup table of `/images/<stem>.jpg` paths and their
 * hand-maintained `srcSet` candidates, emptied one phase at a time as the CMS took
 * over — the three hero plates in phase 2; the two portfolio tables in phase 3; the
 * story-split pair and the about page's eight photographs in phase 4, when the
 * `storySplit` and `photoRow` blocks took them. Phase 6 removes the tables that
 * outlived their last reader, along with the `responsive()`/`single()` pair that
 * built them. `lib/media.ts`'s `toArtwork` is the only thing that constructs an
 * `Artwork` now, and it constructs it from a Media document.
 *
 * The two survivors are not leftovers. The type is the contract `toArtwork` returns
 * and every photograph on the site renders through; the petals are decoration the
 * layout draws rather than content anyone would edit, so they stay in the repo
 * rather than becoming four Media documents nobody has a reason to open.
 */

/**
 * Responsive sources for the photography. Each entry keeps the widths the
 * layout was designed around, so the browser resolves the same intrinsic
 * aspect ratio at every breakpoint.
 */
export type Artwork = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

/** The petal cut-outs that drift behind the artwork. */
export const PETALS = {
  rose: "/images/petals-rose.png",
  stem: "/images/petals-stem.png",
  tall: "/images/petals-tall.png",
  wide: "/images/petals-wide.png",
} as const;
