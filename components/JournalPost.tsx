"use client";

import { useRef } from "react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Artwork } from "@/lib/artwork";
import { formatPublished } from "@/lib/dates";
import { useDriftingPhoto } from "@/lib/useDriftingPhoto";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { PageMasthead } from "./HeroTop";
import { RichText } from "./RichText";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import styles from "./JournalPost.module.css";
import photo from "./photo.module.css";

export type JournalPostProps = {
  title: string;
  published: string;
  excerpt: string;
  /** The full-bleed plate at the top, 1372 x 855. */
  hero: Artwork;
  body: SerializedEditorState;
};

/**
 * One journal entry.
 *
 * The body was hardcoded JSX — the same lorem for all four posts (§1.3) — and is
 * now the Lexical state on the document. `components/RichText` renders it
 * without a wrapper, so `<article>` still holds the paragraphs, headings,
 * blockquote, list and figures directly and `globals.css` styles them as the
 * bare elements it always did. Nothing in `JournalPost.module.css` changes.
 */
export function JournalPost({ title, published, excerpt, hero: plate, body }: JournalPostProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useRevealOnView(imageRef, 400);

  useDriftingPhoto(frameRef, frameRef, imageRef);

  const date = formatPublished(published);

  return (
    <SiteShell>
      <PageMasthead
        subtitle={date.printed}
        subtitleDateTime={date.machine}
        heading={title}
        lede={excerpt}
      />

      <Section first>
        <div className={photo.frame} ref={frameRef}>
          <img ref={imageRef} className={photo.fill} {...plate} loading="lazy" alt={title} />
        </div>

        <article className={styles.body}>
          <RichText data={body} />
        </article>
      </Section>
    </SiteShell>
  );
}
