"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Artwork } from "@/lib/artwork";
import { outQuad } from "@/lib/easing";
import { Sprig } from "./Sprig";
import { Section } from "./Section";
import styles from "./Testimonials.module.css";
import section from "./Section.module.css";

export type Quote = {
  /**
   * Without quotation marks. The stored text is what was said; the marks below
   * are how it is set, which is why the seed strips the template's typed pair
   * rather than importing them (decision B's one punctuation exception).
   */
  quote: string;
  signature: string;
  /** A petal cut-out. Single-source, so no `sizes` hint. */
  portrait: Artwork;
};

const FADE_DURATION = 0.6;

export function Testimonials({ quotes }: { quotes: Quote[] }) {
  const [index, setIndex] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previous = useRef(0);
  const touchStart = useRef<number | null>(null);

  // Cross-fade rather than slide: the outgoing quote dissolves under the new one.
  useEffect(() => {
    const from = slideRefs.current[previous.current];
    const to = slideRefs.current[index];
    previous.current = index;
    if (!to || from === to) return;

    gsap.killTweensOf([from, to].filter(Boolean) as HTMLDivElement[]);
    if (from) {
      gsap.to(from, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: outQuad,
        onComplete: () => {
          from.style.visibility = "hidden";
        },
      });
    }
    to.style.visibility = "visible";
    gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: FADE_DURATION, ease: outQuad });
  }, [index]);

  const step = useCallback((direction: number) => {
    setIndex((value) => (value + direction + quotes.length) % quotes.length);
  }, [quotes.length]);

  return (
    <Section>
      <div className={`${section.blockHeading} ${section.blockHeadingSpaced}`}>
        <Sprig className={section.sprig} />
        <div className={section.subtitle}>
          Testimonials
          <br />
        </div>
        <h2 className={section.heading}>What our clients say</h2>
      </div>

      <div
        className={styles.slider}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStart.current;
          touchStart.current = null;
          if (Math.abs(delta) > 40) step(delta < 0 ? 1 : -1);
        }}
      >
        <div className={styles.mask}>
          {quotes.map((item, i) => (
            <div
              key={item.signature}
              ref={(node) => {
                slideRefs.current[i] = node;
              }}
              className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
              role="group"
              aria-label={`${i + 1} of ${quotes.length}`}
              aria-hidden={i !== index}
            >
              <div className={styles.testimonial}>
                <img {...item.portrait} loading="lazy" alt="" className={styles.portrait} />
                <p className={styles.quote}>{`“${item.quote}”`}</p>
                <div className={styles.signature}>{item.signature}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.arrowButton} ${styles.arrowLeft}`}
          aria-label="Previous testimonial"
          onClick={() => step(-1)}
        >
          <img src="/images/arrow-left.png" width={23} loading="lazy" alt="" className={styles.arrow} />
        </button>
        <button
          type="button"
          className={`${styles.arrowButton} ${styles.arrowRight}`}
          aria-label="Next testimonial"
          onClick={() => step(1)}
        >
          <img src="/images/arrow-right.png" width={23} loading="lazy" alt="" className={styles.arrow} />
        </button>
      </div>
    </Section>
  );
}
