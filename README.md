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

| Route | Source page | Notes |
| --- | --- | --- |
| `/` | Home B | hero collage, services, story splits, portfolio grid, testimonials |
| `/portfolio` | Portfolio | masthead + two-up project grid |
| `/about/about-c` | About C | masthead + photo rows, prose, press row, testimonials |
| `/blog` | Blog | masthead + the journal entries, photo overlapping a white plate |
| `/post/<slug>` | Post | masthead, drifting hero plate, long-form prose |
| `/services/services-c` | Services C | masthead + three service panels on an unequal two-column grid |

The about headline reads "About Lovio" — one `o` — because that is the word the
source page sets, even though the wordmark beside it reads Loovio. The metadata
follows the wordmark, as the other pages do.

## Layout

```
app/
  layout.tsx              fonts + document metadata
  page.tsx                renders <HomeView />
  portfolio/page.tsx      renders <PortfolioView />, page metadata
  about/about-c/page.tsx  renders <AboutView />, page metadata
  blog/page.tsx           renders <JournalView />, page metadata
  post/[slug]/page.tsx    renders <JournalPost />, per-post metadata + static params
  services/services-c/page.tsx  renders <ServicesView />, page metadata
  globals.css             design tokens, reset, typography scale
components/
  SiteShell.tsx       header + clipping page body + footer, shared by every page
  SiteHeader.tsx      sticky bar, dropdowns, cart, collapsed menu
  SiteFooter.tsx      Instagram row, link columns, wordmark
  Section.tsx         a page section: the padded band + the 1200px column
  HeroTop.tsx         the masthead block, plus HeroSection and PageMasthead
  HomeView.tsx        home page section order
  Hero.tsx            HeroTop + the parallax photo collage
  ServiceGrid.tsx     three-up services, read from lib/services
  StorySplit.tsx      the mirrored text/photo sections
  AboutView.tsx       the about page
  AboutPhoto.tsx      one framed, scroll-drifting photograph on the about page
  PortfolioCard.tsx   one project tile, `grid` (four-up) or `feature` (two-up)
  PortfolioGrid.tsx   the four-up grid on the home page
  PortfolioView.tsx   the portfolio page
  JournalCard.tsx     one journal entry: photograph overlapped by a white plate
  JournalView.tsx     the journal page
  JournalPost.tsx     a single post: drifting hero plate + the prose body
  ServicesView.tsx    the services page
  ServicePanel.tsx    one service: a drifting photograph, then glyph, title and copy
  Testimonials.tsx    cross-fading quote slider
  photo.module.css    the shared photo plate and the picture that fills it
  Section.module.css  section rhythm, block headings, shared type
  buttons.module.css  the outlined button and the underlined link
  JournalList.module.css    (no component) the run of entries, used by JournalView
  PortfolioList.module.css  (no component) the two-up grid, used by PortfolioView
  *.module.css        otherwise one stylesheet per component, alongside it
lib/
  metadata.ts         the shared page/article metadata shape + the site URL
  easing.ts           cubic-bezier solvers used as GSAP eases
  useScrollProgress.ts  scroll-linked, damped 0-1 progress
  useDriftingPhoto.ts   the shared frame-drift + picture-zoom parallax
  useRevealOnView.ts    staggered fade-in on first intersection
  useHoverZoom.ts       paired frame/photo hover scale
  artwork.ts            responsive sources for the photography, and the petals
  projects.ts           the four case studies
  journal.ts            the four journal entries and their artwork
  services.ts           the three services, their photography and their copy
```

`SiteShell`, `SiteHeader`, `SiteFooter`, `Section` and `Testimonials` are shared
across the pages; `PortfolioCard` is shared by the two project grids. Every
interior page opens with `PageMasthead` — the closed-up hero band wrapped around
`HeroTop` — and the home page uses `HeroSection` directly so it can hang the
collage below the masthead. `Section` renders the padded band and the 1200px
column that nine call sites used to write out by hand; `first` marks the section
that opens a page body, whose leading space the hero above already carries.
`HeroTop` renders its label as a `<time>` where the page passes
`subtitleDateTime`, which is how a post's publication date reaches the masthead.

The four route files build their metadata with `pageMetadata`, which fills in the
matching Open Graph and Twitter cards; a post passes `article` as well, for its
publication time and hero image. Set `NEXT_PUBLIC_SITE_URL` for a deploy and it
becomes `metadataBase`, so the share-card image URLs are absolute; leave it unset
and no `metadataBase` is emitted at all, which lets Next fall back to the
deployment host rather than baking a placeholder into every card.

Each journal card lays its photograph and its plate on the same four-track grid
row — `1fr 50px 50px 1fr` — with the photograph spanning tracks 1-2 and the plate
tracks 2-4, so they overlap across the one shared 50px track. The plate rides 25px lower
and pulls the same amount back off the bottom, leaving the row exactly as tall as
the taller of the two. Below 767px the grid collapses to one column and the
photograph takes `order: -9999` to stay on top.

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
| Hover zoom | portfolio, journal + Instagram tiles | `useHoverZoom` eases the frame in while the photo pushes out |

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
the layout was designed around, and the `srcset` widths in `lib/artwork.ts`,
`lib/journal.ts` and `lib/services.ts` mirror those sizes — re-encoding them
would only soften the photography and shift the intrinsic aspect ratios the
layout depends on. The project photography is shared
between the two grids, so the sources are declared once and only the `sizes` hint
differs per layout.

Each of those files builds its `srcSet` from the file stem and the widths that
were exported, rather than spelling the candidate list out: the alternates are
named `<stem>-<width>.jpg` and the full-size export keeps the bare stem and
carries its own intrinsic width as the last candidate. A photograph that shipped
without alternates stays single-source, because a `sizes` hint with no `srcset`
has nothing to pick from.

## Scope

The header, footer and cards link to the rest of the template's sitemap
(`/shop`, `/about/about-a`, `/portfolio/<slug>`, …), which does not exist yet.
`components/SiteLink.tsx` keeps a `LIVE_ROUTES` set and disables prefetching for
everything outside it; add each route there as its page lands. Posts are matched
by the `/post/` prefix rather than by importing `JOURNAL_POSTS`, which would pull
every post's copy and srcSets into the client bundle of every page.

There is no `app/not-found.tsx`, so `notFound()` and the dead sitemap links fall
through to Next's default 404.

The cart button opens the empty-cart dialog. There is no commerce backend behind it.
