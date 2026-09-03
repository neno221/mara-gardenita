"use client";

import { RefObject } from "react";
import gsap from "gsap";
import { lerp } from "./easing";
import { useScrollProgress } from "./useScrollProgress";

/**
 * The parallax every framed photograph on the site shares: the frame travels
 * four viewport-height percent against the scroll while the picture inside
 * pushes out past the crop, so the two never move at quite the same rate.
 *
 * `measureRef` is the element whose travel drives the progress. That is usually
 * the frame itself, but a service panel measures its whole height instead, so
 * the picture keeps drifting while the copy beneath it is still climbing the
 * screen. `extra` runs after the pair, for the petals that ride along with it.
 */
export function useDriftingPhoto(
  measureRef: RefObject<HTMLElement | null>,
  frameRef: RefObject<HTMLElement | null>,
  imageRef: RefObject<HTMLElement | null>,
  extra?: (progress: number, vh: number) => void,
) {
  useScrollProgress(measureRef, { smoothing: 97, startsEntering: true }, (progress) => {
    const vh = window.innerHeight / 100;
    if (frameRef.current) {
      gsap.set(frameRef.current, { y: lerp(-2, 2, progress) * vh });
    }
    if (imageRef.current) {
      gsap.set(imageRef.current, { scale: lerp(1, 1.15, progress) });
    }
    extra?.(progress, vh);
  });
}
