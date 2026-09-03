"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";
import { outQuad } from "./easing";

/**
 * The paired hover move used by the portfolio and Instagram tiles: the frame
 * eases in a touch while the photograph inside it pushes out past the edges.
 */
export function useHoverZoom(
  frameRef: RefObject<HTMLElement | null>,
  imageRef: RefObject<HTMLElement | null>,
  { frameScale, imageScale }: { frameScale: number; imageScale: number },
) {
  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const settings = { duration: 0.7, ease: outQuad, overwrite: "auto" as const };
    const enter = () => {
      gsap.to(frame, { scale: frameScale, ...settings });
      gsap.to(image, { scale: imageScale, ...settings });
    };
    const leave = () => {
      gsap.to(frame, { scale: 1, ...settings });
      gsap.to(image, { scale: 1, ...settings });
    };

    frame.addEventListener("mouseenter", enter);
    frame.addEventListener("mouseleave", leave);
    frame.addEventListener("focusin", enter);
    frame.addEventListener("focusout", leave);
    return () => {
      frame.removeEventListener("mouseenter", enter);
      frame.removeEventListener("mouseleave", leave);
      frame.removeEventListener("focusin", enter);
      frame.removeEventListener("focusout", leave);
    };
  }, [frameRef, imageRef, frameScale, imageScale]);
}
