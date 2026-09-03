import { PROJECTS } from "@/lib/projects";
import { PortfolioCard } from "./PortfolioCard";
import { SiteLink } from "./SiteLink";
import { Sprig } from "./Sprig";
import { Section } from "./Section";
import styles from "./PortfolioGrid.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

export function PortfolioGrid() {
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
          {PROJECTS.map((project) => (
            <PortfolioCard key={project.slug} {...project} />
          ))}
        </div>
      </div>

      <SiteLink href="/portfolio" className={buttons.button}>
        View all portfolios
      </SiteLink>
    </Section>
  );
}
