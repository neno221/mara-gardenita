"use client";

import { useRef } from "react";
import { useHoverZoom } from "@/lib/useHoverZoom";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { SiteLink } from "./SiteLink";
import styles from "./SiteFooter.module.css";
import section from "./Section.module.css";

const INSTAGRAM_URL = "https://www.instagram.com/";

const FEED = [1, 2, 3, 4, 5, 6];

const SOCIAL = [
  { label: "Instagram", href: INSTAGRAM_URL },
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "Twitter", href: "https://twitter.com/" },
];

const QUICK_LINKS = [
  { label: "Licensing", href: "/template-info/licensing" },
  { label: "Style Guide", href: "/template-info/style-guide" },
  { label: "Changelog", href: "/template-info/changelog" },
];

function InstagramTile({ index }: { index: number }) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useHoverZoom(frameRef, imageRef, { frameScale: 0.9, imageScale: 1.2 });
  useRevealOnView(imageRef, 200);

  // Every other tile hangs lower, giving the row its scattered rhythm.
  const dropped = index % 2 === 1;

  return (
    <a
      ref={frameRef}
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      className={`${styles.instagramTile} ${dropped ? styles.instagramTileDropped : ""}`}
    >
      <img
        ref={imageRef}
        className={styles.instagramImage}
        src={`/images/instagram-${index}.jpg`}
        loading="lazy"
        alt=""
      />
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={section.content}>
        <div className={styles.rule} />

        <div className={section.blockHeading}>
          <h3 className={section.heading}>Instagram</h3>
        </div>

        <div className={styles.instagramGrid}>
          {FEED.map((index) => (
            <InstagramTile key={index} index={index} />
          ))}
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h5>Social</h5>
            {SOCIAL.map((item) => (
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
            <h5>Quick Links</h5>
            {QUICK_LINKS.map((item) => (
              <SiteLink key={item.label} href={item.href} className={styles.link}>
                {item.label}
              </SiteLink>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <img src="/images/logo.svg" loading="lazy" alt="Loovio" className={styles.logo} />
          <a href="#" className={styles.link}>
            Made by Maxim W.
          </a>
        </div>
      </div>
    </footer>
  );
}
