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

type ContentSlug = "projects" | "posts" | "services" | "testimonials" | "instagram";

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

console.log(
  `\n${created} created, ${replaced} overwritten, ${skipped} left alone` +
    (skipped && !force ? "  —  rerun with --force to overwrite" : ""),
);
process.exit(0);
