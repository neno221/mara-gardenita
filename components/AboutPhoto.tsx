"use client";

import { useRef } from "react";
import type { Artwork } from "@/lib/artwork";
import { useDriftingPhoto } from "@/lib/useDriftingPhoto";
import { useRevealOnView } from "@/lib/useRevealOnView";
import styles from "./AboutPhoto.module.css";
import photo from "./photo.module.css";

type AboutPhotoProps = {
  image: Artwork;
  /** Staggers the fade so a row of tiles arrives one at a time. */
  delay: number;
};

/** One framed photograph on the about page, drifting inside its window. */
export function AboutPhoto({ image, delay }: AboutPhotoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useRevealOnView(imageRef, delay);
  useDriftingPhoto(frameRef, frameRef, imageRef);

  return (
    <div className={photo.frame} ref={frameRef}>
      <img ref={imageRef} className={styles.image} {...image} loading="lazy" alt="" />
    </div>
  );
}
