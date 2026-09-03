"use client";

import { useRef } from "react";
import gsap from "gsap";
import { lerp } from "@/lib/easing";
import { PETALS, type Artwork } from "@/lib/artwork";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { SiteLink } from "./SiteLink";
import { Sprig } from "./Sprig";
import { Section } from "./Section";
import styles from "./StorySplit.module.css";
import photo from "./photo.module.css";
import section from "./Section.module.css";
import buttons from "./buttons.module.css";

type StorySplitProps = {
  eyebrow: string;
  heading: string;
  copy: string;
  cta: { label: string; href: string };
  image: Artwork;
  /** "tall" hangs off the lower-left corner, "wide" tucks into the lower-right. */
  petals: "tall" | "wide";
  /** Which column the artwork occupies on two-column layouts. */
  side: "left" | "right";
};

export function StorySplit({
  eyebrow,
  heading,
  copy,
  cta,
  image,
  petals,
  side,
}: StorySplitProps) {
  const figureRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const petalsRef = useRef<HTMLImageElement>(null);

  useRevealOnView(imageRef, 400);
  useRevealOnView(petalsRef, 200);

  // The frame tilts one way while the photo inside it slowly pushes in.
  useScrollProgress(figureRef, { smoothing: 97, startsEntering: true }, (p) => {
    const vh = window.innerHeight / 100;

    if (frameRef.current) {
      gsap.set(frameRef.current, { y: lerp(-3, 3, p) * vh, rotate: lerp(5, -5, p) });
    }
    if (imageRef.current) {
      gsap.set(imageRef.current, { scale: lerp(1, 1.15, p) });
    }
    if (petalsRef.current) {
      const drift =
        petals === "tall"
          ? { xPercent: lerp(-16, 24, p), y: lerp(-5, 5, p) * vh, rotate: lerp(-17, -52, p) }
          : { xPercent: lerp(5, -15, p), y: lerp(-5, 8, p) * vh, rotate: lerp(-15, 17, p) };
      gsap.set(petalsRef.current, drift);
    }
  });

  const artwork = (
    <div
      className={`${styles.figure} ${side === "right" ? styles.figureFirst : ""}`}
      ref={figureRef}
    >
      <div className={photo.frame} ref={frameRef}>
        <img ref={imageRef} className={photo.fill} {...image} loading="lazy" alt="" />
      </div>
      <img
        ref={petalsRef}
        className={petals === "tall" ? styles.petalsTall : styles.petalsWide}
        src={PETALS[petals]}
        loading="eager"
        alt=""
      />
    </div>
  );

  const prose = (
    <div className={styles.text}>
      <Sprig className={section.sprig} />
      <div className={section.subtitle}>
        {eyebrow}
        <br />
      </div>
      <h2 className={section.heading}>{heading}</h2>
      <p className={section.paragraph}>{copy}</p>
      <SiteLink href={cta.href} className={buttons.button}>
        {cta.label}
      </SiteLink>
    </div>
  );

  return (
    <Section>
      <div className={styles.grid}>
        {side === "left" ? (
          <>
            {artwork}
            {prose}
          </>
        ) : (
          <>
            {prose}
            {artwork}
          </>
        )}
      </div>
    </Section>
  );
}
