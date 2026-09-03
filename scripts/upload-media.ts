/**
 * Puts photographs from `public/images` into the Media library, and checks that
 * `toArtwork` reproduces the `srcSet` the published site shipped.
 *
 *   npm run payload -- run scripts/upload-media.ts                 # the three hero plates
 *   npm run payload -- run scripts/upload-media.ts hero-left       # one stem
 *
 * Phase 2 of docs/payload-plan.md moves exactly the home hero onto Payload;
 * everything else stays hardcoded until the phase-3 seed. So the default set is the
 * three collage plates, and the script is idempotent — a stem already in the library
 * is reused, not duplicated, which means it is safe to rerun while iterating.
 *
 * The check at the end is the point. It reads the phase-0 fingerprint straight off
 * disk and asserts that the `srcSet` width descriptors and the `sizes` hint
 * `toArtwork` produces are the ones the baseline recorded — offline, before a
 * browser is involved. `npm run fingerprint` is still the gate; this catches the
 * failure a minute earlier and says which width moved.
 *
 * Only the **full-size originals** are uploaded. The `-500`/`-800`/`-1080` files in
 * `public/images` are outputs of the old export pipeline; Payload regenerates them.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import config from "../payload.config";
import { toArtwork } from "../lib/media";
import { SIZES, type SizesHint } from "../lib/sizes";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * The stems phase 2 owns, with the slot each one renders into. The hint is not
 * derivable from the file — it is a fact about the layout — so it is stated here
 * and will move onto the block config in phase 4.
 */
const HERO: Record<string, SizesHint> = {
  "hero-left": SIZES.heroSide,
  "hero-right": SIZES.heroSide,
  "hero-center": SIZES.heroCenter,
};

/** The baseline capture the assertions are read from. */
const BASELINE = join(REPO, "fingerprints", "home@1440.json");

type BaselineImage = { src: string | null; srcSetWidths: number[]; sizes: string | null };

/** The phase-0 record for `/images/<stem>.jpg`, or null if the route never rendered it. */
function baselineFor(stem: string): BaselineImage | null {
  const capture = JSON.parse(readFileSync(BASELINE, "utf8")) as { images: BaselineImage[] };
  return capture.images.find((img) => img.src === `/images/${stem}.jpg`) ?? null;
}

/** The width descriptors of a srcSet, as the fingerprint parses them. */
function widthsOf(srcSet: string | undefined): number[] {
  if (!srcSet) return [];
  return srcSet
    .split(",")
    .map((entry) => parseInt(entry.trim().split(/\s+/)[1] ?? "", 10))
    .filter((width) => !Number.isNaN(width))
    .sort((a, b) => a - b);
}

const stems = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const targets = stems.length ? stems : Object.keys(HERO);

const payload = await getPayload({ config });
let failures = 0;

for (const stem of targets) {
  const sizes = HERO[stem];
  if (!sizes) {
    console.error(`\n${stem}\n  FAIL no sizes hint declared for this stem; add it to HERO above`);
    failures++;
    continue;
  }

  const filename = `${stem}.jpg`;
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  });

  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: "media",
      filePath: join(REPO, "public", "images", filename),
      // The collage plates are decorative; Hero renders them with alt="", and the
      // baseline records alt="" on all three.
      data: { alt: "", category: "photography" },
    }));

  const artwork = toArtwork(doc, sizes);
  const widths = widthsOf(artwork.srcSet);

  console.log(`\n${filename}  ${existing.docs.length ? "(already in the library)" : "(uploaded)"}`);
  console.log(`  id          ${doc.id}`);
  console.log(`  intrinsic   ${doc.width}x${doc.height}`);
  console.log(`  src         ${artwork.src}`);
  console.log(`  srcSet      ${artwork.srcSet ?? "(none)"}`);
  console.log(`  widths      ${widths.join(", ") || "(none)"}`);
  console.log(`  sizes       ${artwork.sizes ?? "(none)"}`);

  const base = baselineFor(stem);
  if (!base) {
    console.log("  note: no phase-0 record for this stem on the home route; not asserted");
    continue;
  }

  if (widths.join(",") !== base.srcSetWidths.join(",")) {
    console.log(
      `  FAIL srcSet widths ${widths.join(",")}, baseline ${base.srcSetWidths.join(",")}`,
    );
    failures++;
  }
  if ((artwork.sizes ?? null) !== base.sizes) {
    console.log(`  FAIL sizes hint\n         got      ${artwork.sizes}\n         baseline ${base.sizes}`);
    failures++;
  }
  // Duplicated descriptors are the specific failure `withoutEnlargement` invites:
  // w1080 clamps back to an 803w source and collides with the original.
  if (new Set(widths).size !== widths.length) {
    console.log(`  FAIL duplicate width descriptor in ${artwork.srcSet}`);
    failures++;
  }
  if (!failures) console.log("  OK matches the phase-0 baseline");
}

console.log("");
if (failures) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log(`${targets.length} photograph(s) in the library, all matching the phase-0 baseline.`);
process.exit(0);
