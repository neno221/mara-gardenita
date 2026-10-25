import type { ReactNode } from "react";
import { SiteLink } from "./SiteLink";
import { Sprig } from "./Sprig";
import styles from "./HeroTop.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

type HeroTopProps = {
  subtitle: string;
  heading: string;
  /** A lede under the headline, where the page opens on prose rather than a link. */
  lede?: string;
  cta?: { label: string; href: string };
  /** Interior pages pull the closing rule in tight instead of letting it breathe. */
  tight?: boolean;
};

/**
 * The masthead block: hairline, sprig, label, headline, optional link, hairline.
 * Shared by the home hero — which hangs its photo collage underneath — and by
 * the interior pages, which stop here.
 */
export function HeroTop({
  subtitle,
  heading,
  lede,
  cta,
  tight = false,
}: HeroTopProps) {
  return (
    <div className={styles.heroTop}>
      <div className={styles.borderTop} />
      <Sprig className={section.sprig} />
      <div className={section.subtitle}>
        {subtitle}
        <br />
      </div>
      <h1 className={styles.headingHero}>{heading}</h1>
      {lede && <p className={`${section.paragraph} ${section.paragraphTight}`}>{lede}</p>}
      {cta && (
        <SiteLink href={cta.href} className={buttons.link}>
          {cta.label}
        </SiteLink>
      )}
      <div className={`${styles.borderDown} ${tight ? styles.borderDownTight : ""}`} />
    </div>
  );
}

/**
 * The banner band a page opens with. The home page hangs its photo collage
 * inside it below the masthead; interior pages stop at the headline and pull
 * the band closed behind it with `tight`.
 */
export function HeroSection({ tight, children }: { tight?: boolean; children: ReactNode }) {
  return (
    <div
      className={tight ? `${styles.sectionHero} ${styles.sectionHeroTight}` : styles.sectionHero}
    >
      <div className={section.content}>{children}</div>
    </div>
  );
}

/**
 * An interior page's masthead: the closed-up band with just the headline block.
 * `tight` is what this component *is*, so it is not the caller's to pass.
 */
export function PageMasthead(props: Omit<HeroTopProps, "tight">) {
  return (
    <HeroSection tight>
      <HeroTop {...props} tight />
    </HeroSection>
  );
}
