"use client";

import { useRef } from "react";
import gsap from "gsap";
import { lerp } from "@/lib/easing";
import { PETALS } from "@/lib/artwork";
import type { Service } from "@/lib/services";
import { useDriftingPhoto } from "@/lib/useDriftingPhoto";
import { useRevealOnView } from "@/lib/useRevealOnView";
import styles from "./ServicePanel.module.css";
import photo from "./photo.module.css";

/** Every image on this page fades in on the same 0.2s delay. */
const REVEAL_DELAY = 200;

type ServicePanelProps = {
  service: Service;
  /** Set on the panel in the narrow column, which hangs below the other two. */
  dropped?: boolean;
  /** Set on the closing panel, which spans both columns. */
  wide?: boolean;
  /** Set where petals drift behind the panel. */
  petals?: boolean;
};

/**
 * One service: a photograph that drifts against the scroll while the picture
 * inside it opens out past the crop, then the glyph, title and copy beneath.
 *
 * The progress is read off the whole panel rather than off the photograph, so
 * the picture keeps moving while the prose under it is still climbing the
 * screen — which is what carries the drift through the panel's full height.
 */
export function ServicePanel({ service, dropped, wide, petals }: ServicePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const petalsRef = useRef<HTMLImageElement>(null);

  useRevealOnView(imageRef, REVEAL_DELAY);
  useRevealOnView(petalsRef, REVEAL_DELAY);

  useDriftingPhoto(panelRef, frameRef, imageRef, (progress, vh) => {
    if (petalsRef.current) {
      // The petals travel further than the photograph and turn as they go.
      gsap.set(petalsRef.current, {
        xPercent: lerp(-10, 13, progress),
        y: lerp(-3, 6, progress) * vh,
        rotate: lerp(-20, 20, progress),
      });
    }
  });

  const panelClass = [styles.panel, dropped && styles.panelDropped, wide && styles.panelWide]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={panelClass} ref={panelRef}>
      <div className={photo.frame} ref={frameRef}>
        <img
          ref={imageRef}
          className={photo.fill}
          {...service.photo}
          loading="lazy"
          alt=""
        />
      </div>

      <div className={styles.block}>
        <div className={styles.heading}>
          <img
            src={service.icon}
            width={69}
            loading="lazy"
            alt=""
            className={styles.icon}
          />
          <h3 className={styles.title}>{service.title}</h3>
        </div>
        <p>
          {service.copy[0]}
          <br />
          <br />
          {service.copy[1]}
        </p>
      </div>

      {petals && (
        <img
          ref={petalsRef}
          src={PETALS.wide}
          loading="eager"
          alt=""
          className={styles.petals}
        />
      )}
    </div>
  );
}
