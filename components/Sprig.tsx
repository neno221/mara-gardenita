"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { outQuad } from "@/lib/easing";

/**
 * The little olive sprig that sits above every section label. It tumbles in
 * from the upper left, overshoots, then settles level.
 */
export function Sprig({ className }: { className?: string }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    gsap.set(element, { x: -40, y: -24, rotate: 35, opacity: 0 });

    let timeline: gsap.core.Timeline | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          timeline = gsap.timeline();
          timeline
            .to(element, { opacity: 1, duration: 0.5, ease: outQuad }, 0.2)
            .to(element, { x: 6, y: -6, rotate: -9, duration: 0.7, ease: outQuad }, 0.2)
            .to(element, { x: 0, y: 0, rotate: 0, duration: 0.4, ease: outQuad }, 0.9);
        }
      },
      { threshold: 0 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      timeline?.kill();
    };
  }, []);

  return (
    <img
      ref={ref}
      src="/images/ornament-sprig.png"
      width={62}
      loading="lazy"
      alt=""
      className={className}
    />
  );
}
