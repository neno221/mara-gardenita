import { SiteLink } from "./SiteLink";
import styles from "./ContactDetails.module.css";

export type ContactItem = { label: string; value: string; href?: string | null };

/** A label above each value. A new line in a value is a line break. */
export function ContactDetails({ items }: { items: ContactItem[] }) {
  return (
    <dl className={styles.list}>
      {items.map((item, index) => {
        const lines = item.value.split(/\r?\n/);
        const text = lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ));
        return (
          <div className={styles.item} key={index}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>
              {item.href ? <SiteLink href={item.href}>{text}</SiteLink> : text}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
