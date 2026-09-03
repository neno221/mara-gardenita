import { SERVICES } from "@/lib/services";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { ServicePanel } from "./ServicePanel";
import { SiteShell } from "./SiteShell";
import styles from "./ServicesView.module.css";

export function ServicesView() {
  const [weddings, eventDesign, branding] = SERVICES;

  return (
    <SiteShell>
      <PageMasthead subtitle="Services" heading="Our Services" />

      <Section first>
        <div className={styles.grid}>
          <ServicePanel service={weddings} />
          <ServicePanel service={eventDesign} dropped petals />
          <ServicePanel service={branding} wide />
        </div>
      </Section>
    </SiteShell>
  );
}
