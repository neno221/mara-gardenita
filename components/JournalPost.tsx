"use client";

import { useRef } from "react";
import type { JournalPost as JournalPostData } from "@/lib/journal";
import { useDriftingPhoto } from "@/lib/useDriftingPhoto";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import styles from "./JournalPost.module.css";
import photo from "./photo.module.css";

export function JournalPost({ title, date, published, excerpt, hero: plate }: JournalPostData) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useRevealOnView(imageRef, 400);

  useDriftingPhoto(frameRef, frameRef, imageRef);

  return (
    <SiteShell>
      <PageMasthead
        subtitle={date}
        subtitleDateTime={published}
        heading={title}
        lede={excerpt}
      />

      <Section first>
        <div className={photo.frame} ref={frameRef}>
          <img ref={imageRef} className={photo.fill} {...plate} loading="lazy" alt={title} />
        </div>

        <article className={styles.body}>
          <p>
            Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo,
            rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis
            pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean
            vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae.
          </p>
          <h3>Aenean vulputate eleifend</h3>
          <p>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
            Donec pede justo, fringilla sociis natoque penatibus
          </p>
          <figure>
            <img src="/images/journal-post-figure-one.jpg" loading="lazy" alt="" />
          </figure>
          <p>
            Convallis dictum consequat amet ut et sed. Praesent netus id in vitae tristique id.
            Vitae diam ut adipiscing elit nunc vulputate. Adipiscing cras rutrum amet ultrices
            nibh duis. Sed velit euismod quis mollis. A dignissim a in aliquam pretium, accumsan.
          </p>
          <h3>Nulla consequat massa quis enim</h3>
          <p>
            Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet
            adipiscing sem neque sed ipsum. Nam quam nunc.
          </p>
          <blockquote>
            “Etiam lectus bibendum nam tortor, est posuere. Mauris tempus eget tempor nunc
            ultricies. Sem morbi volutpat.”
          </blockquote>
          <p>
            At hendrerit id mattis ut arcu, sociis ridiculus. Cras tempor, ante nunc, magna enim
            lectus. Ultrices consectetur eget lorem vitae sodales. Aliquet ipsum morbi proin
            blandit risus sagittis, enim. Risus ipsum, consectetur ultrices turpis sit in. Mauris
            id elementum odio lectus at netus amet. Aliquet non egestas massa, a, sit morbi tempor
            tortor, convallis. Lectus orci nunc diam arcu etiam pharetra mattis viverra gravida.
          </p>
          <figure>
            <img src="/images/journal-post-figure-two.jpg" loading="lazy" alt="" />
            <figcaption>
              Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
            </figcaption>
          </figure>
          <h3>Aliquam lorem ante, dapibus</h3>
          <p>
            Praesent placerat proin metus enim elementum, ultrices quis ut. Vehicula urna,
            scelerisque magnis nisi magna elit. Nulla etiam quisque sed suspendisse accumsan
          </p>
          <ul role="list">
            <li>In enim justo, rhoncus ut, imperdiet a, venenatis vitae.</li>
            <li>Nullam dictum felis eu pede mollis pretium.</li>
            <li>Integer tincidunt. Cras dapibus.</li>
            <li>Vivamus elementum semper nisi eleifend tellus</li>
          </ul>
          <p>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
            Nulla consequat massa quis enim.
          </p>
        </article>
      </Section>
    </SiteShell>
  );
}
