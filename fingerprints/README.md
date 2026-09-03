# Fingerprint baselines

The committed "before" for the Payload migration. Captured on 3 September 2026 from
the site at commit `63de302` — the last commit before any Payload work — and gating
every migrated route from phase 1 onward (docs/payload-plan.md, decision E).

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
| `images[].srcSetUrls`, `src` | Compared strictly by default; pass `--ignore-urls` from phase 2, once renaming is expected. |
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
.richText p { margin-bottom: 32.4px; }   /* = 1.8em = one line box, not the 28px default */
.richText p:last-child { margin-bottom: 0; }
```

a **+4.4px** correction per paragraph break. Getting this wrong is invisible by eye and
compounds: the about page has two such breaks per prose run, the services page three.

The affected paragraphs, for reference:

| Route | Paragraphs with `brs: 2` | Height at 1440 |
|---|---|---|
| `/about` | 2 | 259px each |
| `/services` | 3 | 194 / 292 / 194px |

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
