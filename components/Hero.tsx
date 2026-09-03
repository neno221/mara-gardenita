"use client";

import { useRef } from "react";
import gsap from "gsap";
import { lerp } from "@/lib/easing";
import { ARTWORK, PETALS } from "@/lib/artwork";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { HeroSection, HeroTop } from "./HeroTop";
import styles from "./Hero.module.css";
import photo from "./photo.module.css";

export function Hero() {
  const collageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const frameLeftRef = useRef<HTMLDivElement>(null);
  const frameRightRef = useRef<HTMLDivElement>(null);
  const petalsBackRef = useRef<HTMLImageElement>(null);
  const petalsFrontRef = useRef<HTMLImageElement>(null);
  const leftImageRef = useRef<HTMLImageElement>(null);
  const rightImageRef = useRef<HTMLImageElement>(null);
  const centerImageRef = useRef<HTMLImageElement>(null);

  useRevealOnView(leftImageRef, 600);
  useRevealOnView(rightImageRef, 600);
  useRevealOnView(centerImageRef, 400);
  useRevealOnView(petalsBackRef, 200);
  useRevealOnView(petalsFrontRef, 200);

  // Every piece of the collage drifts at its own rate as the hero scrolls past.
  useScrollProgress(collageRef, { smoothing: 97, startsEntering: true, startOffset: 50 }, (p) => {
    const vh = window.innerHeight / 100;
    const zoom = { scale: lerp(1, 1.15, p) };

    for (const ref of [leftImageRef, rightImageRef, centerImageRef]) {
      if (ref.current) gsap.set(ref.current, zoom);
    }
    if (frameRef.current) {
      gsap.set(frameRef.current, { y: lerp(-1, 3, p) * vh });
    }
    if (frameLeftRef.current) {
      gsap.set(frameLeftRef.current, {
        xPercent: lerp(10, -30, p),
        y: lerp(-2, 6, p) * vh,
        rotate: lerp(-3, -12, p),
      });
    }
    if (frameRightRef.current) {
      gsap.set(frameRightRef.current, {
        xPercent: lerp(-10, 30, p),
        y: lerp(-2, 6, p) * vh,
        rotate: lerp(3, 12, p),
      });
    }
    if (petalsBackRef.current) {
      gsap.set(petalsBackRef.current, {
        xPercent: lerp(18, -18, p),
        y: lerp(-3, 6, p) * vh,
        rotate: lerp(-15, 17, p),
      });
    }
    if (petalsFrontRef.current) {
      gsap.set(petalsFrontRef.current, {
        y: lerp(-1, 6, p) * vh,
        rotate: lerp(20, 52, p),
      });
    }
  });

  return (
    <HeroSection>
      <HeroTop
        subtitle="Legendary parties"
        heading="Destination Wedding Planners & Event Designers"
        cta={{ label: "Book A Consult", href: "/contact" }}
      />

      <div className={styles.collage} ref={collageRef}>
        <div className={styles.collageInner}>
          <div className={styles.frameLeft} ref={frameLeftRef}>
            <img
              ref={leftImageRef}
              className={photo.fill}
              {...ARTWORK.heroLeft}
              loading="lazy"
              alt=""
            />
          </div>
          <div className={styles.frameRight} ref={frameRightRef}>
            <img
              ref={rightImageRef}
              className={photo.fill}
              {...ARTWORK.heroRight}
              loading="lazy"
              alt=""
            />
          </div>
          <div className={styles.frame} ref={frameRef}>
            <img
              ref={centerImageRef}
              className={photo.fill}
              {...ARTWORK.heroCenter}
              loading="lazy"
              alt=""
            />
          </div>
          <img
            ref={petalsBackRef}
            className={styles.petalsBack}
            src={PETALS.rose}
            loading="eager"
            alt=""
          />
          <img
            ref={petalsFrontRef}
            className={styles.petalsFront}
            src={PETALS.stem}
            loading="eager"
            alt=""
          />
        </div>
      </div>
    </HeroSection>
  );
}
