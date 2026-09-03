"use client";

import { useRef } from "react";
import { PORTFOLIO_ARTWORK, PORTFOLIO_PAGE_ARTWORK } from "@/lib/artwork";
import type { PortfolioProject } from "@/lib/projects";
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

export function PortfolioCard({
  name,
  slug,
  variant = "grid",
}: PortfolioProject & { variant?: PortfolioCardVariant }) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useHoverZoom(frameRef, imageRef, { frameScale: 0.95, imageScale: 1.15 });
  useRevealOnView(imageRef, 200);

  const feature = variant === "feature";
  const artwork = feature ? PORTFOLIO_PAGE_ARTWORK[slug] : PORTFOLIO_ARTWORK[slug];
  const Title = feature ? "h3" : "h5";
  const href = `/portfolio/${slug}`;

  return (
    <div className={styles.item} role="listitem">
      <SiteLink href={href} className={styles.frame} ref={frameRef}>
        <img
          ref={imageRef}
          className={`${styles.image} ${feature ? styles.imageTall : ""}`}
          {...artwork}
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
