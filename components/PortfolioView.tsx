import { artworkFrom } from "@/lib/media";
import { getProjects } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { PortfolioCard } from "./PortfolioCard";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import styles from "./PortfolioList.module.css";

export async function PortfolioView() {
  const projects = await getProjects();

  return (
    <SiteShell>
      <PageMasthead
        subtitle="Portfolio"
        heading="Event design to make your heart skip a beat"
      />

      <Section first>
        <div className={styles.wrapper}>
          <div className={styles.grid} role="list">
            {projects.map((project) => (
              <PortfolioCard
                key={project.slug}
                name={project.name}
                href={`/portfolio/${project.slug}`}
                // The same photograph the home page's four-up grid renders, with
                // the two-up hint. The taller crop is `styles.imageTall` in
                // PortfolioCard.module.css, exactly as it was (decision D).
                image={artworkFrom(project.image, SIZES.portfolioList)}
                variant="feature"
              />
            ))}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
