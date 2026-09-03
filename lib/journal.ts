import { responsive, type Artwork } from "./artwork";
import { SIZES } from "./sizes";

export type JournalPost = {
  slug: string;
  title: string;
  /** Printed as the eyebrow above the headline, on both the index and the post. */
  date: string;
  /** Machine-readable form of `date`, for the `<time>` element. */
  published: string;
  excerpt: string;
  /** The index card crop, 735 x 647. */
  card: Artwork;
  /** The full-bleed plate at the top of the post, 1372 x 855. */
  hero: Artwork;
};

/** Every card and plate is served at the same three breakpoints. */
const plate = (stem: string, alternates: number[], intrinsic: number): Artwork =>
  responsive(stem, alternates, intrinsic, SIZES.fullWidth);

/** The four entries, in the order the journal lists them. */
export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "napkin-fold-ideas-that-will-elevate-your-table",
    title: "Napkin fold ideas that will elevate your table",
    date: "August 7, 2021",
    published: "2021-08-07",
    excerpt:
      "Enim cursus posuere id commodo, et euismod lacus, aliquet quam. Dui eget suscipit nibh morbi. Bibendum congue cursus in nibh facilisis nulla mauris. ",
    // Shipped without alternates in the source library, so it stays single-source.
    card: { src: "/images/journal-napkin-fold-card.jpg" },
    hero: plate("journal-napkin-fold-hero", [1080], 1372),
  },
  {
    slug: "wedding-guest-list-tool-our-best-kept-secret",
    title: "Wedding guest list tool: Our best kept secret",
    date: "August 7, 2021",
    published: "2021-08-07",
    excerpt:
      "Urna diam non, consectetur imperdiet magna. Consequat orci luctus sagittis in. Id pellentesque nunc, viverra fringilla. Augue euismod et pulvinar.",
    card: plate("journal-guest-list-card", [500], 735),
    hero: plate("journal-guest-list-hero", [800, 1080], 1372),
  },
  {
    slug: "what-does-a-full-service-wedding-planner-do",
    title: "What does a full service wedding planner do?",
    date: "August 13, 2021",
    published: "2021-08-13",
    excerpt:
      "At varius mattis scelerisque erat a blandit. Metus senectus habitant consequat sed amet mi duis viverra egestas. Id potenti proin turpis in.",
    card: plate("journal-full-service-card", [500], 735),
    hero: plate("journal-full-service-hero", [1080], 1372),
  },
  {
    slug: "a-family-affair-how-to-plan-a-kid-friendly-wedding",
    title: "A Family Affair: how to plan a kid friendly wedding",
    date: "August 7, 2021",
    published: "2021-08-07",
    excerpt:
      "Euismod ornare elit neque sollicitudin vitae sapien sed consequat. Porttitor eu, bibendum congue convallis congue facilisis pretium sed. Sit diam sed.",
    card: plate("journal-family-affair-card", [500], 735),
    hero: plate("journal-family-affair-hero", [1080], 1372),
  },
];

export function findJournalPost(slug: string) {
  return JOURNAL_POSTS.find((post) => post.slug === slug);
}
