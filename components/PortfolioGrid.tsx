import { PortfolioCard, type PortfolioCardProps } from "./PortfolioCard";
import { SiteLink } from "./SiteLink";
import { Sprig } from "./Sprig";
import { Section } from "./Section";
import styles from "./PortfolioGrid.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

/**
 * The four-up project grid on the home page.
 *
 * Only the projects move in phase 3. The eyebrow, the headline and the "View all
 * portfolios" link are still written here because there is nowhere yet for an
 * editor to put them — they belong to the `portfolioGrid` block, which phase 4
 * builds along with the rest of §1.1's prop interface.
 */
export function PortfolioGrid({ projects }: { projects: PortfolioCardProps[] }) {
  return (
    <Section>
      <div className={`${section.blockHeading} ${section.blockHeadingSpaced}`}>
        <Sprig className={section.sprig} />
        <div className={section.subtitle}>
          Portfolio
          <br />
        </div>
        <h2 className={section.heading}>Event design to make your heart skip a beat</h2>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.grid} role="list">
          {projects.map((project) => (
            <PortfolioCard key={project.href} {...project} />
          ))}
        </div>
      </div>

      <SiteLink href="/portfolio" className={buttons.button}>
        View all portfolios
      </SiteLink>
    </Section>
  );
}
