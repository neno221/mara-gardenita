import type { Artwork } from "@/lib/artwork";
import type { ResolvedLink } from "@/lib/links";
import { SiteLink } from "./SiteLink";
import styles from "./ServiceGrid.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

export type ServiceSummary = {
  title: string;
  summary: string;
  /** The flower glyph, drawn 69 x 55. Single-source, so no `sizes` hint. */
  icon: Artwork;
};

type ServiceGridProps = {
  heading?: string;
  intro?: string;
  services: ServiceSummary[];
  /**
   * Printed on every card — once as the title's link, once as the button under
   * the blurb. It was `SERVICES_HREF`, a const pointing at
   * `/services/services-b`: one of the dead links §1.4 inventories, and dead
   * because it was a typed path. It is a Pages relationship now, resolved by
   * `hrefFor`, so it cannot point at a page that does not exist.
   */
  cta: ResolvedLink | null;
};

/**
 * The three-up services summary.
 *
 * The `<Section>` has been lifted out (§2): `RenderBlocks` owns all sectioning,
 * because the about page needs six blocks inside *one* band and a component that
 * brings its own cannot be put there. This one is banded `own`, so it looks
 * exactly as it did.
 */
export function ServiceGrid({ heading, intro, services, cta }: ServiceGridProps) {
  return (
    <>
      {(heading || intro) && (
        <div className={styles.intro}>
          {heading && <h2 className={section.heading}>{heading}</h2>}
          {intro && <p className={section.paragraph}>{intro}</p>}
        </div>
      )}
    <div className={styles.grid}>
      {services.map((service) => (
        <div className={styles.service} key={service.title}>
          <img {...service.icon} width={69} loading="lazy" alt="" className={styles.icon} />
          {cta ? (
            <SiteLink href={cta.href} className={styles.titleLink}>
              <h4 className={styles.title}>{service.title}</h4>
            </SiteLink>
          ) : (
            <h4 className={styles.title}>{service.title}</h4>
          )}
          <p className={styles.copy}>{service.summary}</p>
          {cta && (
            <SiteLink href={cta.href} className={buttons.link}>
              {cta.label}
            </SiteLink>
          )}
        </div>
      ))}
    </div>
    </>
  );
}
