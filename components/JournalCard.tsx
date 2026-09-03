"use client";

import { useRef } from "react";
import type { Artwork } from "@/lib/artwork";
import { formatPublished } from "@/lib/dates";
import { useHoverZoom } from "@/lib/useHoverZoom";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { SiteLink } from "./SiteLink";
import styles from "./JournalCard.module.css";
import photo from "./photo.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

export type JournalCardProps = {
  title: string;
  href: string;
  /**
   * One timestamp, not the `date`/`published` pair `lib/journal.ts` kept in sync
   * by hand. `formatPublished` derives both forms.
   */
  published: string;
  excerpt: string;
  /** The index crop, 735 x 647. */
  card: Artwork;
};

/**
 * One entry in the journal index: the photograph on the left, a white plate
 * overlapping its right edge carrying the date, headline and excerpt.
 */
export function JournalCard({ title, href, published, excerpt, card }: JournalCardProps) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useHoverZoom(frameRef, imageRef, { frameScale: 0.95, imageScale: 1.15 });
  useRevealOnView(imageRef, 200);

  const date = formatPublished(published);

  return (
    <div role="listitem">
      <div className={styles.grid}>
        <div className={styles.text}>
          <div className={styles.textInner}>
            <time className={section.subtitle} dateTime={date.machine}>
              {date.printed}
            </time>
            <h3 className={section.heading}>{title}</h3>
            <p className={`${section.paragraph} ${section.paragraphTight}`}>{excerpt}</p>
            <SiteLink href={href} className={buttons.link}>
              Read more
            </SiteLink>
          </div>
        </div>
        <div className={styles.imageCell}>
          <SiteLink href={href} className={styles.frame} ref={frameRef}>
            <img ref={imageRef} className={photo.fill} {...card} loading="lazy" alt={title} />
          </SiteLink>
        </div>
      </div>
    </div>
  );
}
