/**
 * The acceptance gate for the Payload migration (docs/payload-plan.md, decision E).
 *
 * Captures a DOM/attribute fingerprint of every route at two widths and diffs it
 * against a committed baseline. Screenshots are the supplement; this is the test.
 *
 *   npx tsx scripts/fingerprint.ts --capture     write the baseline
 *   npx tsx scripts/fingerprint.ts               check against it
 *
 * Per route per width it records:
 *   - every <img>'s src, PARSED srcSet width descriptors, and sizes
 *   - the class-name sequence of the whole painted tree
 *   - computed box metrics of every <Section> and every <p>
 *
 * Two deliberate choices, both from measurement rather than taste:
 *
 * 1. `deviceScaleFactor: 1` is pinned. Viewport emulation otherwise flips
 *    devicePixelRatio between runs, which re-resolves `medium` border widths and
 *    rounds `.5` offsets differently. Every element then differs and the diff
 *    looks catastrophic while nothing has actually changed.
 * 2. CSS-module hashes are stripped: `Section_section__rXxcK` -> `Section_section`.
 *    Next derives that suffix from the file path and contents, so editing a
 *    stylesheet in phase 4 would otherwise register as a structural change on
 *    every element that uses it.
 *
 * Run it against `next dev`. A production build hashes class names to opaque
 * strings the normaliser cannot see through, and building would clobber a
 * running dev server's .next in any case.
 */
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(REPO, "fingerprints");

/** The four URLs the site actually serves. */
const ROUTES = [
  { id: "home", path: "/" },
  { id: "about", path: "/about" },
  { id: "services", path: "/services" },
  { id: "portfolio", path: "/portfolio" },
] as const;

/** Desktop, and the narrowest breakpoint. Height is fixed so `vh` units resolve alike. */
const WIDTHS = [1440, 375] as const;
const VIEWPORT_HEIGHT = 900;

type ImageRecord = {
  i: number;
  cls: string;
  alt: string;
  loading: string | null;
  src: string | null;
  /** Sorted width descriptors. The gate: Payload renames files, it must not drop widths. */
  srcSetWidths: number[];
  /** The URLs behind those descriptors. Expected to move in phase 2; see --ignore-urls. */
  srcSetUrls: string[];
  sizes: string | null;
  naturalWidth: number;
};

type BoxRecord = {
  i: number;
  tag: string;
  cls: string;
  /** First 48 characters, so a diff can name which paragraph moved. */
  text: string;
  /** <br> children. Decision E turns `<p><br><br></p>` into two <p>; this is the witness. */
  brs: number;
  margin: number[];
  padding: number[];
  w: number;
  h: number;
  fontSize: number;
  lineHeight: number;
};

type Capture = {
  route: string;
  path: string;
  width: number;
  title: string;
  scrollHeight: number;
  classSequence: string[];
  images: ImageRecord[];
  boxes: BoxRecord[];
};

/* ------------------------------------------------------------------ capture */

/** Runs in the page. Kept self-contained: it is serialised across the boundary. */
function collect() {
  // Next hashes CSS-module class names from the file's path and contents, and it
  // changed where the hash sits between 15 and 16:
  //
  //   Next 15   Section_section__rXxcK              (hash last)
  //   Next 16   Section-module__27SNAG__section     (hash in the middle)
  //
  // Both canonicalise to `Section_section`, so a baseline survives the framework
  // upgrade and a phase-4 stylesheet edit alike. next/font classes carry their own
  // 8-hex digest (`marcellus_f7fbba0d-module__KTf9Wa__variable`), which moves when
  // layout.tsx moves, so that is stripped too.
  const NEXT16 = /^(.+?)-module__[A-Za-z0-9_-]+?__(.+)$/;
  const NEXT15 = /^(.+)__[A-Za-z0-9_-]{4,10}$/;
  const FONT_DIGEST = /_[0-9a-f]{8}_/;

  const canon = (c: string): string => {
    const m16 = c.match(NEXT16);
    if (m16) c = m16[1] + "_" + m16[2];
    else {
      const m15 = c.match(NEXT15);
      if (m15) c = m15[1];
    }
    return c.replace(FONT_DIGEST, "_");
  };

  const SKIP = new Set([
    "SCRIPT",
    "STYLE",
    "LINK",
    "META",
    "TITLE",
    "NOSCRIPT",
    "TEMPLATE",
    "HEAD",
    "NEXT-ROUTE-ANNOUNCER",
  ]);

  const norm = (cls: unknown): string =>
    String(cls ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map(canon)
      .sort()
      .join(" ");

  const px = (v: string): number => Math.round(parseFloat(v) || 0);
  const sides = (s: CSSStyleDeclaration, prop: string): number[] => [
    px(s.getPropertyValue(prop + "-top")),
    px(s.getPropertyValue(prop + "-right")),
    px(s.getPropertyValue(prop + "-bottom")),
    px(s.getPropertyValue(prop + "-left")),
  ];

  // --- the painted tree, in document order --------------------------------
  const classSequence: string[] = [];
  const walk = (el: Element) => {
    if (SKIP.has(el.tagName)) return;
    const c = norm(el.className);
    classSequence.push(c ? el.tagName.toLowerCase() + "." + c : el.tagName.toLowerCase());
    for (const child of Array.from(el.children)) walk(child);
  };
  for (const child of Array.from(document.body.children)) walk(child);

  // --- every <img> ---------------------------------------------------------
  const images = Array.from(document.images).map((img, i) => {
    const raw = img.getAttribute("srcset") ?? "";
    const parsed = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((entry) => {
        const parts = entry.split(/\s+/);
        return { url: parts[0], w: parseInt(parts[1] ?? "", 10) };
      });
    return {
      i,
      cls: norm(img.className),
      alt: img.getAttribute("alt") ?? "",
      loading: img.getAttribute("loading"),
      src: img.getAttribute("src"),
      srcSetWidths: parsed
        .map((p) => p.w)
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b),
      srcSetUrls: parsed.map((p) => p.url),
      sizes: img.getAttribute("sizes"),
      naturalWidth: img.naturalWidth,
    };
  });

  // --- the bands, and every paragraph --------------------------------------
  const isBand = (el: Element) =>
    norm(el.className)
      .split(" ")
      .some((c) => /^(Section_section|HeroTop_section)/.test(c));

  const targets = Array.from(document.querySelectorAll<HTMLElement>("div, p")).filter(
    (el) => el.tagName === "P" || isBand(el),
  );

  const boxes = targets.map((el, i) => {
    const s = getComputedStyle(el);
    return {
      i,
      tag: el.tagName.toLowerCase(),
      cls: norm(el.className),
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 48),
      brs: el.querySelectorAll(":scope > br").length,
      margin: sides(s, "margin"),
      padding: sides(s, "padding"),
      w: Math.round(el.offsetWidth),
      h: Math.round(el.offsetHeight),
      fontSize: px(s.fontSize),
      lineHeight: px(s.lineHeight),
    };
  });

  return {
    title: document.title,
    scrollHeight: document.documentElement.scrollHeight,
    classSequence,
    images,
    boxes,
  };
}

async function capturePage(
  page: Page,
  url: string,
  width: number,
): Promise<Omit<Capture, "route" | "path" | "width">> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });

  for (let attempt = 1; ; attempt++) {
    // A cold `next dev` compiles the route on first request and can abort the
    // navigation while it does. That is a build race, not a page failure, so the
    // second attempt hits a warm route and succeeds.
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
    } catch (err) {
      if (attempt >= 3) throw err;
      await page.waitForTimeout(2000);
      continue;
    }

    const body = await settleAndCollect(page);

    // `img.complete` goes true on a failed request as well as a successful one, so
    // the stability wait can settle with every image broken — which reads out
    // as a page-wide `naturalWidth: 0` diff and looks exactly like a regression. It
    // is not; it is the dev server refusing image requests while it compiles
    // something else. Retrying is the difference between a gate people trust and a
    // gate people learn to re-baseline past.
    const broken = body.images.filter((img) => img.naturalWidth === 0).length;
    if (!broken || attempt >= 3) {
      if (broken) {
        console.log(
          "  warning  " + broken + " image(s) still undecoded after 3 attempts; reporting anyway",
        );
      }
      return body;
    }
    await page.waitForTimeout(2000);
  }
}

/** Quiet the page down to something measurable, then read it. */
async function settleAndCollect(page: Page): Promise<Omit<Capture, "route" | "path" | "width">> {
  // Kill transition and animation timing. Reveal-on-view drives opacity and
  // transform, neither of which moves a box, but a half-run transition would
  // still jitter the computed values this reads.
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;" +
      "transition-duration:0s!important;transition-delay:0s!important}",
  });

  // Below-the-fold images stay lazy forever in a headless viewport, so their
  // naturalWidth would read 0 and the capture would depend on scroll position.
  await page.evaluate(() => {
    for (const img of Array.from(document.images)) img.loading = "eager";
  });

  // Gate on the same three signals every time: tokens applied, fonts resolved,
  // and the decoded-image count gone stable.
  await page.waitForFunction(
    () =>
      getComputedStyle(document.documentElement).getPropertyValue("--font-body").trim() !== "" &&
      document.fonts.status === "loaded",
    undefined,
    { timeout: 30_000 },
  );
  await page.waitForFunction(
    () => {
      const done = Array.from(document.images).filter((i) => i.complete).length;
      const w = window as unknown as { __fpLast?: number; __fpStable?: number };
      if (w.__fpLast === done) w.__fpStable = (w.__fpStable ?? 0) + 1;
      else {
        w.__fpLast = done;
        w.__fpStable = 0;
      }
      return (w.__fpStable ?? 0) >= 3;
    },
    undefined,
    { timeout: 30_000, polling: 250 },
  );

  return page.evaluate(collect);
}

/* --------------------------------------------------------------- comparison */

type Diff = { kind: string; where: string; baseline: string; current: string };

function diffCaptures(base: Capture, cur: Capture, tolerance: number, ignoreUrls: boolean): Diff[] {
  const out: Diff[] = [];
  const near = (a: number, b: number) => Math.abs(a - b) <= tolerance;

  if (base.title !== cur.title) {
    out.push({ kind: "title", where: "document.title", baseline: base.title, current: cur.title });
  }
  if (!near(base.scrollHeight, cur.scrollHeight)) {
    out.push({
      kind: "height",
      where: "document scrollHeight",
      baseline: String(base.scrollHeight),
      current: String(cur.scrollHeight),
    });
  }

  // --- structure -----------------------------------------------------------
  const bs = base.classSequence;
  const cs = cur.classSequence;
  if (bs.length !== cs.length) {
    out.push({
      kind: "structure",
      where: "element count",
      baseline: String(bs.length),
      current: String(cs.length),
    });
  }
  let structural = 0;
  for (let i = 0; i < Math.max(bs.length, cs.length); i++) {
    if (bs[i] === cs[i]) continue;
    if (++structural > 20) {
      out.push({ kind: "structure", where: "...", baseline: "(truncated)", current: "(truncated)" });
      break;
    }
    out.push({
      kind: "structure",
      where: "element #" + i,
      baseline: bs[i] ?? "(absent)",
      current: cs[i] ?? "(absent)",
    });
  }

  // --- images --------------------------------------------------------------
  if (base.images.length !== cur.images.length) {
    out.push({
      kind: "images",
      where: "<img> count",
      baseline: String(base.images.length),
      current: String(cur.images.length),
    });
  }
  for (let i = 0; i < Math.min(base.images.length, cur.images.length); i++) {
    const b = base.images[i];
    const c = cur.images[i];
    const at = "<img> #" + i + " (" + (b.cls || "no class") + ")";
    const cmp = (field: string, x: unknown, y: unknown) => {
      const bx = JSON.stringify(x);
      const cy = JSON.stringify(y);
      if (bx !== cy) out.push({ kind: "images", where: at + " " + field, baseline: bx, current: cy });
    };
    cmp("srcSetWidths", b.srcSetWidths, c.srcSetWidths);
    cmp("sizes", b.sizes, c.sizes);
    cmp("alt", b.alt, c.alt);
    cmp("loading", b.loading, c.loading);
    if (!near(b.naturalWidth, c.naturalWidth)) cmp("naturalWidth", b.naturalWidth, c.naturalWidth);
    if (!ignoreUrls) {
      cmp("src", b.src, c.src);
      cmp("srcSetUrls", b.srcSetUrls, c.srcSetUrls);
    }
  }

  // --- boxes ---------------------------------------------------------------
  if (base.boxes.length !== cur.boxes.length) {
    out.push({
      kind: "boxes",
      where: "measured box count",
      baseline: String(base.boxes.length),
      current: String(cur.boxes.length),
    });
  }
  for (let i = 0; i < Math.min(base.boxes.length, cur.boxes.length); i++) {
    const b = base.boxes[i];
    const c = cur.boxes[i];
    const at = b.tag + " #" + i + " (" + (b.cls || "no class") + ') "' + b.text.slice(0, 28) + '"';
    for (const k of ["w", "h", "fontSize", "lineHeight"] as const) {
      if (!near(b[k], c[k])) {
        out.push({ kind: "boxes", where: at + " " + k, baseline: String(b[k]), current: String(c[k]) });
      }
    }
    for (const k of ["margin", "padding"] as const) {
      if (b[k].some((n, j) => !near(n, c[k][j]))) {
        out.push({
          kind: "boxes",
          where: at + " " + k,
          baseline: JSON.stringify(b[k]),
          current: JSON.stringify(c[k]),
        });
      }
    }
    if (b.brs !== c.brs) {
      out.push({ kind: "boxes", where: at + " <br> count", baseline: String(b.brs), current: String(c.brs) });
    }
  }

  return out;
}

/* --------------------------------------------------------------------- main */

function arg(name: string): string | undefined {
  const i = process.argv.indexOf("--" + name);
  return i === -1 ? undefined : process.argv[i + 1];
}
const flag = (name: string) => process.argv.includes("--" + name);

async function main() {
  const baseUrl = arg("url") ?? "http://localhost:3000";
  const write = flag("capture") || flag("update");
  const ignoreUrls = flag("ignore-urls");
  const tolerance = parseInt(arg("tolerance") ?? "1", 10);
  const only = arg("route");

  const routes = only ? ROUTES.filter((r) => r.id === only) : [...ROUTES];
  if (!routes.length) {
    console.error("No route matched --route " + only);
    process.exit(2);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  console.log(
    (write ? "Capturing " : "Checking ") +
      routes.length +
      " routes x " +
      WIDTHS.length +
      " widths against " +
      baseUrl +
      "\n",
  );

  let browser: Browser | undefined;
  let failures = 0;
  let captured = 0;

  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: WIDTHS[0], height: VIEWPORT_HEIGHT },
      deviceScaleFactor: 1, // pinned; see the header note
      reducedMotion: "reduce",
    });
    // tsx compiles this file with esbuild's `keepNames`, which rewrites named
    // functions as `__name(fn, "...")`. That helper is defined in the Node bundle,
    // not in the page, so `collect` throws a ReferenceError the moment it is
    // serialised across the boundary. The shim is passed as a raw string so
    // esbuild cannot rewrite the shim itself.
    await context.addInitScript({ content: "globalThis.__name = globalThis.__name || ((fn) => fn);" });

    const page = await context.newPage();
    page.setDefaultTimeout(30_000);

    for (const route of routes) {
      for (const width of WIDTHS) {
        const name = route.id + "@" + width;
        const file = join(OUT_DIR, name + ".json");
        const body = await capturePage(page, baseUrl + route.path, width);
        const capture: Capture = { route: route.id, path: route.path, width, ...body };

        if (write) {
          writeFileSync(file, JSON.stringify(capture, null, 2) + "\n");
          console.log(
            "  captured " +
              name.padEnd(26) +
              capture.classSequence.length +
              " els, " +
              capture.images.length +
              " imgs, " +
              capture.boxes.length +
              " boxes, " +
              capture.scrollHeight +
              "px tall",
          );
          captured++;
          continue;
        }

        if (!existsSync(file)) {
          console.log("  MISSING  " + name.padEnd(26) + "no baseline; run with --capture");
          failures++;
          continue;
        }

        const baseline: Capture = JSON.parse(readFileSync(file, "utf8"));
        const diffs = diffCaptures(baseline, capture, tolerance, ignoreUrls);
        if (!diffs.length) {
          console.log("  clean    " + name);
          continue;
        }

        failures++;
        console.log("  DIFF     " + name.padEnd(26) + diffs.length + " difference(s)");
        for (const d of diffs.slice(0, 25)) {
          console.log(
            "             [" +
              d.kind +
              "] " +
              d.where +
              "\n               baseline: " +
              d.baseline +
              "\n               current:  " +
              d.current,
          );
        }
        if (diffs.length > 25) console.log("             ... and " + (diffs.length - 25) + " more");
      }
    }
  } finally {
    await browser?.close();
  }

  console.log("");
  if (write) {
    console.log("Wrote " + captured + " captures to fingerprints/");
    return;
  }
  if (failures) {
    console.error(failures + " capture(s) differ from the baseline.");
    process.exit(1);
  }
  console.log("All " + routes.length * WIDTHS.length + " captures match the baseline.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
