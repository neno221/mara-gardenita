"use client";

import { useRef } from "react";
import type { Artwork } from "@/lib/artwork";
import { useHoverZoom } from "@/lib/useHoverZoom";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { SiteLink } from "./SiteLink";
import styles from "./PortfolioCard.module.css";
import buttons from "./buttons.module.css";

/**
 * `grid` is the four-up tile on the home page; `feature` is the two-up tile on
 * `/portfolio`, which crops taller and sits its caption on a white plate.
 */
type PortfolioCardVariant = "grid" | "feature";

export type PortfolioCardProps = {
  name: string;
  href: string;
  /**
   * Already resolved, hint included. Decision D gives a Project one photograph
   * and lets the grid that renders it choose the slot width, so the card is
   * handed the finished `Artwork` rather than looking one up by slug — which is
   * what let two artwork tables exist for one set of files.
   */
  image: Artwork;
  variant?: PortfolioCardVariant;
};

export function PortfolioCard({ name, href, image, variant = "grid" }: PortfolioCardProps) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useHoverZoom(frameRef, imageRef, { frameScale: 0.95, imageScale: 1.15 });
  useRevealOnView(imageRef, 200);

  const feature = variant === "feature";
  const Title = feature ? "h3" : "h5";

  return (
    <div className={styles.item} role="listitem">
      <SiteLink href={href} className={styles.frame} ref={frameRef}>
        <img
          ref={imageRef}
          className={`${styles.image} ${feature ? styles.imageTall : ""}`}
          {...image}
          loading="lazy"
          alt={name}
        />
      </SiteLink>
      <div className={feature ? styles.captionPlate : styles.caption}>
        <SiteLink href={href} className={styles.titleLink}>
          <Title className={styles.title}>{name}</Title>
        </SiteLink>
        <SiteLink href={href} className={buttons.link}>
          learn more
        </SiteLink>
      </div>
    </div>
  );
}
