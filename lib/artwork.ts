import { SIZES } from "./sizes";

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

/**
 * A photograph exported at several widths. The alternates are named
 * `<stem>-<width>.jpg`; the full-size export keeps the bare stem and carries
 * its own intrinsic width as the last candidate.
 */
export function responsive(
  stem: string,
  alternates: number[],
  intrinsic: number,
  sizes: string,
): Artwork {
  const src = `/images/${stem}.jpg`;
  return {
    src,
    srcSet: [...alternates.map((w) => `/images/${stem}-${w}.jpg ${w}w`), `${src} ${intrinsic}w`].join(
      ", ",
    ),
    sizes,
  };
}

/** A photograph that shipped without alternates, so it stays single-source. */
const single = (stem: string): Artwork => ({ src: `/images/${stem}.jpg` });

/**
 * The story-split pair. **Nothing reads this any more.**
 *
 * What has left this file, and when: the three hero plates in phase 2; the two
 * portfolio tables in phase 3 — `PORTFOLIO_ARTWORK` and `PORTFOLIO_PAGE_ARTWORK`,
 * which were `withSizes()` over one source table and are now one `image` per
 * Project with the hint supplied by whichever grid renders the card (decision D);
 * and in phase 4 the last of it, when the `storySplit` and `photoRow` blocks took
 * the pair below and the about page's eight photographs.
 *
 * The two tables are left standing because the plan puts their removal in phase 6
 * — "what phase 6 finds there is only what phase 4 has just stopped using" — along
 * with `lib/projects.ts`, `lib/journal.ts` and `lib/services.ts`, which have been
 * unreferenced since phase 3. What survives that pass is the `Artwork` type, which
 * `lib/media.ts` still returns, and `PETALS`, which four components still draw.
 */
export const ARTWORK = {
  whoWeAre: responsive("about-who-we-are", [500, 800], 805, SIZES.story),
  whatWeDo: responsive("about-what-we-do", [500, 800], 805, SIZES.story),
} satisfies Record<string, Artwork>;

/** The petal cut-outs that drift behind the artwork. */
export const PETALS = {
  rose: "/images/petals-rose.png",
  stem: "/images/petals-stem.png",
  tall: "/images/petals-tall.png",
  wide: "/images/petals-wide.png",
} as const;

/**
 * The about page's photography. The three-up rows shipped as single sources;
 * only the two-up pair carries alternates, and it keeps the hint the layout was
 * published with.
 */
export const ABOUT_ARTWORK = {
  laceGown: single("about-lace-gown"),
  poppyField: single("about-poppy-field"),
  florists: single("about-florists"),
  goldenField: responsive("about-golden-field", [500], 761, SIZES.fullWidth),
  veilKiss: responsive("about-veil-kiss", [500], 761, SIZES.fullWidth),
  hatBox: single("about-hat-box"),
  brideTulle: single("about-bride-tulle"),
  lemonCake: single("about-lemon-cake"),
} satisfies Record<string, Artwork>;
