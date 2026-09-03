import type { ReactNode } from "react";
import styles from "./Section.module.css";

/**
 * A page section: the padded band, and the 1200px column centred inside it.
 * `first` marks the section that opens the page body, whose leading space the
 * hero above it already carries.
 */
export function Section({ first, children }: { first?: boolean; children: ReactNode }) {
  return (
    <div className={first ? `${styles.section} ${styles.sectionFirst}` : styles.section}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
