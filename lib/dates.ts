/**
 * The two forms of a publication date.
 *
 * `lib/journal.ts` carried them as two hand-written strings — `date: "August 7,
 * 2021"` and `published: "2021-08-07"` — which is one fact stored twice and kept
 * in sync by whoever edited it. Phase 3's Posts collection stores one timestamp,
 * so both forms are derived here instead.
 *
 * **UTC, deliberately.** The seed writes midnight UTC, and a browser west of
 * Greenwich formatting that in local time prints the day before. Pinning the
 * timezone is also what keeps the server render and the client hydration
 * agreeing on the same string, which a locale-sensitive default does not.
 */
const PRINTED = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export type PublishedDate = {
  /** "August 7, 2021" — the eyebrow above the headline. */
  printed: string;
  /** "2021-08-07" — the `<time datetime>` attribute. */
  machine: string;
};

export function formatPublished(iso: string): PublishedDate {
  const date = new Date(iso);
  return {
    printed: PRINTED.format(date),
    machine: date.toISOString().slice(0, 10),
  };
}
