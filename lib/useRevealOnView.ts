"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";
import { easeInOut } from "./easing";

/**
 * Fades an element up from transparent the first time it crosses into view.
 * The staggered delays are what make the collages arrive one piece at a time.
 */
export function useRevealOnView(ref: RefObject<HTMLElement | null>, delay = 0) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    let tween: gsap.core.Tween | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          tween = gsap.to(element, {
            opacity: 1,
            duration: 0.8,
            delay: delay / 1000,
            ease: easeInOut,
          });
        }
      },
      { threshold: 0 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [ref, delay]);
}
