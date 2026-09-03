import { JOURNAL_POSTS } from "@/lib/journal";
import { JournalCard } from "./JournalCard";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import styles from "./JournalList.module.css";

export function JournalView() {
  return (
    <SiteShell>
      <PageMasthead subtitle="Blog" heading="Journal" />

      <Section first>
        <div className={styles.wrapper}>
          <div className={styles.list} role="list">
            {JOURNAL_POSTS.map((post) => (
              <JournalCard key={post.slug} {...post} />
            ))}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
