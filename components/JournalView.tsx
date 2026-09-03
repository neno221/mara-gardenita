import { artworkFrom } from "@/lib/media";
import { getPosts } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { JournalCard } from "./JournalCard";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { SiteShell } from "./SiteShell";
import styles from "./JournalList.module.css";

/**
 * `/blog`.
 *
 * Every card takes `SIZES.fullWidth`, which is the hint `lib/journal.ts` gave
 * all four. Three of them shipped with a 500w alternate and reproduce exactly;
 * `journal-napkin-fold-card` shipped bare and now gains one, because at 735w
 * Payload generates a real 500 and nothing in the file says it should not have.
 *
 * That is the phase-3 re-baseline the plan's phase-3 note opens and this repo
 * settles — see decision I in docs/payload-plan.md. Passing the hint per card
 * from a table of the ten filenames that happened to ship bare would meet the
 * gate, but it would hardcode an accident of the old export pipeline into the
 * render path, and phase 6 deletes `lib/artwork.ts` precisely to stop doing that.
 */
export async function JournalView() {
  const posts = await getPosts();

  return (
    <SiteShell>
      <PageMasthead subtitle="Blog" heading="Journal" />

      <Section first>
        <div className={styles.wrapper}>
          <div className={styles.list} role="list">
            {posts.map((post) => (
              <JournalCard
                key={post.slug}
                title={post.title}
                href={`/post/${post.slug}`}
                published={post.published}
                excerpt={post.excerpt}
                card={artworkFrom(post.card, SIZES.fullWidth)}
              />
            ))}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
