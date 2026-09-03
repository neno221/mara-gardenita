/**
 * The `sizes` hints the published site ships, lifted verbatim out of
 * `lib/artwork.ts` (docs/payload-plan.md, phase 2).
 *
 * There are **seven** distinct hints, not the four the spec's snippet shows. Each
 * one is a promise about how wide the slot is at each breakpoint, and the browser
 * picks a `srcSet` candidate from it before layout runs — so a hint that drifts by
 * a single `vw` can silently hand every visitor a different photograph than the
 * one the site was published with.
 *
 * That is why these strings are moved rather than rewritten, and why every module
 * that used to keep its own copy now reads from here. `lib/artwork.ts`,
 * `lib/services.ts` and `lib/journal.ts` all consumed one of these; leaving a
 * second copy behind would let a phase-4 edit here diverge from a hardcoded string
 * there without anything failing.
 *
 * The fingerprint records `sizes` per `<img>` per route, so a typo in any of the
 * seven fails the phase-0 baseline immediately.
 */
export const SIZES = {
  /** A plate that runs the full width of its column at every breakpoint. */
  fullWidth: "(max-width: 479px) 96vw, (max-width: 767px) 95vw, 96vw",

  /** The two outer photographs of the home hero's collage. */
  heroSide: "(max-width: 479px) 51vw, (max-width: 767px) 49vw, 375.1875px",

  /** The taller plate in the middle of the collage. */
  heroCenter: "(max-width: 479px) 77vw, (max-width: 767px) 73vw, 560px",

  /** The photograph beside a story split. */
  story: "(max-width: 767px) 80vw, (max-width: 991px) 81vw, 77vw",

  /** The photograph above a service panel's copy. */
  service: "(max-width: 479px) 86vw, (max-width: 767px) 85vw, 720px",

  /** Four across on desktop — the home page's project grid. */
  portfolioGrid: "(max-width: 479px) 100vw, (max-width: 767px) 46vw, (max-width: 991px) 23vw, 22vw",

  /** Two across on desktop — the `/portfolio` project grid. */
  portfolioList: "(max-width: 479px) 96vw, (max-width: 767px) 95vw, (max-width: 991px) 47vw, 46vw",
} as const;

/**
 * One of the seven hints above.
 *
 * `toArtwork` takes this rather than a bare `string` on purpose: the vocabulary of
 * slot widths on this site is closed, and an eighth hint is a layout decision that
 * belongs in the table above where the fingerprint can see it — not an inline
 * string at a call site.
 */
export type SizesHint = (typeof SIZES)[keyof typeof SIZES];
