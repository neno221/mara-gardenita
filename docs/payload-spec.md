# Loovio on Payload

**Implementation spec** — moving the Loovio site from hardcoded TypeScript data into
Payload CMS, so every page is assembled from editable, reusable section blocks
without touching a line of the animation or CSS work already in the repo.

| | |
|---|---|
| **Repo** | `mara-gardenita` |
| **Stack** | Next 15.5.25 · React 19.1.1 · Node 24.13 |
| **Target** | Payload 3.x · PostgreSQL |
| **Drafted** | 3 September 2026 |

> Published copy: <https://claude.ai/code/artifact/9026660e-46fc-4e46-914a-b13de63408fd>

---

## 1. Decisions locked

Four choices made up front, because each one changes the shape of everything after it.

| Decision | Choice | Consequence |
|---|---|---|
| **Database** | PostgreSQL | Drizzle adapter. Relational integrity and Neon/Supabase hosting; costs a migration file every time the schema moves. |
| **Reuse model** | Block library only | Every section is a block type droppable on any page. Each instance owns its own content — no shared-section indirection. |
| **Media** | Payload uploads | Editors upload and replace photography. Payload regenerates the responsive widths `lib/artwork.ts` hardcodes today. |
| **Collections** | Four content types | Projects, Posts, Services and Testimonials become documents that blocks reference, rather than inline block content. |

> **Consequence of Postgres.** Blocks and arrays become their own tables, so every
> schema edit needs a migration before it reaches production. Budget for
> `payload migrate:create` in the workflow from phase 1, and keep `push` enabled
> only in local development.

---

## 2. What survives, what changes

The repo's value is in the twenty-five components and their CSS modules — the GSAP
scroll choreography in `Hero`, `StorySplit` and `ServicePanel`, the drifting photo
frames, the header's slide-down panel. None of that is CMS work and none of it
should be rewritten.

| Layer | Fate |
|---|---|
| Presentational components (`Hero`, `StorySplit`, `ServicePanel`, `PortfolioCard`…) | Untouched. They already take props; they simply receive them from Payload instead of from a `lib/` constant. |
| CSS modules and `app/globals.css` tokens | Untouched. |
| Animation hooks (`useScrollProgress`, `useDriftingPhoto`, `useHoverZoom`, `useRevealOnView`) | Untouched. |
| View components (`HomeView`, `AboutView`, `ServicesView`, `PortfolioView`, `JournalView`) | **Replaced** by one `RenderBlocks` switch. Their hardcoded section order becomes page data. |
| `lib/projects.ts`, `lib/journal.ts`, `lib/services.ts` | **Replaced** by collections. Kept temporarily as the seed script's input, then deleted. |
| `lib/artwork.ts` | **Split.** The `sizes` hints are layout constants and stay in code; `responsive()` and the per-image tables are replaced by a Media adapter. |
| `lib/metadata.ts` | **Kept and fed.** `pageMetadata()` stays the single formatter; its inputs come from the SEO plugin. |

The one structural cost worth naming: `SiteShell`-wrapped views become a catch-all
route, so `app/` is reorganised into Next route groups. That is unavoidable with
Payload 3, which mounts its admin panel and REST/GraphQL API inside the same Next app.

---

## 3. Repo layout after install

```
app/
├─ (frontend)/                  # the public site — existing routes move here
│  ├─ layout.tsx                # today's root layout, fonts + base metadata
│  ├─ [[...slug]]/page.tsx      # every Pages document, incl. "/"
│  ├─ post/[slug]/page.tsx      # Posts
│  └─ portfolio/[slug]/page.tsx # Projects — new, see open questions
├─ (payload)/                   # generated; do not hand-edit
│  ├─ admin/[[...segments]]/
│  ├─ api/[...slug]/
│  └─ layout.tsx
└─ globals.css                  # unchanged

payload.config.ts               # root — collections, globals, plugins, adapter
payload-types.ts                # generated; committed

collections/    Pages · Projects · Posts · Services · Testimonials · Instagram · Media · Users
globals/        Header · Footer
blocks/         one file per block, config + field schema
components/
├─ RenderBlocks.tsx             # blockType -> component switch
├─ …                            # all 25 existing components, unchanged
lib/
├─ media.ts                     # NEW — Payload upload -> Artwork adapter
├─ sizes.ts                     # the `sizes` hints lifted out of artwork.ts
└─ metadata.ts                  # unchanged
migrations/                     # Postgres, committed
```

> **Route groups.** `(frontend)` and `(payload)` are parentheses groups — they do
> not appear in URLs. `/about` stays `/about`. The admin panel lands at `/admin`,
> the REST API at `/api`.

---

## 4. Install & configuration

### Packages

```bash
npm i payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/plugin-seo @payloadcms/ui graphql sharp
```

Add a storage adapter if the deploy target is serverless — local disk does not
persist on Vercel:

```bash
npm i @payloadcms/storage-vercel-blob
```

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URI` | Postgres connection string. Neon or Supabase for hosted; local Postgres or Docker for development. |
| `PAYLOAD_SECRET` | Signs auth tokens. Random 32+ chars, never committed. |
| `PAYLOAD_PUBLIC_DRAFT_SECRET` | Shared token for the preview route, so draft URLs cannot be guessed. |
| `BLOB_READ_WRITE_TOKEN` | Only if the Vercel Blob adapter is used. |
| `NEXT_PUBLIC_SITE_URL` | Already consumed by `lib/metadata.ts`. Now also Payload's `serverURL`. |

### next.config.mjs

Wrap the existing export in `withPayload()`. Leave `images.unoptimized: true` in
place — the site uses raw `<img>` with hand-built `srcSet`, and Payload generates
the alternates itself, so Next's image optimiser stays out of the way exactly as
the current comment intends.

```js
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig = { devIndicators: false, images: { unoptimized: true } };

export default withPayload(nextConfig);
```

### Migration workflow

```bash
npx payload migrate:create add_pages_blocks
npx payload migrate
npx payload generate:types
```

`migrate:create` after every schema change, `migrate` to apply (including in CI
before deploy), `generate:types` to refresh `payload-types.ts`.

---

## 5. Collections

### Pages

The spine of the whole thing. One document per URL; the `layout` field is the block
array that makes "every section visible and editable" true.

| Field | Type | Notes |
|---|---|---|
| `title` | text | **required.** Admin label and SEO title fallback. |
| `slug` | text | **required · unique · indexed.** Auto-derived from title, overridable. `home` resolves to `/`. |
| `layout` | blocks | **required.** The full block library from §6, in page order. Drag to reorder. |
| `meta` | group | Injected by `plugin-seo` — see §8. |
| `publishedAt` | date | Defaults to first publish. |
| `_status` | select | Draft / published. Added by `versions.drafts`. |

Seeded with six documents matching today's site: `home`, `about`, `services`,
`portfolio`, `blog`, and a new `contact`. New pages are created in the admin with
no developer involvement, which is the point.

### Projects

| Field | Type | Notes |
|---|---|---|
| `name` | text | **required.** e.g. "Jennifer & Oliver". |
| `slug` | text | **required · unique** |
| `gridImage` | upload -> Media | The four-up home tile. Cropped to the `grid` variant's ratio. |
| `featureImage` | upload -> Media | The taller two-up tile on `/portfolio`. |
| `body` | blocks | Only if project detail pages are built — see §14. |
| `meta` | group | SEO. |

### Posts

| Field | Type | Notes |
|---|---|---|
| `title` | text | **required** |
| `slug` | text | **required · unique.** Drives `/post/[slug]`. |
| `published` | date | **required.** Replaces today's paired `date`/`published` strings — the display form is formatted at render, not stored twice. |
| `excerpt` | textarea | **required.** Printed on the card, the masthead lede, and the meta description. |
| `cardImage` | upload -> Media | 735 × 647 index crop. |
| `heroImage` | upload -> Media | 1372 × 855 plate. |
| `body` | richText | Lexical, with an inline image node for the two figures the current posts carry. |
| `meta` | group | SEO, `og:type=article`. |

### Services

Shared by the home page's three-up grid and the `/services` panels — the reason it
earns a collection rather than living inline twice.

| Field | Type | Notes |
|---|---|---|
| `title` | text | **required.** Weddings · Event Design · Branding. |
| `icon` | upload -> Media | The 69 × 55 flower glyph. |
| `photo` | upload -> Media | 805 × 1000 panel photograph. |
| `summary` | textarea | One-line blurb for the home grid. |
| `copy` | richText | The two paragraphs on the services page. Rich text replaces today's `[string, string]` tuple so an editor can add a third. |
| `order` | number | Default sort. |

### Testimonials

| Field | Type | Notes |
|---|---|---|
| `signature` | text | **required.** "Mr. & Mrs. Powell". |
| `quote` | textarea | **required.** Curly quotes are added at render, not typed into the field. |
| `portrait` | upload -> Media | Currently a petal cut-out stands in for a portrait; the field accepts either. |
| `order` | number | Carousel order. |

### Instagram

See §9 — it has rules the others don't.

### Media

| Field | Type | Notes |
|---|---|---|
| `alt` | text | Left empty for decorative art, which the components already render with `alt=""`. |
| `caption` | text | Optional, unused by current components. |
| `category` | select | `photography` · `glyph` · `ornament`. Lets the admin filter, and keeps petals out of a hero picker. |

### Users

Auth-enabled, email + password. A `role` select (`admin` / `editor`) exists from
day one even with a single user, because retrofitting access control after content
exists is more painful than declaring it now.

### Globals

Two, both rendered by `SiteShell` on every page:

- **Header** — nav items as an array of `{ label, page (relationship -> Pages) }`,
  plus the logo upload. Replaces the hardcoded links in `SiteHeader.tsx`, so adding
  a nav entry stops being a code change.
- **Footer** — social links array, quick links array, logo, credit line. The
  Instagram grid inside it is fed by the Instagram collection, not by fields here.

---

## 6. Block catalogue

Thirteen blocks, each a one-to-one wrapper over a component that already exists.
Every one is available on every Pages document, which is what makes sections
reusable across pages.

| blockType | Renders | Fields |
|---|---|---|
| `hero` | `Hero` | eyebrow · heading · cta{label, page} · collageLeft · collageRight · collageCenter (3 × upload) |
| `masthead` | `PageMasthead` | eyebrow · heading · lede? · cta? |
| `storySplit` | `StorySplit` | eyebrow · heading · copy · cta{label, page} · image · petals (tall / wide) · side (left / right) |
| `serviceGrid` | `ServiceGrid` | services (rel -> Services, hasMany) · ctaLabel · ctaPage |
| `servicePanels` | `ServicePanel` ×n | panels[] of { service (rel), dropped, wide, petals } |
| `portfolioGrid` | `PortfolioGrid` | eyebrow · heading · projects (rel, hasMany) · ctaLabel · ctaPage |
| `portfolioList` | `PortfolioCard` ×n *feature* | projects (rel, hasMany) · showAll (bool) |
| `journalList` | `JournalCard` ×n | mode (latest / picked) · limit · posts (rel, hasMany) |
| `testimonials` | `Testimonials` | eyebrow · heading · quotes (rel -> Testimonials, hasMany) |
| `photoRow` | `AboutPhoto` ×n | photos (upload, hasMany, 2–3) · stagger (ms, default 200) |
| `prose` | About prose block | ornament (bool) · heading · body (richText) |
| `pressStrip` | About press grid | label (default "Featured in") · logos[] of { logo (upload), name } |
| `instagramFeed` | Instagram grid | *none* — content lives in the Instagram collection |

> **Why links are relationships, not text.** Every `cta` points at a Pages document
> rather than a typed URL. That kills the four dead links currently in the repo —
> `/contact`, `/services/services-b` ×2 and `/about/about-b` — by construction: you
> cannot reference a page that does not exist, and renaming a slug updates every
> link to it. An optional `externalUrl` escape hatch covers off-site links.

Today's pages rebuild exactly from this library:

| Page | Block sequence |
|---|---|
| `home` | hero -> serviceGrid -> storySplit -> storySplit -> portfolioGrid -> testimonials |
| `about` | masthead -> photoRow -> prose -> photoRow -> prose -> pressStrip -> photoRow -> testimonials |
| `services` | masthead -> servicePanels |
| `portfolio` | masthead -> portfolioList |
| `blog` | masthead -> journalList |

Note what that table already proves: `testimonials` appears on two pages, `masthead`
on four, `photoRow` three times on one page, and `storySplit` twice with mirrored
`side` values. The reuse requirement is satisfied by the block library alone.

---

## 7. Media & the responsive sources

This is the fiddliest part of the migration and the one most likely to quietly
degrade the site, so it gets its own section.

`lib/artwork.ts` currently hand-builds a `srcSet` per photograph from files exported
at fixed widths — `hero-left-500.jpg`, `hero-left-800.jpg`, `hero-left.jpg` at 803px
intrinsic — paired with a `sizes` hint tuned per layout slot. Two different things
are tangled there: *which file* (content) and *how wide it renders at each
breakpoint* (layout).

### Split them

Payload's `imageSizes` takes over the first. Configure the Media collection to
generate the same widths the exports use:

```ts
imageSizes: [
  { name: "w500",  width: 500 },
  { name: "w800",  width: 800 },
  { name: "w1080", width: 1080 },
]
```

The `sizes` hints move verbatim into `lib/sizes.ts` and stay in code, because they
describe the CSS grid, not the picture:

```ts
export const FULL_WIDTH = "(max-width: 479px) 96vw, (max-width: 767px) 95vw, 96vw";
export const HERO_SIDE  = "(max-width: 479px) 51vw, (max-width: 767px) 49vw, 375.1875px";
export const STORY      = "(max-width: 767px) 80vw, (max-width: 991px) 81vw, 77vw";
export const SERVICE    = "(max-width: 479px) 86vw, (max-width: 767px) 85vw, 720px";
```

A single adapter then produces the `Artwork` shape the components already accept,
so no component signature changes:

```ts
export function toArtwork(media: Media, sizes: string): Artwork {
  const candidates = Object.values(media.sizes ?? {})
    .filter((s) => s?.url && s.width)
    .map((s) => `${s.url} ${s.width}w`);

  return {
    src: media.url,
    srcSet: [...candidates, `${media.url} ${media.width}w`].join(", ") || undefined,
    sizes: candidates.length ? sizes : undefined,
  };
}
```

> **Carried over from the existing code.** The current implementation is careful
> that *a `sizes` hint without a `srcSet` has nothing to pick from* — five images in
> the library shipped single-source. The adapter above preserves that rule rather
> than emitting a hint for a lone file.

### Which images move

All photography: hero collage, story splits, the eight about tiles, four project
images ×2 crops, four post cards + four heroes, three service photographs, six
Instagram tiles. Roughly 40 uploads.

The decorative art — four petal cut-outs, the sprig, the leaf ornament, the arrow
glyphs, the logo — moves to Media as `category: ornament` but is referenced by the
Header/Footer globals and by component constants, never picked per-block. There is
no editorial reason to choose a different petal in a story split.

---

## 8. SEO

`@payloadcms/plugin-seo` on Pages, Projects and Posts. It adds a `meta` group with
a live search-result preview and character counters in the sidebar.

| Field | Behaviour |
|---|---|
| `meta.title` | Falls back to `generateTitle`: `"<title> — Loovio"`, matching every current page title. |
| `meta.description` | Falls back to `generateDescription`: the post excerpt, or the first `prose` block's opening sentence. |
| `meta.image` | Upload -> Media. Falls back to the document's hero or feature image. |

The route's `generateMetadata` keeps calling the existing `pageMetadata()` helper,
now fed from the document. Nothing about the Open Graph / Twitter shape changes —
that formatter already handles the `article` case for posts, including
`publishedTime` and images.

Three additions beyond the plugin:

- `noIndex` checkbox per document, for staged pages.
- `app/(frontend)/sitemap.ts` — generated from published Pages, Projects and Posts.
  The site has none today.
- `app/(frontend)/robots.ts` — pointing at the sitemap, disallowing `/admin`.

---

## 9. Instagram widget

A collection with deliberately narrow rules: content is authored in one place, and
pages can only place the widget, never edit what it shows.

| Field | Type | Notes |
|---|---|---|
| `image` | upload -> Media | **required.** The tile. |
| `postUrl` | text | **required.** Validated against an `instagram.com` URL pattern. |
| `caption` | text | Optional; used as the link's accessible name, falling back to "View on Instagram". |
| `addedAt` | date | **required.** Defaults to now, editable — so a backdated import lands in the right order. |

Behaviour:

- The widget always renders **the six most recently added posts**:
  `sort: "-addedAt", limit: 6`. Adding a seventh drops the oldest out of view
  without anyone editing a page.
- Older entries stay in the collection as an archive rather than being deleted.
- The `instagramFeed` block has **no fields at all**. Placing it on a page is the
  entire editorial decision available there.
- It stays in the Footer global as it is today, so it appears site-wide; the block
  exists for pages that want a second, in-body placement.
- Existing behaviour preserved: every other tile hangs lower (`index % 2 === 1`),
  tiles hover-zoom, and links open in a new tab with `rel="noreferrer"`.

> **Worth knowing.** This is a manually curated feed, not an Instagram API
> integration — which is what the current footer does too. It needs no Meta app
> review, no token refresh, and no third-party outage risk, at the cost of someone
> posting the image twice. If you'd rather it pulled automatically from the real
> account, say so now: that is a different build with an ongoing maintenance tail.

---

## 10. Front-end rewiring

### Routing

One catch-all replaces five view components:

```tsx
// app/(frontend)/[[...slug]]/page.tsx
export async function generateStaticParams() { /* every published Pages slug */ }

export default async function Page({ params }) {
  const slug = (await params).slug?.join("/") ?? "home";
  const page = await findPage(slug);
  if (!page) notFound();

  return (
    <SiteShell>
      <RenderBlocks blocks={page.layout} />
    </SiteShell>
  );
}
```

`RenderBlocks` is a plain switch on `blockType` returning the existing component
with mapped props. It is a server component; the animated children keep their own
`"use client"` boundaries exactly as they do now.

### Depth and query cost

Blocks reference Services, Testimonials, Projects and Media, and those reference
Media again. Fetch pages with `depth: 2` and rely on Payload's `select` to trim
fields — on Postgres, a careless `depth: 3` across a page with four relationship
blocks turns into a lot of joins. Worth a look at the query count once the home
page is assembled.

### Revalidation

Pages stay statically generated. An `afterChange` hook on Pages, Projects, Posts,
Services, Testimonials and Instagram calls `revalidatePath` / `revalidateTag`, so
publishing updates the live site within a request rather than at the next deploy.
Instagram and the globals revalidate every path, since they render site-wide.

### Preview

Payload's `livePreview` configured per collection, pointed at a
`/api/preview` route carrying the draft secret and slug, which calls Next's
`draftMode()` and renders the draft. Editors see a real, styled page — animations
and all — beside the form.

---

## 11. Content migration

Nobody retypes this by hand. A one-shot script — `scripts/seed.ts`, run with
`payload run` — imports the existing data files and the `public/images` exports:

1. Upload the full-size original of every photograph from `public/images`, letting
   Payload regenerate the 500/800/1080 alternates. Skip the pre-sized exports; they
   are outputs, not sources.
2. Create Services, Testimonials, Projects and Posts from `lib/services.ts`, the
   `QUOTES` array in `Testimonials.tsx`, `lib/projects.ts` and `lib/journal.ts`,
   wiring each to its uploaded media.
3. Convert the two-paragraph service `copy` tuples and the journal post bodies into
   Lexical rich text.
4. Create the six Pages documents with the exact block sequences tabulated in §6.
5. Create six Instagram entries from `instagram-1…6.jpg`, backdated so the display
   order matches today's.
6. Populate the Header and Footer globals from the current nav and footer arrays.

> **Acceptance test.** After seeding, the CMS-driven site should be visually
> identical to the current one. Diff it: screenshot every route before and after at
> 1440 and 375 wide. Any difference is a bug in the migration, not a design
> decision — and this is the only moment where that check is cheap.

Once it passes, `lib/projects.ts`, `lib/journal.ts`, `lib/services.ts` and most of
`lib/artwork.ts` are deleted, along with the three components orphaned by the last
nav change (`CartPanel`, `NavDropdown`, `ChevronIcon`).

---

## 12. Access, drafts and workflow

| Collection | Read | Create / update / delete |
|---|---|---|
| Pages, Projects, Posts, Services, Testimonials, Instagram | Public, *published only*; drafts require an authenticated user or a valid preview token. | Authenticated. |
| Media | Public. | Authenticated. |
| Users | Self, or admin. | Admin only. |

Drafts and versions on Pages, Projects and Posts, with `versions.max: 20` — enough
to undo a bad edit, not enough to bloat Postgres. Autosave every 2s on drafts only.

Not in scope unless asked: scheduled publishing, multi-step approval, localisation,
or a second locale.

---

## 13. Delivery phases

Ordered so the site is never broken for more than one phase, and so the riskiest
piece — media — is proven before the bulk of the content moves.

### Phase 1 — Payload installed, site untouched

Packages, Postgres, `payload.config.ts`, route groups, Users and Media collections,
first migration. Existing pages move into `(frontend)` and keep rendering from `lib/`.

**Done when** `/admin` loads, a user can log in, an image uploads and generates
three sizes, and every existing route renders unchanged.

### Phase 2 — Media adapter proven on one page

Build `lib/media.ts` and `lib/sizes.ts`. Convert the home hero's three collage
images to Media uploads, leaving everything else hardcoded.

**Done when** the hero's rendered `srcSet`/`sizes` attributes match the current
output byte-for-byte, and the parallax still runs.

### Phase 3 — Content collections and the seed script

Projects, Posts, Services, Testimonials, Instagram. Seed script imports everything.
Existing views read from Payload instead of `lib/`, still with hardcoded section order.

**Done when** the before/after screenshot diff is clean at both widths.

### Phase 4 — Pages, blocks and the catch-all route

The thirteen blocks, `RenderBlocks`, the `[[...slug]]` route, Header and Footer
globals. The five view components are deleted.

**Done when** a new page can be built in the admin from blocks alone, published,
and reached at its slug — with no developer involved.

### Phase 5 — SEO, drafts, preview, revalidation

SEO plugin and fallbacks, sitemap and robots, draft mode, live preview,
`afterChange` revalidation hooks.

**Done when** editing a heading in the admin changes the live page within one
request, and an unpublished page 404s for the public but previews for an editor.

### Phase 6 — Production

Hosted Postgres, storage adapter, migrations in the deploy pipeline, backups, a
real admin account, dead code removed.

**Done when** a migration runs in CI, media survives a redeploy, and the database
has a restore that has actually been tested.

---

## 14. Open questions

None of these block phase 1. All of them want an answer before the phase named
against them.

**Blocks phase 4 — Project detail pages.** Every `PortfolioCard` links to
`/portfolio/[slug]`, which does not exist — eight dead links today. Projects
becoming a collection makes the page nearly free. Build it, or strip the links and
leave the tiles inert?

**Blocks phase 4 — Contact page.** The hero CTA points at `/contact`, also missing.
If you want a working enquiry form, add `@payloadcms/plugin-form-builder` now — it
brings a `form` block and stores submissions in the admin. Otherwise the contact
page is a `prose` block with an email address, and the plugin is never installed.

**Blocks phase 6 — Hosting.** Where does this deploy? Vercel means Neon or Supabase
for Postgres plus Vercel Blob or S3 for media, because local disk does not persist.
A VPS or Docker host can use local Postgres and local disk, and is cheaper — but
you own the backups.

**Blocks phase 3 — Real copy.** Every string on the site is lorem ipsum from the
Webflow template. Is real copy coming before launch? If so, the seed script should
plant placeholders rather than importing lorem that then has to be found and
replaced in thirty documents.

**Blocks phase 6 — Who edits.** One admin, or a client editor who should not be
able to delete pages or change the nav? The `role` field is specced either way, but
the access rules differ.

---

Spec covers the `mara-gardenita` repo at its current state: 7 routes, 25 components,
13 sections. Estimates and phase gates assume the block library stays at thirteen
types — each additional bespoke section is roughly a day including its migration and
preview wiring.
