import type { ResolvedLink } from "@/lib/links";
import { PortfolioCard, type PortfolioCardProps } from "./PortfolioCard";
import { SiteLink } from "./SiteLink";
import { Sprig } from "./Sprig";
import styles from "./PortfolioGrid.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

type PortfolioGridProps = {
  eyebrow: string;
  heading: string;
  projects: PortfolioCardProps[];
  /** The button below the grid. Omitted when the block carries no label. */
  cta: ResolvedLink | null;
};

/**
 * The four-up project grid on the home page.
 *
 * Phase 3 moved the projects; phase 4 moves the last three strings that were
 * written into this file. The `<Section>` is lifted out under §2's rule — this
 * block is banded `own`, so `RenderBlocks` puts it back.
 */
export function PortfolioGrid({ eyebrow, heading, projects, cta }: PortfolioGridProps) {
  return (
    <>
      <div className={`${section.blockHeading} ${section.blockHeadingSpaced}`}>
        <Sprig className={section.sprig} />
        <div className={section.subtitle}>
          {eyebrow}
          <br />
        </div>
        <h2 className={section.heading}>{heading}</h2>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.grid} role="list">
          {projects.map((project) => (
            <PortfolioCard key={project.href} {...project} />
          ))}
        </div>
      </div>

      {cta && (
        <SiteLink href={cta.href} className={buttons.button}>
          {cta.label}
        </SiteLink>
      )}
    </>
  );
}
