/**
 * Phase 1 acceptance: prove one upload produces the three derivatives, and that a
 * source narrower than a target width is clamped rather than upscaled.
 *
 *   npm run payload -- run scripts/verify-media.ts
 *
 * Uses the Local API, so it needs no login and no running dev server. It creates
 * Media documents, checks them, and deletes them again — the database is the only
 * copy of the real content (decision C), so it leaves no fixtures behind.
 *
 * What this established, and what phase 2 has to do about it:
 *
 *   `withoutEnlargement: true` does not stop Payload declaring a size, only
 *   enlarging into it. An 803w source still yields a `w1080` entry — at 803w, the
 *   original's own width. So `lib/media.ts` must de-duplicate width descriptors
 *   when it assembles a srcSet, or `hero-left` emits `803w` twice and the browser
 *   is handed a candidate list the current site never produced.
 */
import { getPayload } from "payload";
import config from "../payload.config";

const CASES = [
  { file: "public/images/journal-guest-list-hero.jpg", intrinsic: 1372, expectDistinct: [500, 800, 1080] },
  // Narrower than two of the three targets: w800 is a real downscale (803 -> 800),
  // w1080 can only clamp back to 803, which duplicates the original.
  { file: "public/images/hero-left.jpg", intrinsic: 803, expectDistinct: [500, 800] },
];

const payload = await getPayload({ config });
let failures = 0;

for (const testCase of CASES) {
  const doc = await payload.create({
    collection: "media",
    filePath: testCase.file,
    data: { alt: "", category: "photography" },
  });

  const sizes = (doc.sizes ?? {}) as Record<string, { width?: number | null } | null>;
  const widths = Object.entries(sizes)
    .filter(([, v]) => v && v.width)
    .map(([name, v]) => ({ name, width: v!.width as number }));

  console.log("\n" + testCase.file + "  (" + testCase.intrinsic + "w source)");
  console.log("  filename    " + doc.filename);
  console.log("  original    " + doc.width + "w");
  console.log("  derivatives " + widths.map((w) => w.name + " " + w.width + "w").join(", "));

  // 1. Three derivatives are always declared.
  if (widths.length !== 3) {
    failures++;
    console.log("  FAIL expected 3 derivatives, got " + widths.length);
  }

  // 2. None is wider than the source — the actual guarantee withoutEnlargement gives.
  const enlarged = widths.filter((w) => w.width > testCase.intrinsic);
  if (enlarged.length) {
    failures++;
    console.log("  FAIL upscaled: " + enlarged.map((w) => w.name + "=" + w.width).join(", "));
  }

  // 3. The distinct widths below the original are the ones a srcSet can actually use.
  const distinct = [...new Set(widths.map((w) => w.width))].filter((w) => w < testCase.intrinsic).sort((a, b) => a - b);
  const want = testCase.expectDistinct.join(",");
  if (distinct.join(",") !== want) {
    failures++;
    console.log("  FAIL usable srcSet widths " + distinct.join(",") + ", expected " + want);
  }

  const collides = widths.filter((w) => w.width === doc.width).map((w) => w.name);
  if (collides.length) {
    console.log("  note: " + collides.join(", ") + " clamped to the original's " + doc.width + "w — phase 2 must de-duplicate");
  }
  if (!failures) console.log("  OK");

  await payload.delete({ collection: "media", id: doc.id });
}

console.log("");
if (failures) {
  console.error(failures + " check(s) failed.");
  process.exit(1);
}
console.log("Media pipeline OK. Test documents removed.");
process.exit(0);
