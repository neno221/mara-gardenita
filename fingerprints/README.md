# Fingerprint baselines

The committed "before" for the Payload migration. First captured on 3 September 2026
from the site at commit `63de302` — the last commit before any Payload work — and
gating every migrated route from phase 1 onward (docs/payload-plan.md, decision E).

**Re-baselined once, in phase 3.** Twelve of the eighteen captures moved; the reasons
are enumerated under [What moved in phase 3](#what-moved-in-phase-3) below, and the
decision to move the gate rather than meet it is recorded as decision I in the plan.
Everything else — including all nine `about` and `services` band heights and every
`scrollHeight` outside the two noted — reproduced exactly.

```bash
npm run db:up                       # not needed for the fingerprint, but phase 1 wants it
npm run dev                         # note the port
npm run fingerprint -- --url http://localhost:PORT
```

`npm run fingerprint:capture` rewrites the baselines. Do not run it to make a failing
check pass — that is the one action that silently destroys the gate.

## What is in a capture

18 files, `<route>@<width>.json`, for 9 routes × 2 widths (1440 and 375, both at a
fixed 900px viewport height so `vh` units resolve alike).

| Field | Why |
|---|---|
| `classSequence` | Every painted element in document order, `tag.classes`. Catches any structural change. |
| `images[].srcSetWidths` | **Parsed** width descriptors. Payload renames derivatives to `<stem>-500x<h>.jpg`, so the URLs move in phase 2 while the widths must not. |
| `images[].srcSetUrls`, `src` | Compared strictly by default. `--ignore-urls` is for the run in which a photograph *moves* into Payload; the phase-3 baseline already records the `/api/media/file/…` URLs, so a plain `npm run fingerprint` is strict again. |
| `images[].sizes` | The seven hints from `lib/artwork.ts`, which phase 2 lifts into `lib/sizes.ts`. |
| `boxes[]` | Computed margin, padding, width, height, font-size and line-height of every `<Section>` and every `<p>`. This is what decision E is gated on. |
| `boxes[].brs` | `<br>` children. The witness for the paragraph conversion below. |
| `scrollHeight` | One number per route; any total-height drift shows here first. |

The plan says 7 routes / 14 captures. This is 9 / 18: the four posts are captured
individually rather than sampled, because their `srcSet`s genuinely differ —
`journal-napkin-fold-card` ships single-source, `journal-guest-list-hero` carries
`[800, 1080]` where the other three carry `[1080]`. Sampling one post would leave
three ungated on exactly the axis phase 2 is guarding.

## The decision-E calibration constant

Measured off this baseline rather than derived from the type token, as the plan asks.

```
body    font-size: 18px, line-height: 180%   ->  line box = 32.4px
p       margin-bottom: 28px
```

Today's prose is one `<p>` containing `<br><br>` (`brs: 2` in the about and services
captures). Two `<br>`s open **one empty line box between the two text blocks: 32.4px**.
Lexical will emit two `<p>` elements instead, whose gap is `p`'s margin-bottom: **28px**.

So the phase-4 `.richText` wrapper needs

```css
.richText p:not(:last-child) { margin-bottom: 1lh; }   /* one line box, not the 28px default */
```

a **+4.4px** correction per paragraph break. Getting this wrong is invisible by eye and
compounds: the about page has two such breaks per prose run, the services page three.

**Applied in phase 3** to `ServicePanel.module.css`, where the services page's three
copy blocks converted. `1lh` rather than the literal `32.4px`: it resolves against the
element's own line box, so it holds at every breakpoint and through a type change.

Note what the rule does **not** do. An earlier draft of it zeroed `:last-child`; the
measurement says otherwise for the service panel, whose single `<p>` carried 28px
below itself and whose section spacing was set against that. The trailing margin is
left alone and only the *inter*-paragraph gap is corrected. Phase 4's `prose` block
sits inside `.prose`, which brings its own 110px margin — whether that context wants
the trailing 28px is a separate measurement, to be taken there.

The affected paragraphs, for reference:

| Route | Paragraphs with `brs: 2` | Height at 1440 |
|---|---|---|
| `/about` | 2 | 259px each |
| `/services` | 3 | 194 / 292 / 194px |

With the rule applied, `/services` carries six `<p>` elements where it carried three
and reproduces both bands to the pixel — `HeroSection` 388px and `Section(first)`
2634px at 1440, 361px and 3119px at 375 — with `scrollHeight` unchanged at both
widths. `/about` is untouched until phase 4 turns its two prose runs into blocks.

## What moved in phase 3

Two causes, both about images, and neither one a layout the migration chose.

**1. A photograph gains `srcSet` candidates it never shipped with.** Payload generates
all three image sizes from every original; the old export pipeline shipped whatever it
happened to ship. Six photographs are affected, across twelve captures:

| Photograph | Route(s) | Shipped | Now | Delta |
|---|---|---|---|---|
| `journal-napkin-fold-hero` | post | 1080, 1372 | 500, 800, 1080, 1372 | +500, +800 |
| `journal-full-service-hero` | post | 1080, 1372 | 500, 800, 1080, 1372 | +500, +800 |
| `journal-family-affair-hero` | post | 1080, 1372 | 500, 800, 1080, 1372 | +500, +800 |
| `journal-guest-list-hero` | post | 800, 1080, 1372 | 500, 800, 1080, 1372 | +500 |
| `journal-napkin-fold-card` | `/blog` | *(bare)* | 500, 735 | + a `srcSet` and its `sizes` |
| `portfolio-briana-richard` | `/`, `/portfolio` | *(bare)* | 500, 628 | + a `srcSet` and its `sizes` |

The plan's phase-3 note anticipated the first four. The last two are the same thing
arriving through `lib/media.ts`'s first invariant: both shipped single-source for no
reason the pixels record — their same-width siblings *did* ship a 500 — so the only
way to reproduce them would be a table of the ten filenames that happened to ship
bare, consulted at render. Phase 6 deletes `lib/artwork.ts` to stop doing exactly that.

`naturalWidth` moves with them, and is not a second finding. On an image with `w`
descriptors the property is **density-corrected**, so it reports the CSS slot width
rather than the file's: `journal-napkin-fold-card` reads 1382 at 1440 because its hint
resolves to `96vw`. An image that gains a `srcSet` therefore always "changes"
`naturalWidth`, without a pixel moving.

**2. `sharp` rounds a derivative's height down where the old exporter rounded up.**
`portfolio-*` is 628 x 871; at 500 wide that is 693.47px tall. The old export wrote
`500x694`, Payload writes `500x693`. Wherever the layout takes its height *from* the
image — the `max-width: 479px` rule where `.image` becomes `height: 100%` — that is
worth about 0.7 CSS px per card:

| Capture | scrollHeight | Cause |
|---|---|---|
| `home@375` | 9022 -> 9020 | four portfolio cards, stacked one-up |
| `portfolio@375` | 4305 -> 4302 | the same four, two-up crop |

The `+/-1px` moves on `home@1440` and the four `post-*@375` captures are the same
effect at sub-pixel scale, and sit inside the checker's default tolerance of 1 — they
appear in the committed JSON but were never reported as diffs.

Nothing else in the eighteen captures moved. `/about` is byte-identical apart from the
media URLs, and `/services` moved only in `classSequence` — three `<p>` becoming six,
which is [the calibrated conversion](#the-decision-e-calibration-constant) above.

## Known noise, and why it is absent

Three things make a naive fingerprint useless in this project. Each is handled in
`scripts/fingerprint.ts` rather than tolerated:

1. **`devicePixelRatio` is not stable under viewport emulation** — it flips between 1,
   1.25 and 2, which re-resolves `medium` border widths and rounds `.5` offsets
   differently on *every* element. Playwright pins `deviceScaleFactor: 1`.
2. **CSS-module class names carry a content hash** (`Section_section__rXxcK`). Editing a
   stylesheet in phase 4 would otherwise read as a structural change everywhere it is
   used. The hash suffix is stripped; the module and local name are kept.
3. **Lazy images never load below the fold** in a headless viewport, so `naturalWidth`
   would read 0 and depend on scroll position. Every image is forced eager before
   measurement, and the capture waits for the decoded count to go stable.

Run against `next dev`, not a production build: production hashes class names to opaque
strings the normaliser cannot see through, and `next build` clobbers a running dev
server's `.next`.
