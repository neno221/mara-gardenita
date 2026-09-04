"use client";

import { useRef } from "react";
import type { Artwork } from "@/lib/artwork";
import { useHoverZoom } from "@/lib/useHoverZoom";
import { useRevealOnView } from "@/lib/useRevealOnView";
import styles from "./InstagramFeed.module.css";
import section from "./Section.module.css";

export type InstagramTileData = {
  id: number;
  href: string;
  /**
   * The link's accessible name. Decision H: no tile on the published site has a
   * caption, and every one of them is an unlabelled link wrapping an `alt=""`
   * image — so the fallback is what everybody actually gets, and it has to say
   * something. The image stays decorative; the link is what carries the name.
   */
  label: string;
  image: Artwork;
};

function InstagramTile({ tile, dropped }: { tile: InstagramTileData; dropped: boolean }) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useHoverZoom(frameRef, imageRef, { frameScale: 0.9, imageScale: 1.2 });
  useRevealOnView(imageRef, 200);

  return (
    <a
      ref={frameRef}
      href={tile.href}
      target="_blank"
      rel="noreferrer"
      aria-label={tile.label}
      className={`${styles.instagramTile} ${dropped ? styles.instagramTileDropped : ""}`}
    >
      <img
        ref={imageRef}
        className={styles.instagramImage}
        {...tile.image}
        loading="lazy"
        alt=""
      />
    </a>
  );
}

/**
 * The scattered grid of Instagram tiles, every other one hanging lower.
 *
 * Lifted out of `SiteFooter` (§1.1), where it was six hardcoded filenames all
 * linking to the bare profile. It now reads the Instagram collection, and the
 * footer and the `instagramFeed` block print the same six tiles without either
 * one owning them.
 */
export function InstagramFeed({
  heading,
  tiles,
}: {
  heading: string;
  tiles: InstagramTileData[];
}) {
  return (
    <>
      <div className={section.blockHeading}>
        <h3 className={section.heading}>{heading}</h3>
      </div>

      <div className={styles.instagramGrid}>
        {tiles.map((tile, index) => (
          // Every other tile hangs lower, giving the row its scattered rhythm.
          <InstagramTile key={tile.id} tile={tile} dropped={index % 2 === 0} />
        ))}
      </div>
    </>
  );
}
