"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PETALS } from "@/lib/artwork";
import { outQuad } from "@/lib/easing";
import { Sprig } from "./Sprig";
import { Section } from "./Section";
import styles from "./Testimonials.module.css";
import section from "./Section.module.css";

const QUOTES = [
  {
    portrait: PETALS.rose,
    quote:
      "“Turpis nullam dictum semper non. Sit libero venenatis nec, id viverra adipiscing non ultrices volutpat. Eleifend mi augue mi auctor diam diam. Mattis elementum ullamcorper gravida id velit mauris adipiscing sed. Sollicitudin in laoreet etiam.”",
    signature: "Mr. & Mrs. Powell",
  },
  {
    portrait: PETALS.wide,
    quote:
      "“Donec tortor pellentesque morbi aliquam quis dui sem laoreet. Massa erat et vel malesuada ullamcorper elementum. Lobortis maecenas ullamcorper at mauris amet duis diam nascetur nunc. Dui facilisi integer eget amet aenean. Magna tincidunt justo, amet, dui tellus..”",
    signature: "Mr. & Mrs. Wilson",
  },
  {
    portrait: PETALS.tall,
    quote:
      "“Faucibus in vulputate et amet. Vulputate eget eget molestie lectus ultrices facilisis consequat. Neque purus nibh enim aenean. Velit sem rhoncus a arcu. Turpis id non faucibus nam nec, enim nisl. Sed eget quam sit ornare varius eu tristique malesuada. Pellentesque.”",
    signature: "Mr. & Mrs. Johnson",
  },
];

const FADE_DURATION = 0.6;

export function Testimonials() {
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
    setIndex((value) => (value + direction + QUOTES.length) % QUOTES.length);
  }, []);

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
          {QUOTES.map((item, i) => (
            <div
              key={item.signature}
              ref={(node) => {
                slideRefs.current[i] = node;
              }}
              className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
              role="group"
              aria-label={`${i + 1} of ${QUOTES.length}`}
              aria-hidden={i !== index}
            >
              <div className={styles.testimonial}>
                <img src={item.portrait} loading="lazy" alt="" className={styles.portrait} />
                <p className={styles.quote}>{item.quote}</p>
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
