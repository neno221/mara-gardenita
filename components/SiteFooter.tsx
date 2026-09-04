import type { FooterProps } from "@/lib/chrome";
import { InstagramFeed } from "./InstagramFeed";
import { SiteLink } from "./SiteLink";
import styles from "./SiteFooter.module.css";
import section from "./Section.module.css";

/**
 * The band that closes every page.
 *
 * Everything in it was a const in this file: `FEED`, `SOCIAL`, `QUICK_LINKS`,
 * the wordmark's path and the credit. They are the Footer global and the
 * Instagram collection now, and the feed itself has moved out to
 * `InstagramFeed` — it is a widget two places print, not a part of the footer.
 *
 * With the feed gone this is no longer a client component. Nothing that remains
 * has state or a ref.
 *
 * The quick links are still the three `/template-info/*` paths the template
 * shipped, carried through `externalUrl` rather than deleted — see
 * [decision G](../docs/payload-plan.md). They 404, as they always have; the
 * difference is that removing them is now an edit rather than a commit.
 */
export function SiteFooter({
  instagramHeading,
  tiles,
  socialHeading,
  social,
  quickLinksHeading,
  quickLinks,
  logo,
  logoAlt,
  credit,
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={section.content}>
        <div className={styles.rule} />

        <InstagramFeed heading={instagramHeading} tiles={tiles} />

        <div className={styles.columns}>
          <div className={styles.column}>
            <h5>{socialHeading}</h5>
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className={`${styles.column} ${styles.columnDivided}`}>
            <h5>{quickLinksHeading}</h5>
            {quickLinks.map((item) => (
              <SiteLink key={item.label} href={item.href} className={styles.link}>
                {item.label}
              </SiteLink>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <img {...logo} loading="lazy" alt={logoAlt} className={styles.logo} />
          {credit && (
            <a href={credit.href} className={styles.link}>
              {credit.label}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
