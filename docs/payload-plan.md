# Loovio on Payload — implementation plan

Working plan derived from [`payload-spec.md`](./payload-spec.md), reconciled against the
repo as it actually stands on 3 September 2026. The spec's architecture holds. This
document adds the parts it leaves implicit, corrects four claims the code contradicts, and
turns the six phases into ordered, checkable tasks.

| | |
|---|---|
| **Verified against** | 7 routes · 25 components · 4 hooks · 5 `lib/` data modules |
| **Installed** | Next 15.5.25 · React 19.2.8 · Node 24.13.0 · npm 11.6.2 |
| **Host machine** | Windows 11, PowerShell · Docker 29.5.2 available · no local Postgres · **not a git repo** |

## Decisions taken

Answered 3 September 2026. Each one is folded into the phases below; §6 keeps the
reasoning and the three that are still open.

| | Decision | Consequence |
|---|---|---|
| **A** | Project detail pages **and** a contact page, contact as prose | `/portfolio/[slug]` route in phase 4; Projects gains a `body`; a `contact` Page is seeded. **No form-builder plugin** — the contact page is a `prose` block with an email address. |
| **B** | Import the lorem as-is | Seed copies every string verbatim. No placeholder scheme, no find-and-replace pass. Reinforces the diff: lorem in the CMS renders identically to lorem in the code. |
| **C** | **Local Docker only. No hosting.** | No storage adapter, no hosted Postgres, no CI. Media stays on local disk; the Docker volume is the database. Phase 6 collapses from "production" to consolidation. |
| **D** | One project image, not two | *Resolved by E* — two crops guarantees the diff fails. Projects keeps a single `image`; the taller `/portfolio` crop stays in CSS, as today. |
| **E** | **Pixel-identical** | The rich-text container calibrates its paragraph margin to the height the old `<br><br>` occupied. The fingerprint diff is a hard gate on every migrated route, prose included. |

> **C is reversible but not free.** Nothing here forecloses hosting later; it just means the
> storage adapter, the managed database and the CI migration step are absent rather than
> deferred. When a host is chosen, ~40 files re-upload through the seed script and phase 6
> gets rewritten. That is a script rerun, not a rebuild.

---

## 1. Corrections to the spec

Four statements in the spec are contradicted by the code. Each moves work between phases,
so they are settled before the phase list rather than inside it.

### 1.1 "Presentational components are untouched. They already take props."

Four of the six section components take **no props at all** — they import their content
directly from `lib/`. They cannot receive Payload data without a prop interface.

| Component | Today | Work |
|---|---|---|
| `Hero` | zero props; imports `ARTWORK`, `PETALS` | add `eyebrow · heading · cta · left/right/center: Artwork` |
| `ServiceGrid` | zero props; imports `SERVICES`, const `SERVICES_HREF` | add `services[] · ctaLabel · ctaHref` |
| `PortfolioGrid` | zero props; imports `PROJECTS`; eyebrow/heading/CTA hardcoded | add `eyebrow · heading · projects[] · ctaLabel · ctaHref` |
| `Testimonials` | zero props; `QUOTES` const inline | add `eyebrow · heading · quotes[]` |
| `PortfolioCard` | takes `{name, slug}`, looks artwork up by slug | take `image: Artwork` and `href` directly |
| `JournalCard` | takes the whole `JournalPost`, incl. paired `date`/`published` strings | take one `published` date, format at render |
| `JournalPost` | body is hardcoded JSX | take `body: SerializedEditorState`, render `<RichText>` |
| `ServicePanel` | `service.copy` is `[string, string]` | take `copy` as rich text |
| `SiteHeader` | four nav links hardcoded | take nav from the Header global |
| `SiteFooter` | `SOCIAL`, `QUICK_LINKS`, `FEED` hardcoded | take from the Footer global + Instagram collection |
| `SiteLink` | `LIVE_ROUTES` allowlist gates prefetch | delete the allowlist — Page relationships cannot dangle |

**Genuinely untouched:** `StorySplit`, `AboutPhoto`, `Section`, `HeroTop`/`HeroSection`/`PageMasthead`,
`Sprig`, every `*.module.css`, `app/globals.css`, and all four hooks. That is the real
line — **13 of 25 components change**, not zero. The animation and CSS work is still safe;
the claim that no component signature moves is not.

**New components:** `RenderBlocks`, `Prose`, `PressStrip`, `PhotoRow`, `InstagramFeed`
(lifted out of `SiteFooter`).

### 1.2 Projects have one photograph, not two

The spec gives Projects a `gridImage` and a `featureImage`. The code uses **the same file
for both**: `PORTFOLIO_ARTWORK` and `PORTFOLIO_PAGE_ARTWORK` are `withSizes()` over one
`PORTFOLIO_SOURCES` table, differing only in the `sizes` hint. The taller two-up crop comes
from CSS (`styles.imageTall`), not from a second export.

Two uploads per project means someone crops four new images, and the before/after diff
cannot pass by construction. **Settled by decision E:** Projects keeps one `image` field,
and `/portfolio` goes on cropping it taller in CSS. The `sizes` hint is chosen by the block
that renders the card — `portfolioGrid` passes the four-up hint, `portfolioList` the two-up
one — which is exactly what `withSizes()` does today, moved up a layer.

### 1.3 There is one post body, not four

`JournalPost.tsx` renders a single hardcoded lorem body — the same markup for all four
posts. The spec's "convert the journal post bodies into Lexical" is converting one body and
planting it four times.

The body needs `p`, `h3`, `blockquote`, `ul`/`li`, and **`figure` with `figcaption`**.
`app/globals.css` already styles all of those as bare elements, so Lexical output inherits
the typography for free. The `figcaption` needs a custom JSX converter on the upload node,
fed from the Media collection's `caption` field — which the spec describes as "optional,
unused by current components". It is not unused; it is exactly what carries the caption.

### 1.4 The dead-link count is short

The spec names four. The full inventory:

| Link | Sites | Fixed by |
|---|---|---|
| `/portfolio/<slug>` | 8 rendered (4 home + 4 portfolio) | new detail route, phase 4 (decision A) |
| `/services/services-b` | `HomeView` ×1, `ServiceGrid.SERVICES_HREF` ×1 const → 6 rendered | Page relationship |
| `/about/about-b` | `HomeView` ×1 | Page relationship |
| `/contact` | `Hero` CTA ×1 | new `contact` Page, phase 4 (decision A) |
| `/template-info/{licensing,style-guide,changelog}` | `SiteFooter` ×3 | **not mentioned in the spec** — see [decision G](#g-the-footers-three-template-links) |
| `#` | `SiteFooter` credit ×1 | Footer global credit line |

`/shop` in `CartPanel` does not count: `CartPanel`, `NavDropdown` and `ChevronIcon` have
zero inbound references already, confirming the spec's phase-6 deletion list.

---

## 2. The sectioning model

**This is the decision the spec does not make, and everything in phase 4 depends on it.**

`Section` renders `padding: var(--section-block) var(--section-inline)` — 76px vertical at
desktop, 54px at 479px. Some components bring their own `Section`; others are bare and the
*view* wraps them. The block library has to reconcile the two.

| Block | Wrapper today |
|---|---|
| `hero` | its own `HeroSection` (open) |
| `masthead` | its own `HeroSection tight` |
| `serviceGrid`, `storySplit`, `portfolioGrid`, `testimonials` | its own `Section` |
| `photoRow`, `prose`, `pressStrip`, `portfolioList`, `journalList` | **bare** — the view wraps them |

The about page is the case that breaks the naive mapping. All six of its bodies —
`photoRow · prose · photoRow · prose · pressStrip · photoRow` — sit inside **one**
`<Section first>`, and `.prose` carries its own 110px top and bottom margin *inside* that
section. Give each block its own `<Section>` and every seam gains 152px of padding on top
of the existing margins. The page would not be recognisable, and §11's acceptance test
would fail on the page with the most blocks.

### The rule

**`RenderBlocks` owns all sectioning.** Lift `<Section>` out of `ServiceGrid`, `StorySplit`,
`PortfolioGrid` and `Testimonials` — four small edits, no CSS change — and have each block
config declare how it wants to be banded:

```ts
type Banding = "none" | "own" | "shared";
```

- `none` — the block brings its own band (`hero`, `masthead`).
- `own` — `RenderBlocks` wraps it in its own `<Section>` (`storySplit`, `serviceGrid`,
  `portfolioGrid`, `testimonials`, `instagramFeed`).
- `shared` — **adjacent `shared` blocks coalesce into a single `<Section>`**
  (`photoRow`, `prose`, `pressStrip`, `portfolioList`, `journalList`).

`first` — which zeroes `padding-top` — goes on the `<Section>` that opens the body **when
the preceding block is a `masthead`**, never after `hero`, which keeps its own leading
space. That reproduces today's five pages exactly:

| Page | Bands produced |
|---|---|
| home | HeroSection · Section ×5 |
| about | HeroSection(tight) · Section(first){6 blocks} · Section{testimonials} |
| services | HeroSection(tight) · Section(first){servicePanels} |
| portfolio | HeroSection(tight) · Section(first){portfolioList} |
| blog | HeroSection(tight) · Section(first){journalList} |

**Cost to name:** coalescing is implicit. An editor cannot choose to split one run of prose
into two bands. If that turns out to matter, the escape hatch is a zero-height
`sectionBreak` block — one line in the switch, deferred until someone asks.

---

## 3. Fidelity: where the DOM cannot stay identical

Two conversions change the emitted markup even when the content is identical. Decision E
sets the bar at **pixel-identical**, so both need calibration rather than acceptance.

**Paragraph breaks.** Today's prose is one `<p>` containing `<br /><br />` — twice in
`AboutView`, and again in `ServicePanel` (`copy[0]<br/><br/>copy[1]`). Lexical emits two
`<p>` elements. `globals.css` gives `p` a bottom margin, so `<p><br><br></p>` and
`<p></p><p></p>` do not render at the same height.

**Resolution.** A `.richText` wrapper class sets the inter-paragraph gap to the measured
height of `line-height × 2` — what two `<br>`s produce inside a paragraph — and zeroes the
trailing margin on `:last-child`. Measure it off the phase-0 baseline rather than deriving
it from the token, because the two are only equal if `p`'s margin already happens to match
double the line box. One rule, applied to the `prose` block and the service panel, then
verified by the fingerprint's computed box metrics.

> The DOM still differs — two `<p>`s where there was one. The gate is the **computed
> geometry**, not the tag sequence, which is why the fingerprint records box metrics and not
> just markup.

**The press strip.** `AboutView.module.css` styles the six logos by *ordinal* —
`.press1` … `.press5`, with different rules at three breakpoints, because the grid goes
6-up → 3-up → 2-up and whichever logo opens a row drops its left border. An editable
`logos[]` array of arbitrary length breaks that immediately. Fix: rewrite the dividers as
`:nth-child` expressions keyed to the column count at each breakpoint, so the strip is
correct for any number of logos. Contained to one CSS module, but it is real work the spec
does not budget.

---

## 4. Prerequisites

Before phase 1 starts:

1. **`git init`.** The repo is not under version control. The spec commits `migrations/`
   and `payload-types.ts` and runs migrations in CI; none of that exists yet. Commit the
   current site first — it is the only rollback point for the whole migration.
2. **Postgres in Docker.** No `psql` on PATH; Docker 29.5.2 is. Per decision C this is not
   a throwaway dev database — it is *the* database, so the named volume holding it is the
   only copy of every edit anyone makes. Add a `pg_dump` script alongside the compose file
   in phase 0 and run it before every `payload migrate`. "It's only local" is exactly when
   a volume gets pruned by accident.
3. **Windows shell.** Every command in the spec is written for bash. `payload` CLI
   invocations that set `NODE_OPTIONS` inline need `cross-env` on PowerShell. Add it as a
   dev dependency and route the CLI through an npm script rather than typing it.
4. **Baseline capture — do this first.** §11's acceptance test compares against a site that
   phase 1 is about to move. Capture the baseline while the tree is untouched: for each of
   the 7 routes at 1440 and 375, record the rendered `src`/`srcSet`/`sizes` of every
   `<img>`, the class-name sequence, and the computed box metrics of every `<Section>`. A
   DOM/attribute fingerprint is the real gate — it is diffable, it survives the DPR flips
   that make screenshot comparison noisy under viewport emulation, and it catches exactly
   the `srcSet` regressions phase 2 is guarding against. Screenshots are the supplement,
   not the test.

---

## 5. Phases

### Phase 0 — Baseline and version control

`git init` + initial commit · `docker-compose.yml` (postgres:17, named volume, 5432) ·
`scripts/db-dump.ps1` · `.env.example` · the fingerprint script (`scripts/fingerprint.ts`)
and its 14 captured baselines (7 routes × 2 widths).

The fingerprint records, per route per width: every `<img>`'s `src` and **parsed** `srcSet`
width descriptors and `sizes`; the class-name sequence of the section tree; and the computed
box metrics (margin, padding, height) of every `<Section>` and every `<p>` inside a prose
run — the last of those is what decision E is gated on.

**Done when** the fingerprint script produces a stable, committed baseline that reruns
clean against the unmodified site.

---

### Phase 1 — Payload installed, site untouched

```bash
npm i payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/plugin-seo graphql sharp
npm i -D cross-env
```

No storage adapter and no `@payloadcms/storage-vercel-blob` — decision C keeps media on
local disk. Media lands in a gitignored `public/media`, which means **the uploads are not
in version control**; the `pg_dump` script from phase 0 covers the database, and the media
directory needs the same treatment or a `git init`-tracked exception.

- `payload.config.ts` at the root: `postgresAdapter({ pool, push: <dev only>, migrationDir })`,
  `lexicalEditor()`, `secret`, `typescript.outputFile`.
- Route groups. `app/layout.tsx` → `app/(frontend)/layout.tsx`, carrying the three
  `next/font` declarations and `globals.css` unchanged. The five page routes move with it.
  **Watch:** `app/icon.png` and `app/apple-icon.png` are Next metadata-convention files —
  they move into `(frontend)` too, or the admin panel inherits the site's favicon.
- Copy the generated `(payload)` group in verbatim. It is not hand-editable.
- `next.config.mjs` wrapped in `withPayload()`. `images.unoptimized` stays — the site builds
  its own `srcSet` and Payload generates the alternates.
- Users (auth, `role: admin | editor`) and Media (`alt`, `caption`, `category`,
  `imageSizes: w500 / w800 / w1080`).
- `migrate:create initial` · `migrate` · `generate:types` · `generate:importMap`.

**Done when** `/admin` loads, a user logs in, one upload produces three derivatives, and the
phase-0 fingerprint reruns **clean on all 14 captures**.

---

### Phase 2 — Media adapter proven on the hero

- `lib/sizes.ts` — the `sizes` hints lifted verbatim out of `artwork.ts`. Note there are
  **seven** distinct hints in that file, not the four the spec's snippet shows: full-width,
  hero-side, hero-centre, story, service, and the two portfolio hints.
- `lib/media.ts` — `toArtwork(media, sizes)`, preserving the existing invariant: **no
  `sizes` hint is emitted without a `srcSet` to pick from.** Five images in the library
  shipped single-source and must stay that way.
- Upload `hero-left.jpg`, `hero-right.jpg`, `hero-center.jpg` at full size; wire the home
  hero through `toArtwork`. Everything else stays hardcoded.

**Done when** the hero's three `<img>` fingerprints match the baseline exactly, including
the intrinsic-width candidates (803w / 803w / 908w), and the collage parallax still runs.

> The riskiest line in the migration is here. Payload names derivatives
> `<stem>-500x<h>.jpg`, so the URLs change even when the widths do not. The fingerprint has
> to compare **parsed width descriptors**, not the raw `srcSet` string.

---

### Phase 3 — Collections and the seed

Projects · Posts · Services · Testimonials · Instagram, with drafts and `versions.max: 20`
on Pages/Projects/Posts. Projects gets a `body` blocks field, now that decision A puts
detail pages in scope, and a single `image` per decision D.

`scripts/seed.ts`, run via `payload run`. **Every string is copied verbatim** (decision B) —
no placeholder substitution, which is what lets the diff stay exact:

1. Upload the full-size original of ~40 photographs from `public/images`. **Skip the
   pre-sized exports** (`*-500.jpg`, `*-800.jpg`, `*-1080.jpg`) — they are outputs.
2. Services from `lib/services.ts`; the `copy` tuples become two Lexical paragraphs.
3. Testimonials from the `QUOTES` array in `Testimonials.tsx`, **stripping the typed curly
   quotes** (they move to render). Portraits are the petal cut-outs, as today.
4. Projects from `lib/projects.ts`. Posts from `lib/journal.ts`, collapsing the paired
   `date`/`published` strings into one date field.
5. The shared post body → Lexical, once, planted on all four posts. Figures use the upload
   node, with the Media `caption` carrying the `figcaption`.
6. Six Instagram entries, backdated so `-addedAt` reproduces today's 1…6 order.

The existing views read from Payload; section order stays hardcoded.

**Done when** the fingerprint diff is clean at both widths, modulo the two known DOM changes
in [§3](#3-fidelity-where-the-dom-cannot-stay-identical).

---

### Phase 4 — Pages, blocks, the catch-all route

Thirteen blocks · `RenderBlocks` with the banding rule from [§2](#2-the-sectioning-model) ·
`app/(frontend)/[[...slug]]/page.tsx` · Header and Footer globals · the four extracted
components · the `:nth-child` press-strip rewrite · the `.richText` paragraph calibration
from [§3](#3-fidelity-where-the-dom-cannot-stay-identical).

Link resolution lives in one helper — `hrefFor(relationship | externalUrl)`, with `home` →
`/`. `SiteLink`'s `LIVE_ROUTES` allowlist is deleted in the same commit.

**Seven Pages documents**, not six — decision A adds `contact`. The five migrated pages take
the block sequences from spec §6; `contact` is a `masthead` plus a `prose` block carrying an
email address.

**Plus the project detail route** (`app/(frontend)/portfolio/[slug]/page.tsx`), rendering
`RenderBlocks` over the Project's `body`. It kills the 8 dead `/portfolio/<slug>` links; the
hero CTA's `/contact` resolves to the new Page. That leaves only the footer's
`/template-info/*` trio ([decision G](#g-the-footers-three-template-links)) and the `#`
credit as dead links anywhere on the site.

Then `HomeView`, `AboutView`, `ServicesView`, `PortfolioView` and `JournalView` are deleted.

**Done when** a new page is built in the admin from blocks alone, published, and reached at
its slug with no developer involved — and the five migrated pages still fingerprint clean.
`/contact` and `/portfolio/<slug>` are **exempt from the diff**: they have no "before" to
compare against, so they are reviewed by eye instead.

---

### Phase 5 — SEO, drafts, preview, revalidation

`plugin-seo` on Pages/Projects/Posts feeding the existing `pageMetadata()` · `noIndex` ·
`sitemap.ts` · `robots.ts` · `draftMode()` preview route behind
`PAYLOAD_PUBLIC_DRAFT_SECRET` · live preview per collection · `afterChange`
`revalidatePath`/`revalidateTag` on all six content collections and both globals.

**Done when** an admin heading edit reaches the live page within one request, and an
unpublished page 404s publicly but previews for an editor.

---

### Phase 6 — Consolidation

Decision C means there is no deploy target, so the spec's production phase loses most of its
content. What survives is the cleanup and the one durability task that still matters.

- **Delete the dead code.** `lib/projects.ts`, `lib/journal.ts`, `lib/services.ts`, and all
  of `lib/artwork.ts` except the `Artwork` type (which `lib/media.ts` still returns) and
  `PETALS` (referenced by component constants, not by blocks). Then `CartPanel`,
  `NavDropdown` and `ChevronIcon`, orphaned since before this migration started.
- **Prove the restore.** Drop the Docker volume and rebuild the database from a `pg_dump`
  plus the media directory. Untested backups of a single-copy local database are the largest
  remaining risk in the project, and it is a fifteen-minute exercise.
- **Write down the deploy gap.** A short `docs/deploy.md` naming what phase 6 *would* have
  contained — storage adapter, hosted Postgres, `payload migrate` in CI — so the decision is
  documented as deferred rather than forgotten.

**Done when** the repo has no references to the deleted `lib/` modules, `tsc --noEmit` is
clean, and a database restore has actually been performed once.

> Typecheck with `npx tsc --noEmit`, not `next build` — a build shares `.next` with a running
> dev server and will disrupt it.

---

## 6. Decisions and what remains open

Five answered, three still carrying an assumption. None block phase 0 or 1.

### A. Which new pages get built — **answered**
Both, with contact as prose. Project detail pages become nearly free once Projects is a
collection, and they retire 8 of the 14 dead links. The contact page is a `masthead` plus a
`prose` block with an email address — **`@payloadcms/plugin-form-builder` is never
installed**, so there is no submission storage, no spam surface and no extra schema. If
enquiries later need a real form, the plugin drops in against an existing page rather than
against nothing.

*(The spec was internally inconsistent here: §3's tree lists `portfolio/[slug]/page.tsx` as
settled while §14 asks whether to build it. Now settled in favour of §3.)*

### B. Is real copy coming — **answered**
No. Import the lorem verbatim. This pairs well with E: lorem in the CMS renders identically
to lorem in the code, so nothing in the content itself can move the diff. The cost is
deferred, not avoided — the four journal posts still share **one** body, so a writer
eventually edits four documents that all say the same thing.

### C. Where does this deploy — **answered**
Nowhere. Local Docker only. No storage adapter, no hosted Postgres, no CI migration step.
Two things follow that are easy to miss:

- The Docker volume is the **only copy** of every edit. `pg_dump` before every migration,
  from phase 0.
- Media in `public/media` is not in version control. The database backup does not cover it;
  back the directory up alongside the dump or the two restore out of sync.

Migrations still matter — `push` only reconciles a dev schema, and every block added after
phase 4 needs `migrate:create` — they just apply locally instead of in a pipeline.

### D. One project image, or two — **resolved by E**
One. Per [§1.2](#12-projects-have-one-photograph-not-two), two crops guarantees the diff
fails, and the taller `/portfolio` crop is already a CSS concern. Projects keeps a single
`image`; the rendering block supplies the `sizes` hint.

### E. What is the acceptance bar — **answered**
Pixel-identical. The `.richText` wrapper calibrates its inter-paragraph gap to the height
the old `<br><br>` occupied, measured off the phase-0 baseline. The fingerprint gates every
migrated route on computed geometry, prose included. `/contact` and `/portfolio/<slug>` are
exempt — they are new, so there is nothing to compare them to.

### F. Who edits
*Blocks phase 5.* One admin, or a client editor who cannot delete Pages or touch the
globals. The `role` field exists either way; the access functions differ. **Assumed unless
told otherwise:** an editor can create and update all content, cannot delete Pages, and
cannot edit Header/Footer.

### G. The footer's three template links
*Blocks phase 4.* `/template-info/licensing`, `/style-guide` and `/changelog` are dead and
unmentioned in the spec. **Assumed:** the Footer global's quick-links array supports an
`externalUrl` escape hatch, and these are dropped at seed unless real destinations exist.

### H. Instagram post URLs
*Blocks phase 3.* Every tile currently links to bare `instagram.com`, and every tile has
`alt=""`. The spec makes `postUrl` required and validated and uses `caption` as the
accessible name — both improvements, but there is no source data for either. **Assumed:**
seed with the bare profile URL and empty captions; the widget falls back to
"View on Instagram".

---

## 7. Risk register

| Risk | Where | Mitigation |
|---|---|---|
| **Single-copy database** | phase 3 onward | Highest remaining risk. Decision C makes one Docker volume the only home for every edit anyone makes. `pg_dump` before every migration; prove the restore in phase 6. |
| Media outside version control | phase 3 onward | `public/media` is gitignored and not covered by the database dump. Back it up with the dump, or the two restore out of sync. |
| `srcSet` silently degrades | phase 2 | Fingerprint **parsed width descriptors**, not URL strings — Payload renames derivatives even when the widths match. Gate phase 3 on it. |
| About page spacing collapses | phase 4 | The banding rule in §2, proven against the about fingerprint before the other four pages migrate. |
| Rich-text gap drifts off the baseline | phase 4 | Measure the `<br><br>` height from the phase-0 capture rather than deriving it from the type token; verify via computed box metrics, not by eye. |
| Press strip breaks on ≠ 6 logos | phase 4 | `:nth-child` rewrite in the same commit as the block. |
| Postgres join blow-up | phase 4 | `depth: 2` plus `select`; count queries once the home page assembles. |
| Schema drift | all | `push` in dev only; `migrate:create` on every schema edit. No CI to catch a missing migration, so it has to be habit. |
| No rollback point | phase 0 | `git init` first. Non-negotiable. |
