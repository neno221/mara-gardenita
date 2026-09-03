import { PROJECTS } from "@/lib/projects";
import { PortfolioCard } from "./PortfolioCard";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import styles from "./PortfolioList.module.css";

export function PortfolioView() {
  return (
    <SiteShell>
      <PageMasthead
        subtitle="Portfolio"
        heading="Event design to make your heart skip a beat"
      />

      <Section first>
        <div className={styles.wrapper}>
          <div className={styles.grid} role="list">
            {PROJECTS.map((project) => (
              <PortfolioCard key={project.slug} {...project} variant="feature" />
            ))}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
