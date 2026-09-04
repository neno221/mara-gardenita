/**
 * Imports the published site into Payload (docs/payload-plan.md, phase 3).
 *
 *   npm run payload -- run scripts/seed.ts            # import what is missing
 *   npm run payload -- run scripts/seed.ts --force    # overwrite what is there
 *   npm run payload -- run scripts/seed.ts --only=posts
 *
 * **Every string is copied verbatim** (decision B). No placeholder scheme, no
 * find-and-replace: lorem in the CMS has to render identically to lorem in the
 * code, or the fingerprint diff stops measuring the migration and starts
 * measuring the copy edit. The two exceptions are stated where they happen — the
 * testimonials' typed quotation marks move to the component, and the journal's
 * paired `date`/`published` strings collapse into one timestamp.
 *
 * **Existing documents are skipped, not updated.** Decision C makes this Docker
 * volume the only copy of every edit anyone makes, so a seed that silently
 * rewrote a document an editor had touched would be a data-loss bug wearing the
 * word "idempotent". `--force` overwrites, and says so in the tally.
 */
import { readdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload, type Payload, type Where } from "payload";
import config from "../payload.config";
import type { Media } from "../payload-types";
import { bulletList, editorState, figure, heading, paragraph, quote } from "../lib/lexical";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const IMAGES = join(REPO, "public", "images");

const force = process.argv.includes("--force");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length).split(",") : null;
const wants = (step: string) => !only || only.includes(step);

let created = 0;
let skipped = 0;
let replaced = 0;

/* ------------------------------------------------------------------- media */

/**
 * The exports of the old build pipeline. Payload regenerates these from the
 * original, so uploading them would put four copies of every photograph in the
 * library and let an editor pick the 500px one for a full-bleed plate.
 */
const DERIVATIVE = /-(500|800|1080)\.(jpg|jpeg|png)$/i;

/** Which drawer a file belongs in, so the petal cut-outs stay out of a hero picker. */
function categoryOf(filename: string): Media["category"] {
  if (/^(ornament|petals)-/.test(filename)) return "ornament";
  if (/^(icon|press|arrow)-/.test(filename) || filename === "logo.svg") return "glyph";
  return "photography";
}

/**
 * The one caption in the library.
 *
 * §1.3: the spec calls Media's `caption` "optional, unused by current
 * components". It is neither — it is the `<figcaption>` under the second figure
 * in the journal body, and `components/RichText`'s upload converter reads it.
 */
const CAPTIONS: Record<string, string> = {
  "journal-post-figure-two.jpg":
    "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient",
};

/**
 * Uploads every original in `public/images` and returns the library by filename.
 *
 * Every file, not only the photographs the five collections reference: the press
 * logos, the site logo and the two ornaments have no collection until phase 4
 * gives them blocks, and uploading them now means phase 4 wires up fields rather
 * than going back for the assets. SVGs are safe to include — Payload's
 * `canResizeImage` excludes `image/svg+xml`, so they land whole with no
 * derivatives and no rasterisation.
 *
 * `alt` is empty on every document. The site's components already supply their
 * own alt text where they have any — `alt={project.name}` on a portfolio card,
 * `alt={post.title}` on a journal plate — and the rest are decorative by design.
 * A generated alt here would be worse than none: invented, and rendered.
 */
async function seedMedia(payload: Payload): Promise<Map<string, Media>> {
  const files = readdirSync(IMAGES)
    .filter((file) => [".jpg", ".jpeg", ".png", ".svg"].includes(extname(file).toLowerCase()))
    .filter((file) => !DERIVATIVE.test(file))
    .sort();

  const { docs: existing } = await payload.find({
    collection: "media",
    where: { filename: { in: files } },
    limit: files.length,
    depth: 0,
  });
  const library = new Map(existing.map((doc) => [doc.filename as string, doc]));

  for (const filename of files) {
    const data = {
      alt: "",
      caption: CAPTIONS[filename],
      category: categoryOf(filename),
    };

    const found = library.get(filename);
    if (found && !force) {
      skipped++;
      continue;
    }
    if (found) {
      // The file is replaced too, not only the fields: a --force run exists to
      // rebuild the library, and keeping the old derivatives behind a new
      // original would make the srcSet a mix of two uploads.
      const doc = await payload.update({
        collection: "media",
        id: found.id,
        filePath: join(IMAGES, filename),
        data,
      });
      library.set(filename, doc);
      replaced++;
      continue;
    }

    const doc = await payload.create({
      collection: "media",
      filePath: join(IMAGES, filename),
      data,
    });
    library.set(filename, doc);
    created++;
  }

  console.log(`  media           ${files.length} originals`);
  return library;
}

/* ------------------------------------------------------------- the content */

/** Looks a photograph up, and fails loudly rather than seeding a broken relationship. */
function mediaId(library: Map<string, Media>, filename: string): number {
  const doc = library.get(filename);
  if (!doc) throw new Error(`${filename} is not in the library — was public/images pruned?`);
  return doc.id;
}

type ContentSlug = "pages" | "projects" | "posts" | "services" | "testimonials" | "instagram";

/**
 * Creates a document unless one already answers to `where`.
 *
 * The natural key is the slug, the signature, the title — never the numeric id,
 * which changes on every rebuild. That is what lets a `--force` run land on the
 * same rows rather than doubling the collection.
 */
async function upsert(
  payload: Payload,
  collection: ContentSlug,
  where: Where,
  data: Record<string, unknown>,
): Promise<void> {
  const { docs } = await payload.find({ collection, where, limit: 1, depth: 0 });
  const found = docs[0];

  if (found && !force) {
    skipped++;
    return;
  }
  if (found) {
    await payload.update({ collection, id: found.id, data: data as never });
    replaced++;
    return;
  }
  await payload.create({ collection, data: data as never });
  created++;
}

/**
 * `upsert` for Pages, which needs the id back.
 *
 * Every CTA on the home page is a relationship to another Pages document, so
 * the other five pages are seeded first and `home` last — the only ordering
 * constraint in the file, and the reason this returns an id at all.
 */
async function upsertPage(
  payload: Payload,
  slug: string,
  data: Record<string, unknown>,
): Promise<number> {
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const found = docs[0];

  if (found && !force) {
    skipped++;
    return found.id;
  }
  if (found) {
    const doc = await payload.update({ collection: "pages", id: found.id, data: data as never });
    replaced++;
    return doc.id;
  }
  const doc = await payload.create({ collection: "pages", data: data as never });
  created++;
  return doc.id;
}

/**
 * A seeded collection, keyed by the natural key the blocks name it with.
 *
 * The relationship arrays on `serviceGrid`, `portfolioGrid` and `testimonials`
 * store their own order, so they are built from the published tables above
 * rather than from whatever order a query returns — the order *is* the layout,
 * and reading it back would make the seed depend on a sort it also sets.
 */
async function keyed(
  payload: Payload,
  collection: ContentSlug,
  field: string,
): Promise<Map<string, number>> {
  const { docs } = await payload.find({ collection, limit: 100, depth: 0 });
  return new Map(
    docs.map((doc) => [String((doc as unknown as Record<string, unknown>)[field]), doc.id]),
  );
}

/** A related document's id, or a loud failure naming what is missing. */
function relatedId(index: Map<string, number>, key: string, what: string): number {
  const id = index.get(key);
  if (id === undefined) {
    throw new Error(
      `No ${what} answers to "${key}". Seed the collections before the pages: ` +
        "npm run seed",
    );
  }
  return id;
}

/** `lib/services.ts`, whose `[string, string]` copy tuple becomes two paragraphs. */
const SERVICES = [
  {
    title: "Weddings",
    icon: "icon-service-weddings.png",
    photo: "service-weddings.jpg",
    summary:
      "Adipiscing mauris sed metus dictum eget morbi aliquet. Sit neque tempus eget dictum velit tristique.",
    copy: [
      "Purus quam elit, ligula morbi facilisis. Nisl id nisi, mattis eget elit etiam risus commodo, congue. Vitae placerat tincidunt adipiscing id porta sed. Gravida nulla mi felis gravida odio.",
      "Aliquam morbi in euismod aliquet pretium. Augue bibendum proin tempus non, massa aliquet. Egestas nisi ultrices curabitur.",
    ],
  },
  {
    title: "Event Design",
    icon: "icon-service-event-design.png",
    photo: "service-event-design.jpg",
    summary:
      "Lectus sit turpis iaculis eu non sed turpis suscipit facilisi. Lorem morbi non morbi id aliquam. Urna adipiscing odio.",
    copy: [
      "Tincidunt lacus, adipiscing sed dictum turpis gravida arcu. Odio scelerisque commodo eu tincidunt odio pulvinar ullamcorper sit gravida. Nunc dui nunc, nulla sed convallis sed. Dictum venenatis facilisis ac adipiscing",
      "Aliquam suspendisse condimentum lobortis in. Augue vulputate egestas in porta fermentum nunc id arcu ultricies.",
    ],
  },
  {
    title: "Branding",
    icon: "icon-service-branding.png",
    photo: "service-branding.jpg",
    summary:
      "Tristique sodales consectetur lectus feugiat molestie. Condimentum eu faucibus dictum adipiscing.",
    copy: [
      "Viverra commodo eget amet ut. Nisl velit scelerisque malesuada commodo ullamcorper integer. Et vestibulum morbi.",
      "Lobortis faucibus tortor sed amet, cras. Fringilla orci cras eget consequat, ut viverra sed. Ornare faucibus nibh eget id euismod viverra ut porttitor. Augue consectetur elit consectetur nisl, et vel. Libero tellus dolor nibh diam.",
    ],
  },
] as const;

/**
 * The `QUOTES` array in `Testimonials.tsx`, **without** its typed quotation
 * marks — the component prints those, so an editor cannot store a quote that
 * renders with two opening marks or none.
 *
 * The second quote ends `dui tellus..` before its closing mark. That is in the
 * template, and decision B says it stays.
 */
const TESTIMONIALS = [
  {
    signature: "Mr. & Mrs. Powell",
    portrait: "petals-rose.png",
    quote:
      "Turpis nullam dictum semper non. Sit libero venenatis nec, id viverra adipiscing non ultrices volutpat. Eleifend mi augue mi auctor diam diam. Mattis elementum ullamcorper gravida id velit mauris adipiscing sed. Sollicitudin in laoreet etiam.",
  },
  {
    signature: "Mr. & Mrs. Wilson",
    portrait: "petals-wide.png",
    quote:
      "Donec tortor pellentesque morbi aliquam quis dui sem laoreet. Massa erat et vel malesuada ullamcorper elementum. Lobortis maecenas ullamcorper at mauris amet duis diam nascetur nunc. Dui facilisi integer eget amet aenean. Magna tincidunt justo, amet, dui tellus..",
  },
  {
    signature: "Mr. & Mrs. Johnson",
    portrait: "petals-tall.png",
    quote:
      "Faucibus in vulputate et amet. Vulputate eget eget molestie lectus ultrices facilisis consequat. Neque purus nibh enim aenean. Velit sem rhoncus a arcu. Turpis id non faucibus nam nec, enim nisl. Sed eget quam sit ornare varius eu tristique malesuada. Pellentesque.",
  },
] as const;

/** `lib/projects.ts`, in the order the template lists them. */
const PROJECTS = [
  { name: "Jennifer & Oliver", slug: "jennifer-oliver" },
  { name: "Briana & Richard", slug: "briana-richard" },
  { name: "Anne & Cameron", slug: "anne-cameron" },
  { name: "Linda & Charles", slug: "linda-charles" },
] as const;

/**
 * `lib/journal.ts`, with `date` and `published` collapsed into one timestamp.
 *
 * Midnight UTC, and `JournalCard` formats it in UTC too. A local-timezone render
 * of `2021-08-07T00:00:00Z` west of Greenwich prints "August 6".
 *
 * The first excerpt ends with a trailing space. That is in the template.
 */
const POSTS = [
  {
    slug: "napkin-fold-ideas-that-will-elevate-your-table",
    title: "Napkin fold ideas that will elevate your table",
    published: "2021-08-07T00:00:00.000Z",
    excerpt:
      "Enim cursus posuere id commodo, et euismod lacus, aliquet quam. Dui eget suscipit nibh morbi. Bibendum congue cursus in nibh facilisis nulla mauris. ",
    card: "journal-napkin-fold-card.jpg",
    hero: "journal-napkin-fold-hero.jpg",
  },
  {
    slug: "wedding-guest-list-tool-our-best-kept-secret",
    title: "Wedding guest list tool: Our best kept secret",
    published: "2021-08-07T00:00:00.000Z",
    excerpt:
      "Urna diam non, consectetur imperdiet magna. Consequat orci luctus sagittis in. Id pellentesque nunc, viverra fringilla. Augue euismod et pulvinar.",
    card: "journal-guest-list-card.jpg",
    hero: "journal-guest-list-hero.jpg",
  },
  {
    slug: "what-does-a-full-service-wedding-planner-do",
    title: "What does a full service wedding planner do?",
    published: "2021-08-13T00:00:00.000Z",
    excerpt:
      "At varius mattis scelerisque erat a blandit. Metus senectus habitant consequat sed amet mi duis viverra egestas. Id potenti proin turpis in.",
    card: "journal-full-service-card.jpg",
    hero: "journal-full-service-hero.jpg",
  },
  {
    slug: "a-family-affair-how-to-plan-a-kid-friendly-wedding",
    title: "A Family Affair: how to plan a kid friendly wedding",
    published: "2021-08-07T00:00:00.000Z",
    excerpt:
      "Euismod ornare elit neque sollicitudin vitae sapien sed consequat. Porttitor eu, bibendum congue convallis congue facilisis pretium sed. Sit diam sed.",
    card: "journal-family-affair-card.jpg",
    hero: "journal-family-affair-hero.jpg",
  },
] as const;

/**
 * The journal body, converted once and planted on all four posts (§1.3).
 *
 * `JournalPost.tsx` renders this same markup for every post — the spec's
 * "convert the journal post bodies into Lexical" is converting one body. Each
 * paragraph below is a JSX text run with its newlines collapsed to single
 * spaces, which is what the browser receives today.
 *
 * The figure node ids are derived from the filename rather than random, so that
 * re-running the seed produces byte-identical JSON.
 */
function journalBody(library: Map<string, Media>) {
  return editorState([
    paragraph(
      "Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae.",
    ),
    heading("h3", "Aenean vulputate eleifend"),
    paragraph(
      "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Donec pede justo, fringilla sociis natoque penatibus",
    ),
    figure(mediaId(library, "journal-post-figure-one.jpg"), "figure-one"),
    paragraph(
      "Convallis dictum consequat amet ut et sed. Praesent netus id in vitae tristique id. Vitae diam ut adipiscing elit nunc vulputate. Adipiscing cras rutrum amet ultrices nibh duis. Sed velit euismod quis mollis. A dignissim a in aliquam pretium, accumsan.",
    ),
    heading("h3", "Nulla consequat massa quis enim"),
    paragraph(
      "Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc.",
    ),
    quote(
      "“Etiam lectus bibendum nam tortor, est posuere. Mauris tempus eget tempor nunc ultricies. Sem morbi volutpat.”",
    ),
    paragraph(
      "At hendrerit id mattis ut arcu, sociis ridiculus. Cras tempor, ante nunc, magna enim lectus. Ultrices consectetur eget lorem vitae sodales. Aliquet ipsum morbi proin blandit risus sagittis, enim. Risus ipsum, consectetur ultrices turpis sit in. Mauris id elementum odio lectus at netus amet. Aliquet non egestas massa, a, sit morbi tempor tortor, convallis. Lectus orci nunc diam arcu etiam pharetra mattis viverra gravida.",
    ),
    figure(mediaId(library, "journal-post-figure-two.jpg"), "figure-two"),
    heading("h3", "Aliquam lorem ante, dapibus"),
    paragraph(
      "Praesent placerat proin metus enim elementum, ultrices quis ut. Vehicula urna, scelerisque magnis nisi magna elit. Nulla etiam quisque sed suspendisse accumsan",
    ),
    bulletList([
      "In enim justo, rhoncus ut, imperdiet a, venenatis vitae.",
      "Nullam dictum felis eu pede mollis pretium.",
      "Integer tincidunt. Cras dapibus.",
      "Vivamus elementum semper nisi eleifend tellus",
    ]),
    paragraph(
      "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.",
    ),
  ]);
}

/**
 * Six tiles, a day apart, so `-addedAt` prints `instagram-1` … `instagram-6`.
 *
 * The dates are fixed rather than relative to now: a seed whose sort key depends
 * on when it ran is a seed that reproduces a different order tomorrow.
 */
const INSTAGRAM_EPOCH = Date.UTC(2021, 7, 1, 12, 0, 0);
const DAY = 86_400_000;
const INSTAGRAM_URL = "https://www.instagram.com/";

/* ------------------------------------------------------------- the pages */

/**
 * The about page's two prose runs.
 *
 * Each was one `<p>` holding both halves with `<br><br>` between them; Lexical
 * stores two paragraphs. The trailing space the first run carried before its
 * break is dropped — it sits at the end of a paragraph, where it renders
 * nothing and only shows up as invisible whitespace in the admin. Everything
 * that a reader can see is verbatim.
 */
const ABOUT_PROSE = [
  {
    heading: "Who we are",
    paragraphs: [
      "Gravida accumsan cras arcu hac vestibulum viverra. Ridiculus ut tincidunt accumsan id etiam sed posuere. Cursus tortor imperdiet urna ipsum. Lacus at cras enim arcu feugiat ac felis orci nunc. Ac purus ut auctor faucibus. Egestas scelerisque ornare posuere sed adipiscing mauris congue viverra sit.",
      "Ac quisque quis id amet, odio mauris faucibus fames. Sagittis semper laoreet fusce ac velit vulputate est. Urna tempus in vitae risus sed nascetur aliquet. Faucibus nascetur nibh. Cursus purus ut auctor faucibus ornare posuere.",
    ],
  },
  {
    heading: "Our process",
    paragraphs: [
      "Feugiat massa in consectetur ac, quis amet nulla. Ac purus massa quis massa et. Amet, nisi, neque augue habitasse semper tempor ultricies. Massa sed in elit, commodo. Scelerisque turpis aliquam, urna aenean.",
      "At vel dui egestas eget et sodales. Dis nisl adipiscing pulvinar sit dolor diam sit gravida leo. Ut sed eu, felis sed odio. Scelerisque fringilla sed viverra consectetur sagittis, nisl id nunc vestibulum. In viverra diam quis ut nibh lorem aliquet sagittis, vehicula. Gravida suscipit malesuada elementum pharetra pharetra. Ut et auctor ultrices non.",
    ],
  },
] as const;

/** The six logos, in the order the dividers were written for. */
const PRESS = ["mimosa", "iris", "orion", "sigma", "pristin", "polaris"] as const;

/** Each row fades in a tile at a time, 0.2s apart — `STAGGER` in `AboutView`. */
const STAGGER = 200;

/**
 * The address on the contact page.
 *
 * The one string in this file with no source. Decision A adds a contact page
 * the template never had, so there is nothing to copy verbatim and something
 * has to stand in the place a real address goes. Named here rather than buried
 * in the layout so whoever has the real one knows where to put it.
 */
const CONTACT_EMAIL = "hello@loovio.com";

/* ------------------------------------------------------------ the globals */

const SOCIAL = [
  { label: "Instagram", url: INSTAGRAM_URL },
  { label: "Facebook", url: "https://www.facebook.com/" },
  { label: "Twitter", url: "https://twitter.com/" },
] as const;

/**
 * Decision G, seeded rather than dropped.
 *
 * `/template-info/licensing`, `/style-guide` and `/changelog` are dead and
 * always were; the plan's phase 4 leaves them dead, and this is where they
 * survive as `externalUrl` values instead of typed paths in `SiteFooter.tsx`.
 * The escape hatch is the point: deleting them is now a row an editor removes.
 */
const QUICK_LINKS = [
  { label: "Licensing", externalUrl: "/template-info/licensing" },
  { label: "Style Guide", externalUrl: "/template-info/style-guide" },
  { label: "Changelog", externalUrl: "/template-info/changelog" },
] as const;

/* --------------------------------------------------------------------- run */

const payload = await getPayload({ config });

console.log(`\nSeeding${force ? "  (--force: existing documents are overwritten)" : ""}\n`);

const library = await seedMedia(payload);

if (wants("services")) {
  for (const [index, service] of SERVICES.entries()) {
    await upsert(
      payload,
      "services",
      { title: { equals: service.title } },
      {
        title: service.title,
        icon: mediaId(library, service.icon),
        photo: mediaId(library, service.photo),
        summary: service.summary,
        copy: editorState(service.copy.map((text) => paragraph(text))),
        order: index,
      },
    );
  }
  console.log(`  services        ${SERVICES.length}`);
}

if (wants("testimonials")) {
  for (const [index, item] of TESTIMONIALS.entries()) {
    await upsert(
      payload,
      "testimonials",
      { signature: { equals: item.signature } },
      {
        quote: item.quote,
        signature: item.signature,
        portrait: mediaId(library, item.portrait),
        order: index,
      },
    );
  }
  console.log(`  testimonials    ${TESTIMONIALS.length}`);
}

if (wants("projects")) {
  for (const [index, project] of PROJECTS.entries()) {
    await upsert(
      payload,
      "projects",
      { slug: { equals: project.slug } },
      {
        name: project.name,
        slug: project.slug,
        image: mediaId(library, `portfolio-${project.slug}.jpg`),
        // Empty: the template shipped no detail-page copy, and decision B forbids
        // inventing any. Phase 4 builds the route that would render it.
        body: [],
        order: index,
        _status: "published",
      },
    );
  }
  console.log(`  projects        ${PROJECTS.length}`);
}

if (wants("posts")) {
  const body = journalBody(library);
  for (const [index, post] of POSTS.entries()) {
    await upsert(
      payload,
      "posts",
      { slug: { equals: post.slug } },
      {
        title: post.title,
        slug: post.slug,
        published: post.published,
        excerpt: post.excerpt,
        card: mediaId(library, post.card),
        hero: mediaId(library, post.hero),
        body,
        order: index,
        _status: "published",
      },
    );
  }
  console.log(`  posts           ${POSTS.length}  (one body, planted four times)`);
}

if (wants("instagram")) {
  for (let tile = 1; tile <= 6; tile++) {
    const image = mediaId(library, `instagram-${tile}.jpg`);
    await upsert(
      payload,
      "instagram",
      { image: { equals: image } },
      {
        image,
        // Decision H: there is no source data for either field. The profile URL is
        // where every tile points today; the caption stays empty.
        postUrl: INSTAGRAM_URL,
        addedAt: new Date(INSTAGRAM_EPOCH - (tile - 1) * DAY).toISOString(),
      },
    );
  }
  console.log("  instagram       6  (backdated a day apart, newest first)");
}

if (wants("pages")) {
  const services = await keyed(payload, "services", "title");
  const projects = await keyed(payload, "projects", "slug");
  const quotes = await keyed(payload, "testimonials", "signature");

  const serviceIds = SERVICES.map((item) => relatedId(services, item.title, "service"));
  const projectIds = PROJECTS.map((item) => relatedId(projects, item.slug, "project"));
  const quoteIds = TESTIMONIALS.map((item) => relatedId(quotes, item.signature, "testimonial"));

  /** The carousel, which the home and about pages both print — spec §6's reuse case. */
  const testimonialsBlock = {
    blockType: "testimonials",
    eyebrow: "Testimonials",
    heading: "What our clients say",
    quotes: quoteIds,
  };

  const photoRow = (filenames: string[]) => ({
    blockType: "photoRow",
    photos: filenames.map((filename) => mediaId(library, filename)),
    stagger: STAGGER,
  });

  /* Everything but home first: nothing on those five points at another page. */

  const about = await upsertPage(payload, "about", {
    title: "About",
    slug: "about",
    _status: "published",
    meta: {
      title: "About — Loovio",
      description:
        "Who we are and how we work: the studio behind Loovio's weddings and celebrations, from first concept through to the last table setting.",
    },
    layout: [
      {
        blockType: "masthead",
        eyebrow: "who we are",
        heading: "About Lovio",
        lede: "Metus ultricies ut at faucibus. Fames eget imperdiet sit ipsum pellentesque pretium. Adipiscing egestas tellus eu imperdiet pellentesque orci.",
      },
      // Six `shared` blocks, which RenderBlocks coalesces into one <Section>.
      // This is the sequence §2 of the plan is written around.
      photoRow(["about-lace-gown.jpg", "about-poppy-field.jpg", "about-florists.jpg"]),
      {
        blockType: "prose",
        ornament: true,
        heading: ABOUT_PROSE[0].heading,
        content: editorState(ABOUT_PROSE[0].paragraphs.map((text) => paragraph(text))),
      },
      photoRow(["about-golden-field.jpg", "about-veil-kiss.jpg"]),
      {
        blockType: "prose",
        ornament: true,
        heading: ABOUT_PROSE[1].heading,
        content: editorState(ABOUT_PROSE[1].paragraphs.map((text) => paragraph(text))),
      },
      {
        blockType: "pressStrip",
        label: "Featured in",
        logos: PRESS.map((name) => ({ logo: mediaId(library, `press-${name}.svg`), name })),
      },
      photoRow(["about-hat-box.jpg", "about-bride-tulle.jpg", "about-lemon-cake.jpg"]),
      testimonialsBlock,
    ],
  });

  const servicesPage = await upsertPage(payload, "services", {
    title: "Services",
    slug: "services",
    _status: "published",
    meta: {
      title: "Services — Loovio",
      description:
        "What we take on: weddings, event design and branding, from the first conversation through to the day itself.",
    },
    layout: [
      { blockType: "masthead", eyebrow: "Services", heading: "Our Services" },
      {
        blockType: "servicePanels",
        // The three booleans are properties of a position, not of a service —
        // the second panel drops and carries petals, the third spans both
        // columns. They were written into `ServicesView`'s JSX; they are the
        // layout now, which is what lets a fourth service land somewhere.
        panels: [
          { service: serviceIds[0] },
          { service: serviceIds[1], dropped: true, petals: true },
          { service: serviceIds[2], wide: true },
        ],
      },
    ],
  });

  const portfolio = await upsertPage(payload, "portfolio", {
    title: "Portfolio",
    slug: "portfolio",
    _status: "published",
    meta: {
      title: "Portfolio — Loovio",
      description:
        "Weddings and celebrations designed by Loovio, from first concept through to the last table setting.",
    },
    layout: [
      {
        blockType: "masthead",
        eyebrow: "Portfolio",
        heading: "Event design to make your heart skip a beat",
      },
      // An index, not a selection: a project added next year appears here
      // without anyone editing this page.
      { blockType: "portfolioList", showAll: true },
    ],
  });

  await upsertPage(payload, "blog", {
    title: "Journal",
    slug: "blog",
    _status: "published",
    meta: {
      title: "Journal — Loovio",
      description:
        "Notes from the Loovio studio on planning, styling and hosting a wedding worth remembering.",
    },
    layout: [
      { blockType: "masthead", eyebrow: "Blog", heading: "Journal" },
      { blockType: "journalList", mode: "latest" },
    ],
  });

  // Decision A's new page. The hero's "Book A Consult" has pointed at /contact
  // since the template shipped; this is the first time the link resolves.
  const contact = await upsertPage(payload, "contact", {
    title: "Contact",
    slug: "contact",
    _status: "published",
    meta: {
      title: "Contact — Loovio",
      description: "Talk to Loovio about planning and designing your celebration.",
    },
    layout: [
      { blockType: "masthead", eyebrow: "Contact", heading: "Get in touch" },
      { blockType: "prose", ornament: true, content: editorState([paragraph(CONTACT_EMAIL)]) },
    ],
  });

  /* Then home, whose four CTAs point at four of the pages above. */

  await upsertPage(payload, "home", {
    title: "Home",
    slug: "home",
    _status: "published",
    // No meta. The layout's own title and description are the site's, and the
    // front page is the page they describe, so `generateMetadata` returns {}
    // and Next inherits them rather than restating them here.
    layout: [
      {
        blockType: "hero",
        eyebrow: "Legendary parties",
        heading: "Destination Wedding Planners & Event Designers",
        cta: { label: "Book A Consult", page: contact },
        collageLeft: mediaId(library, "hero-left.jpg"),
        collageCenter: mediaId(library, "hero-center.jpg"),
        collageRight: mediaId(library, "hero-right.jpg"),
      },
      {
        blockType: "serviceGrid",
        services: serviceIds,
        // Was `SERVICES_HREF = "/services/services-b"`, a typed path at a page
        // that never existed — six rendered dead links, by §1.4's count.
        cta: { label: "learn more", page: servicesPage },
      },
      {
        blockType: "storySplit",
        eyebrow: "who we are",
        heading: "Weave story into every thread of your event",
        copy: "Cras urna sed purus magna morbi morbi congue suspendisse. Est faucibus hendrerit donec nisi, feugiat suscipit eu, sit. Orci euismod nibh.",
        cta: { label: "more about us", page: about },
        image: mediaId(library, "about-who-we-are.jpg"),
        petals: "tall",
        side: "right",
      },
      {
        blockType: "storySplit",
        eyebrow: "What We Do",
        heading: "We are concept creators. We tell your story.",
        copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim tincidunt magna viverra nibh scelerisque lorem ipsum adipiscing dolor.",
        cta: { label: "more Services", page: servicesPage },
        image: mediaId(library, "about-what-we-do.jpg"),
        petals: "wide",
        side: "left",
      },
      {
        blockType: "portfolioGrid",
        eyebrow: "Portfolio",
        heading: "Event design to make your heart skip a beat",
        projects: projectIds,
        cta: { label: "View all portfolios", page: portfolio },
      },
      testimonialsBlock,
    ],
  });

  // Six, not the plan's seven. Spec §5 seeds "home, about, services, portfolio,
  // blog, and a new contact" — its six already include the page decision A adds,
  // so the plan double-counts it. What decision A really adds beyond the spec is
  // the /portfolio/<slug> route, and that is not a Pages document.
  console.log("  pages           6  (the five without a page CTA, then home)");
}

if (wants("globals")) {
  const pages = await keyed(payload, "pages", "slug");
  const logo = mediaId(library, "logo.svg");
  const navItem = (label: string, slug: string) => ({
    label,
    page: relatedId(pages, slug, "page"),
  });

  // A global always exists, so "already seeded" is a question about its content
  // rather than its presence — and silently overwriting a nav someone had
  // edited is the same data-loss bug `upsert` refuses.
  const header = await payload.findGlobal({ slug: "header", depth: 0 });
  if (header.nav?.length && !force) {
    skipped++;
  } else {
    await payload.updateGlobal({
      slug: "header",
      data: {
        logo,
        // Split around the wordmark at its midpoint: two left, two right, as
        // `SiteHeader` printed them.
        nav: [
          navItem("Portfolio", "portfolio"),
          navItem("About", "about"),
          navItem("Journal", "blog"),
          navItem("Services", "services"),
        ],
      },
    });
    if (header.nav?.length) replaced++;
    else created++;
  }

  const footer = await payload.findGlobal({ slug: "footer", depth: 0 });
  if (footer.social?.length && !force) {
    skipped++;
  } else {
    await payload.updateGlobal({
      slug: "footer",
      data: {
        instagramHeading: "Instagram",
        socialHeading: "Social",
        social: SOCIAL.map((item) => ({ ...item })),
        quickLinksHeading: "Quick Links",
        quickLinks: QUICK_LINKS.map((item) => ({ ...item })),
        logo,
        // The `#` is the fourteenth dead link in §1.4's inventory, and the one
        // phase 4 leaves standing alongside decision G's three.
        credit: { label: "Made by Maxim W.", url: "#" },
      },
    });
    if (footer.social?.length) replaced++;
    else created++;
  }

  console.log("  globals         2  (header, footer)");
}

console.log(
  `\n${created} created, ${replaced} overwritten, ${skipped} left alone` +
    (skipped && !force ? "  —  rerun with --force to overwrite" : ""),
);
process.exit(0);
