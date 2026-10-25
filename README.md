# Mara Gardenita

A from-scratch Next.js rebuild of the Loovio wedding-planner template. Nothing
from the original export survives except the artwork and the copy — the markup,
styling and motion are all written here.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

## Pages

The site runs on [Payload](https://payloadcms.com) — see
[`docs/payload-plan.md`](docs/payload-plan.md) for the architecture and the
phased migration behind it. It runs on Vercel with Neon Postgres and Blob media —
see [`docs/vercel.md`](docs/vercel.md); [`docs/deploy.md`](docs/deploy.md) is the
earlier plan for that deploy. Locally the database is a Docker volume and uploads
are a local directory.

Five of the six routes below are Pages documents rendered by one catch-all route
from a block array, so their section order is editable and building a sixth page
needs no code.

| Route | Source | Blocks |
| --- | --- | --- |
| `/` | `home` page | hero · serviceGrid · storySplit ×2 · portfolioGrid · testimonials |
| `/portfolio` | `portfolio` page | masthead · portfolioList |
| `/about` | `about` page | masthead · photoRow · prose · photoRow · prose · pressStrip · photoRow · testimonials |
| `/services` | `services` page | masthead · servicePanels |
| `/contact` | `contact` page | masthead · prose |
| `/portfolio/<slug>` | Projects collection | masthead, the project's photograph, its block body |

The about headline reads "About Lovio" — one `o` — because that is the word the
source page sets, even though the wordmark beside it reads Loovio. The metadata
follows the wordmark, as the other pages do.

## Layout

```
app/
  (frontend)/
    layout.tsx              fonts + document metadata
    globals.css             design tokens, reset, typography scale
    [[...slug]]/page.tsx    every Pages document; `home` answers at /
    portfolio/[slug]/page.tsx  a project's own page
    next/preview/route.ts   turns draft mode on for a signed-in editor
    next/exit-preview/route.ts  and off again
  robots.ts                 disallows /admin, /api and /next/; points at the sitemap
  sitemap.ts                every published URL, minus anything flagged noIndex
  (payload)/                the admin panel and the API — generated, not hand-edited
payload.config.ts           collections, globals, plugin-seo, the Postgres adapter, Lexical
collections/                Pages · Users · Media · Projects · Services · Testimonials · Instagram
globals/                    Header, Footer — the chrome on every page
blocks/                     the twelve-block library, and the shared link field
access/                     who may read, write and delete what
hooks/                      afterChange revalidation
migrations/                 committed; `push` is dev-only
components/
  RenderBlocks.tsx    the block switch, and the banding rule that owns sectioning
  SiteShell.tsx       header + clipping page body + footer, shared by every page
  SiteHeader.tsx      sticky bar: wordmark, nav, Contact button — all from the Header global
  SiteFooter.tsx      link columns and wordmark, from the Footer global
  InstagramFeed.tsx   the scattered tile grid, from the Instagram collection
  Section.tsx         a page section: the padded band + the 1200px column
  HeroTop.tsx         the masthead block, plus HeroSection and PageMasthead
  Hero.tsx            HeroTop + the parallax photo collage
  ServiceGrid.tsx     three-up services summary
  ServicePanel.tsx    one service: a drifting photograph, then glyph, title and copy
  StorySplit.tsx      the mirrored text/photo sections
  PhotoRow.tsx        two or three framed photographs; the count sets the grid
  AboutPhoto.tsx      one framed, scroll-drifting photograph
  Prose.tsx           a centred run of rich text under an ornament and a heading
  PressStrip.tsx      the publication logos, divided by `:nth-child` rules
  PortfolioCard.tsx   one project tile, `grid` (four-up) or `feature` (two-up)
  PortfolioGrid.tsx   the four-up grid on the home page
  Testimonials.tsx    cross-fading quote slider
  RichText.tsx        Lexical -> the markup this site publishes
  SiteLink.tsx        an internal link, or a plain anchor for an off-site URL
  photo.module.css    the shared photo plate and the picture that fills it
  Section.module.css  section rhythm, block headings, shared type
  buttons.module.css  the outlined button and the underlined link
  PortfolioList.module.css  (no component) the two-up grid, used by the block
  *.module.css        otherwise one stylesheet per component, alongside it
lib/
  payload.ts          the Local API client and every read the site performs
  media.ts            a Media document as src/srcSet/sizes
  sizes.ts            the seven `sizes` hints the layout was published with
  links.ts            a stored link -> an href; `home` resolves to /
  chrome.ts           the Header and Footer globals as props for the shell
  instagram.ts        the feed as tiles, for the footer and the block alike
  lexical.ts          builders for the serialized rich text the seed writes
  metadata.ts         the shared page/article metadata shape + the site URL
  easing.ts           cubic-bezier solvers used as GSAP eases
  useScrollProgress.ts  scroll-linked, damped 0-1 progress
  useDriftingPhoto.ts   the shared frame-drift + picture-zoom parallax
  useRevealOnView.ts    staggered fade-in on first intersection
  useHoverZoom.ts       paired frame/photo hover scale
  artwork.ts            the `Artwork` shape and the petals
scripts/
  seed.ts             imports the published site into Payload
  fingerprint.ts      the acceptance gate — see fingerprints/README.md
  db-dump.ps1         the database and the media directory, before every migration
```

`RenderBlocks` owns all sectioning. Four components that used to bring their own
`<Section>` had it lifted out, because the about page needs six blocks inside
*one* band: each block declares whether it brings its own band, takes one to
itself, or coalesces with the blocks adjacent to it. The rule and its
justification are in `components/RenderBlocks.tsx` and §2 of the plan.

`SiteShell`, `SiteHeader`, `SiteFooter`, `Section` and `Testimonials` are shared
across the pages; `PortfolioCard` is shared by the two project grids. Every
interior page opens with `PageMasthead` — the closed-up hero band wrapped around
`HeroTop` — and the home page uses `HeroSection` directly so it can hang the
collage below the masthead. `Section` renders the padded band and the 1200px
column that nine call sites used to write out by hand; `first` marks the section
that opens a page body, whose leading space the hero above already carries.

The route files build their metadata with `pageMetadata`, which fills in the
matching Open Graph and Twitter cards. The values come from each document's `meta` group —
`@payloadcms/plugin-seo` on Pages and Projects, with a `noIndex` checkbox
appended — so a title is an edit rather than a deploy, and `lib/seo.ts` supplies
the admin's "auto-generate" fallbacks. Set `NEXT_PUBLIC_SITE_URL` and it becomes
`metadataBase`, so the share-card image URLs are absolute; leave it unset and no
`metadataBase` is emitted at all, which lets Next fall back to the deployment
host rather than baking a placeholder into every card.

## Drafts, preview and publishing

Pages and Projects keep drafts and up to 20 versions each. An unpublished
document 404s for the public and is absent from the API; an editor reaches it
through the admin's Preview button or the live-preview pane, which load
`/next/preview` — that route wants both `PAYLOAD_PUBLIC_DRAFT_SECRET` **and** a
signed-in session, because the secret is in the admin's own markup and so is not
a credential. `/next/exit-preview` clears the cookie.

The pages are statically generated, so publishing would otherwise land at the
next deploy — and there is no next deploy. `hooks/revalidate.ts` runs
`revalidatePath` on every content change: a document's own URL where it has one,
and the whole tree where it is furniture, which is what Services, Testimonials,
Instagram and the two globals are. An edit reaches the live page on the next
request.

`access/` holds who may do what. An editor writes all content but cannot delete
a Page or touch the Header and Footer, and cannot change their own role; the
site's own reads are filtered separately in `lib/payload.ts`, because the Local
API runs as root and an access rule alone would not close the render path.

The services grid runs two unequal columns, `1.7fr 1fr`. The opening panel takes
the wide track, the second takes the narrow one and hangs 80px lower, and the
third spans both — centred by `justify-items` inside the 720px cap every panel
carries. Below 767px the grid collapses to one column, the closing panel stops
spanning, and each glyph moves above its title instead of sitting beside it.

`app/globals.css` holds the design tokens: the palette, the transition curve
(`--ease`), the UI font stack, the fading hairline gradient, the two drop
shadows, and the section rhythm. `--section-block` / `--section-inline` carry the
76/66/58/54 vertical rhythm and the 20/10 gutter that `.section`, `.sectionHero`
and the footer all share, so those four breakpoints are declared once rather than
restated in three stylesheets.

Three CSS modifiers are kept as the compound selectors they were authored as —
`.section.sectionFirst`, `.sectionHero.sectionHeroTight` and `.image.imageTall`.
Only the last still has plain-class rules following it that it has to outrank;
the other two now simply outrank their base class whatever order the two land in.

## Motion

All motion runs through [GSAP](https://gsap.com). There are four moves:

| Move | Where | Behaviour |
| --- | --- | --- |
| Scroll parallax | hero collage, story photos, about photos, post hero, service panels | `useScrollProgress` maps the element's travel through the viewport onto 0-1, eases the value toward its target once per `gsap.ticker` frame, and the component lerps transforms from that |
| Reveal | photos, petals | `useRevealOnView` fades from 0 on first intersection, staggered 200 / 400 / 600 ms |
| Sprig | every section label | a three-step timeline: tumble in, overshoot, settle level |
| Hover zoom | portfolio + Instagram tiles | `useHoverZoom` eases the frame in while the photo pushes out |

The damping in `useScrollProgress` is expressed the same way the design was
authored — a 0-100 "smoothing" number, where the per-frame step is `1 - smoothing / 100`.
Every scroll-linked section uses 97, which is what gives them their slow, trailing
drift; the header hairline uses 94.

`useDriftingPhoto` carries the shared half of that: a frame travelling ±2vh
against a picture scaling to 1.15, which is what the about tiles, a post's hero
plate and the service panels all do. It takes the element to measure separately
from the frame, and an optional extra write for the petals that ride along.

The story splits tilt their frame as it drifts, so they keep their own body. A
service panel travels the same ±2vh, but reads its progress off the whole panel
rather than off the photograph, so the picture is still drifting while the copy beneath
it is climbing the screen. The petals behind the middle panel run further and
turn as they go — -10% to 13% across, -3vh to 6vh down, -20° to 20°.

Every hook bails out to the finished state under `prefers-reduced-motion: reduce`.

The collapsed menu slides with `force3D`, which holds the panel on its own
compositor layer at rest instead of only mid-tween. Its overlay is
`visibility: hidden` while closed, on a transition delay matching the slide, so
the parked panel's drop shadow does not smudge the bar above it.

## Images

`next/image` optimisation is off (`next.config.mjs`). The artwork ships at the sizes
the layout was designed around — re-encoding it would only soften the
photography and shift the intrinsic aspect ratios the layout depends on. Payload
generates the alternates instead, at the same three widths the old export
pipeline used (`collections/Media.ts`), and `lib/media.ts` turns a Media document
into the `src`/`srcSet`/`sizes` triple every `<img>` on the site already took.

Two invariants live there, both measured rather than assumed. **The `sizes` hint
is the switch:** pass one and you get a `srcSet`, omit it and you get a bare
`src` — because "did this photograph ship alternates?" is a fact about the old
export, not about the pixels, and ten of them shipped single-source for no reason
the file records. **No hint without a `srcSet` to pick from:** a slot width with
no candidates behind it is a promise with nothing to keep it. The block that
renders a photograph states the intent, which is also why the project photography
is one upload and only the hint differs between the four-up and two-up grids.

Which files the browser is offered is gated by `npm run fingerprint` — see
[`fingerprints/README.md`](fingerprints/README.md).

## Scope

Every link the site renders now resolves, bar four. A CTA stores a relationship
to a Pages document rather than a typed path, so it cannot point at a page that
does not exist and renaming a slug moves every link to it at once — which is what
retired `/services/services-b`, `/about/about-b`, `/contact` and the eight
`/portfolio/<slug>` links in one go. `components/SiteLink.tsx` used to keep a
`LIVE_ROUTES` allowlist to stop the router prefetching 404s; it is gone, because
the thing it guarded against cannot happen any more.

What is left dead is the footer's `/template-info/{licensing,style-guide,changelog}`
and the `#` on its credit. Those have no destination on this site and never did,
so they are seeded through the link field's `externalUrl` escape hatch rather than
deleted — removing them is now a row an editor drops, not a commit.

There is no `app/not-found.tsx`, so `notFound()` and those four fall through to
Next's default 404.

`CartPanel`, `NavDropdown` and `ChevronIcon` had no inbound references from before
the migration started; phase 6 deleted them, along with the `.dropdown*` rules in
`SiteHeader.module.css` that only `NavDropdown` used.
