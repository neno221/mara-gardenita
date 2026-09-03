import type { ProjectSlug } from "./projects";
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
 * The story-split pair, still served from disk.
 *
 * The three hero plates that used to sit here are gone: phase 2 moved them into the
 * Media collection, and `Hero` now takes them as props. Everything below is still
 * hardcoded until the phase-3 seed.
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

/**
 * The project photography is shared between the four-up grid on the home page
 * and the two-up grid on `/portfolio`; only the slot width differs, so the
 * sources are declared once and the `sizes` hint is applied per layout.
 */
const PORTFOLIO_SOURCES: Record<ProjectSlug, { alternates: number[]; intrinsic: number }> = {
  "jennifer-oliver": { alternates: [500], intrinsic: 628 },
  // Shipped without alternates in the source library, so it stays single-source.
  "briana-richard": { alternates: [], intrinsic: 0 },
  "anne-cameron": { alternates: [500], intrinsic: 628 },
  "linda-charles": { alternates: [500], intrinsic: 628 },
};

function withSizes(sizes: string): Record<ProjectSlug, Artwork> {
  const entries = Object.entries(PORTFOLIO_SOURCES) as [
    ProjectSlug,
    (typeof PORTFOLIO_SOURCES)[ProjectSlug],
  ][];
  return Object.fromEntries(
    entries.map(([slug, { alternates, intrinsic }]) => [
      slug,
      // A `sizes` hint without a `srcset` has nothing to pick from.
      alternates.length
        ? responsive(`portfolio-${slug}`, alternates, intrinsic, sizes)
        : single(`portfolio-${slug}`),
    ]),
  ) as Record<ProjectSlug, Artwork>;
}

/** Four across on desktop — the home page grid. */
export const PORTFOLIO_ARTWORK = withSizes(SIZES.portfolioGrid);

/** Two across on desktop — the portfolio page grid. */
export const PORTFOLIO_PAGE_ARTWORK = withSizes(SIZES.portfolioList);
