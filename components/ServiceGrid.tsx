import { SERVICES } from "@/lib/services";
import { SiteLink } from "./SiteLink";
import { Section } from "./Section";
import styles from "./ServiceGrid.module.css";
import buttons from "./buttons.module.css";

const SERVICES_HREF = "/services/services-b";

/** The three-up services summary on the home page. */
export function ServiceGrid() {
  return (
    <Section>
      <div className={styles.grid}>
        {SERVICES.map((service) => (
          <div className={styles.service} key={service.title}>
            <img src={service.icon} width={69} loading="lazy" alt="" className={styles.icon} />
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
