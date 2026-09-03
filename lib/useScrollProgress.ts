"use client";

import { RefObject, useEffect, useRef } from "react";
import gsap from "gsap";

type ScrollProgressOptions = {
  /**
   * Damping applied to the raw progress, 0-100. Higher means the parallax
   * trails the scroll position further behind, which is what gives these
   * sections their slow, floating feel.
   */
  smoothing?: number;
  /** Begin measuring as the element enters the viewport rather than once it fills it. */
  startsEntering?: boolean;
  /** Extra head start, as a percentage of the element's own height. */
  startOffset?: number | null;
};

/**
 * Maps how far an element has travelled through the viewport onto a 0-1 value,
 * eased toward its target once per animation frame.
 *
 * `render` is called on every frame the value changes; keep it cheap and write
 * straight to the DOM rather than to React state.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { smoothing = 0, startsEntering = false, startOffset = null }: ScrollProgressOptions,
  render: (progress: number) => void,
) {
  const renderRef = useRef(render);
  // Kept in an effect rather than written during render, so a render React
  // throws away cannot leave a stale callback behind.
  useEffect(() => {
    renderRef.current = render;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderRef.current(0);
      return;
    }

    const damping = Math.max(1 - smoothing / 100, 0.01);
    let current = 0;
    let painted = -1;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const viewport = document.documentElement.clientHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const offset = (startOffset ?? 0) / 100;
      const head = startsEntering ? offset : 1 - offset;

      const origin = rect.top + Math.min(rect.height * head, viewport);
      const reach = rect.top + rect.height - origin;
      const span = Math.min(viewport + reach, documentHeight);
      if (span <= 0) return 0;

      return Math.min(Math.max(0, viewport - origin), span) / span;
    };

    const tick = () => {
      const target = measure();
      current += (target - current) * damping;
      if (Math.abs(target - current) < 0.00005) current = target;
      if (current === painted) return;
      painted = current;
      renderRef.current(current);
    };

    // Settle instantly on mount so the first paint is not mid-transition.
    current = measure();
    renderRef.current(current);

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [ref, smoothing, startsEntering, startOffset]);
}
