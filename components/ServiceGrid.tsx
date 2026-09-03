import type { Artwork } from "@/lib/artwork";
import { SiteLink } from "./SiteLink";
import { Section } from "./Section";
import styles from "./ServiceGrid.module.css";
import buttons from "./buttons.module.css";

const SERVICES_HREF = "/services/services-b";

export type ServiceSummary = {
  title: string;
  summary: string;
  /** The flower glyph, drawn 69 x 55. Single-source, so no `sizes` hint. */
  icon: Artwork;
};

/**
 * The three-up services summary on the home page.
 *
 * The services arrive as props rather than being imported (§1.1). What has *not*
 * moved is `SERVICES_HREF`: it still points at `/services/services-b`, which is
 * one of the dead links §1.4 inventories, and it stays dead until phase 4 turns
 * it into a Page relationship. Passing the hardcoded string down as a prop now
 * would move the deadness, not fix it.
 */
export function ServiceGrid({ services }: { services: ServiceSummary[] }) {
  return (
    <Section>
      <div className={styles.grid}>
        {services.map((service) => (
          <div className={styles.service} key={service.title}>
            <img {...service.icon} width={69} loading="lazy" alt="" className={styles.icon} />
            <SiteLink href={SERVICES_HREF} className={styles.titleLink}>
              <h4 className={styles.title}>{service.title}</h4>
            </SiteLink>
            <p className={styles.copy}>{service.summary}</p>
            <SiteLink href={SERVICES_HREF} className={buttons.link}>
              learn more
            </SiteLink>
          </div>
        ))}
      </div>
    </Section>
  );
}
