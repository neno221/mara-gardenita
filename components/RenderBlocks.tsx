import { Fragment } from "react";
import type { Page } from "@/payload-types";
import { getInstagramTiles } from "@/lib/instagram";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { resolveLink } from "@/lib/links";
import { artworkFrom } from "@/lib/media";
import { getProjects } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { ContactDetails } from "./ContactDetails";
import { Hero } from "./Hero";
import { PageMasthead } from "./HeroTop";
import { InstagramFeed } from "./InstagramFeed";
import { PhotoRow } from "./PhotoRow";
import { PortfolioCard } from "./PortfolioCard";
import { PortfolioGrid } from "./PortfolioGrid";
import { PressStrip } from "./PressStrip";
import { Prose } from "./Prose";
import { Section } from "./Section";
import { ServiceGrid } from "./ServiceGrid";
import { ServicePanel, type ServiceDetail } from "./ServicePanel";
import { StorySplit } from "./StorySplit";
import { Testimonials } from "./Testimonials";
import portfolioStyles from "./PortfolioList.module.css";
import panelStyles from "./ServicePanels.module.css";

/** One entry in a page's `layout`. The generated union, so the switch is exhaustive. */
export type PageBlock = Page["layout"][number];

/* ------------------------------------------------------------------ banding */

/**
 * How a block wants to be banded (docs/payload-plan.md §2).
 *
 * - `none` — the block brings its own band.
 * - `own` — it gets a `<Section>` to itself.
 * - `shared` — **adjacent `shared` blocks coalesce into one `<Section>`.**
 */
type Banding = "none" | "own" | "shared";

/**
 * **`RenderBlocks` owns all sectioning**, which is the decision the whole phase
 * rests on.
 *
 * `Section` is 76px of vertical padding at desktop. Some components brought
 * their own; others were bare and the view wrapped them. The about page is what
 * forces the choice: all six of its bodies — `photoRow · prose · photoRow ·
 * prose · pressStrip · photoRow` — sit inside *one* `<Section>`, and `.prose`
 * carries its own 110px margins inside that. Give each block its own band and
 * every seam gains 152px on top of margins that are already there; the page
 * stops being recognisable, on the page with the most blocks.
 *
 * So the four components that carried a `<Section>` had it lifted out — four
 * small edits, no CSS change — and the band is decided here instead.
 *
 * Typed against the generated `blockType` union, so adding a fourteenth block
 * without declaring its banding is a compile error rather than a page that
 * renders unbanded.
 */
const BANDING: Record<PageBlock["blockType"], Banding> = {
  hero: "none",
  masthead: "none",

  storySplit: "own",
  serviceGrid: "own",
  servicePanels: "own",
  portfolioGrid: "own",
  testimonials: "own",
  instagramFeed: "own",

  portfolioList: "shared",
  photoRow: "shared",
  prose: "shared",
  pressStrip: "shared",
  contactDetails: "shared",
};

/**
 * The band that opens the page body zeroes its top padding, because the band
 * above already carries the leading space.
 *
 * Only after a `masthead`. A `hero` keeps its own trailing space — the collage
 * hangs into it — which is why this asks what the previous block was rather than
 * whether this is the first band.
 */
const opensBody = (previous: PageBlock | undefined) => previous?.blockType === "masthead";

/* ------------------------------------------------------------------- render */

/**
 * A page's blocks, banded.
 *
 * Reproduces today's four pages exactly:
 *
 * | Page | Bands |
 * |---|---|
 * | home | HeroSection · Section ×5 |
 * | about | HeroSection(tight) · Section(first){6 blocks} · Section{testimonials} |
 * | services | HeroSection(tight) · Section(first){servicePanels} |
 * | portfolio | HeroSection(tight) · Section(first){portfolioList} |
 *
 * **What coalescing costs:** it is implicit. An editor cannot split one run of
 * prose into two bands, because adjacency is the only thing that decides. The
 * escape hatch, if anyone ever asks, is a zero-height `sectionBreak` block —
 * one line in the switch. Nobody has asked.
 */
export function RenderBlocks({
  blocks,
  locale = DEFAULT_LOCALE,
}: {
  blocks: PageBlock[];
  locale?: Locale;
}) {
  const bands = [];

  for (let i = 0; i < blocks.length; ) {
    const block = blocks[i];
    const first = opensBody(blocks[i - 1]);

    if (BANDING[block.blockType] === "none") {
      bands.push(<Fragment key={keyFor(block, i)}>{renderBlock(block, locale)}</Fragment>);
      i += 1;
      continue;
    }

    if (BANDING[block.blockType] === "own") {
      bands.push(
        <Section key={keyFor(block, i)} first={first}>
          {renderBlock(block, locale)}
        </Section>,
      );
      i += 1;
      continue;
    }

    // A run of `shared` blocks, however long, is one band.
    const start = i;
    while (i < blocks.length && BANDING[blocks[i].blockType] === "shared") i += 1;
    const run = blocks.slice(start, i);
    bands.push(
      <Section key={keyFor(run[0], start)} first={first}>
        {run.map((child, offset) => (
          <Fragment key={keyFor(child, start + offset)}>{renderBlock(child, locale)}</Fragment>
        ))}
      </Section>,
    );
  }

  return <>{bands}</>;
}

/** Payload gives every block a row id; the index is the fallback for a seeded one. */
const keyFor = (block: PageBlock, index: number) => block.id ?? `${block.blockType}-${index}`;

/**
 * A relationship, populated.
 *
 * Throws on a bare id, exactly as `lib/media.ts`'s `artworkFrom` does and for
 * the same reason: every relationship on a block is `required`, so an id can
 * only mean the query read below its depth. A block quietly rendering nothing
 * would let a page look finished with a section missing from it.
 */
function must<T>(value: number | T, field: string): T {
  if (typeof value !== "object" || value === null) {
    throw new Error(
      `Block field "${field}" holds the bare id ${String(value)} rather than a document. ` +
        "A page read below `PAGE_QUERY`'s depth?",
    );
  }
  return value;
}

function renderBlock(block: PageBlock, locale: Locale) {
  switch (block.blockType) {
    case "hero":
      return (
        <Hero
          eyebrow={block.eyebrow}
          heading={block.heading}
          lede={block.lede ?? undefined}
          cta={resolveLink(block.cta, locale)}
          left={artworkFrom(block.collageLeft, SIZES.heroSide)}
          right={artworkFrom(block.collageRight, SIZES.heroSide)}
          center={artworkFrom(block.collageCenter, SIZES.heroCenter)}
        />
      );

    case "masthead":
      return (
        <PageMasthead
          subtitle={block.eyebrow}
          heading={block.heading}
          lede={block.lede ?? undefined}
          cta={resolveLink(block.cta, locale) ?? undefined}
        />
      );

    case "storySplit":
      return (
        <StorySplit
          eyebrow={block.eyebrow ?? undefined}
          heading={block.heading}
          copy={block.copy}
          signature={block.signature ?? undefined}
          cta={resolveLink(block.cta, locale)}
          image={artworkFrom(block.image, SIZES.story)}
          petals={block.petals}
          side={block.side}
        />
      );

    case "serviceGrid":
      return (
        <ServiceGrid
          heading={block.heading ?? undefined}
          intro={block.intro ?? undefined}
          services={block.services.map((value) => {
            const service = must(value, "serviceGrid.services");
            return {
              title: service.title,
              summary: service.summary,
              // No hint: the glyphs are drawn at a fixed 69px and shipped single-source.
              icon: artworkFrom(service.icon),
            };
          })}
          cta={resolveLink(block.cta, locale)}
        />
      );

    case "servicePanels":
      return (
        <div className={panelStyles.grid}>
          {block.panels.map((panel, index) => (
            <ServicePanel
              key={panel.id ?? index}
              service={toServiceDetail(must(panel.service, "servicePanels.panels.service"))}
              dropped={panel.dropped ?? undefined}
              wide={panel.wide ?? undefined}
              petals={panel.petals ?? undefined}
            />
          ))}
        </div>
      );

    case "portfolioGrid":
      return (
        <PortfolioGrid
          eyebrow={block.eyebrow}
          heading={block.heading}
          projects={block.projects.map((value) => {
            const project = must(value, "portfolioGrid.projects");
            return {
              name: project.name,
              href: `/portfolio/${project.slug}`,
              // Four across on desktop. Decision D: one photograph, and the grid
              // that renders it names the slot width.
              image: artworkFrom(project.image, SIZES.portfolioGrid),
            };
          })}
          cta={resolveLink(block.cta, locale)}
        />
      );

    case "contactDetails":
      return <ContactDetails items={block.items} />;

    case "portfolioList":
      return <PortfolioListBlock block={block} />;

    case "testimonials":
      return (
        <Testimonials
          eyebrow={block.eyebrow}
          heading={block.heading}
          quotes={block.quotes.map((value) => {
            const item = must(value, "testimonials.quotes");
            return {
              quote: item.quote,
              signature: item.signature,
              portrait: artworkFrom(item.portrait),
            };
          })}
        />
      );

    case "photoRow":
      return <PhotoRow photos={block.photos} stagger={block.stagger} />;

    case "prose":
      return (
        <Prose ornament={block.ornament} heading={block.heading} content={block.content} />
      );

    case "pressStrip":
      return <PressStrip label={block.label} logos={block.logos} />;

    case "instagramFeed":
      return <InstagramFeedBlock block={block} />;
  }
}

/** The `/services` panel, from a Service document. */
function toServiceDetail(service: {
  title: string;
  icon: Parameters<typeof artworkFrom>[0];
  photo: Parameters<typeof artworkFrom>[0];
  copy: ServiceDetail["copy"];
}): ServiceDetail {
  return {
    title: service.title,
    icon: artworkFrom(service.icon),
    photo: artworkFrom(service.photo, SIZES.service),
    copy: service.copy,
  };
}

/* ------------------------------------------- the blocks that read a collection */

/**
 * Two blocks fetch rather than take what the page hands them, because an index
 * is not a selection: `/portfolio` wants whatever is published, in collection
 * order, without anyone editing the page when a project is added.
 *
 * They are async server components returned from the switch, so the fetches run
 * in parallel with the rest of the tree rather than serialising ahead of it.
 */

async function PortfolioListBlock({ block }: { block: Extract<PageBlock, { blockType: "portfolioList" }> }) {
  const projects = block.showAll
    ? await getProjects()
    : (block.projects ?? []).map((value) => must(value, "portfolioList.projects"));

  return (
    <div className={portfolioStyles.wrapper}>
      <div className={portfolioStyles.grid} role="list">
        {projects.map((project) => (
          <PortfolioCard
            key={project.slug}
            name={project.name}
            href={`/portfolio/${project.slug}`}
            // Two across. The taller crop is `styles.imageTall` in
            // PortfolioCard.module.css, exactly as it was (decision D).
            image={artworkFrom(project.image, SIZES.portfolioList)}
            variant="feature"
          />
        ))}
      </div>
    </div>
  );
}

async function InstagramFeedBlock({ block }: { block: Extract<PageBlock, { blockType: "instagramFeed" }> }) {
  const tiles = await getInstagramTiles(block.limit);
  return <InstagramFeed heading={block.heading} tiles={tiles} />;
}
