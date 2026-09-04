import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "./RichText";
import styles from "./Prose.module.css";

type ProseProps = {
  /** The leaves drawing above the heading. Ornament, so it is a flag, not an upload. */
  ornament?: boolean | null;
  heading?: string | null;
  content: SerializedEditorState;
};

/**
 * A run of rich text, centred in a 720px column.
 *
 * Lifted out of `AboutView`, where each run was a hardcoded `<h3>` and one `<p>`
 * holding both paragraphs with `<br><br>` between them. Lexical stores two
 * paragraphs and emits two `<p>`; `Prose.module.css` carries the calibration
 * that makes the pair occupy the height the single one did.
 *
 * `RichText` renders without a wrapper, so the paragraphs are direct children of
 * `.prose` — which is what the `> p` selector in that stylesheet depends on, and
 * what keeps this block's DOM the shape the published page had.
 */
export function Prose({ ornament, heading, content }: ProseProps) {
  return (
    <div className={styles.prose}>
      {ornament && (
        <img
          src="/images/ornament-leaves.png"
          width={70}
          loading="lazy"
          alt=""
          className={styles.ornament}
        />
      )}
      {heading && <h3>{heading}</h3>}
      <RichText data={content} />
    </div>
  );
}
