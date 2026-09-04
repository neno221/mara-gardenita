import { artworkFrom, type Upload } from "@/lib/media";
import styles from "./PressStrip.module.css";

type PressStripProps = {
  label: string;
  logos: { logo: Upload; name: string }[];
};

/**
 * The row of publication logos: a hairline with a label sitting on it, and the
 * logos beneath, divided by vertical rules.
 *
 * Lifted out of `AboutView`, where the six logos were a `PRESS` array of
 * filenames and the dividers were positional class names. The markup is
 * unchanged except for those class names — see `PressStrip.module.css` for what
 * replaced them and why an editable array made it necessary.
 *
 * The logos are decorative. They render `alt=""`, exactly as published: the
 * label above them already says what the row is, and six repetitions of
 * "Mimosa magazine logo" adds nothing a screen reader wants. The `name` field is
 * the row's label in the admin.
 */
export function PressStrip({ label, logos }: PressStripProps) {
  return (
    <>
      {/* The label rides on the rule, its own background punching the gap. */}
      <div className={styles.pressRule}>
        <div className={styles.pressLabel}>
          {label}
          <br />
        </div>
      </div>

      <div className={styles.pressGrid}>
        {logos.map(({ logo, name }) => (
          <div key={name} className={styles.press}>
            <img {...artworkFrom(logo)} loading="lazy" alt="" className={styles.pressLogo} />
          </div>
        ))}
      </div>
    </>
  );
}
