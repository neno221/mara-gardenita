import type { Block } from "payload";

/**
 * A row of framed photographs that drift inside their windows, fading in one
 * after another. The about page carries three of them.
 *
 * **The count is the layout.** Two photographs make `.gridPair`, three make
 * `.gridThree`, and the two grids differ in more than a column: they carry
 * different gaps at every breakpoint. So the row does not ask an editor to
 * choose a layout it can already see — it reads the shape off the content, the
 * way the two hand-written grids in `AboutView` did.
 *
 * The count also chooses the `sizes` hint, and that is the part worth stating.
 * The published pair ships alternates and a `fullWidth` hint; the published
 * three-ups ship single-source with no hint at all. Under `lib/media.ts`'s first
 * invariant the caller declares that intent, and here the caller is the row —
 * a hint is a promise about slot width, and the slot is exactly what the count
 * determines. Two photographs across is the row that was published responsive.
 *
 * Banding `shared`: on the about page all six bodies sit in one `<Section>`, and
 * `RenderBlocks` coalesces them (docs/payload-plan.md §2). Giving each its own
 * band would put 152px of padding into every seam.
 */
export const PhotoRow: Block = {
  slug: "photoRow",
  interfaceName: "PhotoRowBlock",
  labels: { singular: "Photo row", plural: "Photo rows" },
  fields: [
    {
      name: "photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      minRows: 2,
      maxRows: 3,
      admin: { description: "Two across, or three. The count sets the grid." },
    },
    {
      name: "stagger",
      type: "number",
      required: true,
      defaultValue: 200,
      min: 0,
      admin: { description: "Milliseconds between each tile's fade-in." },
    },
  ],
};
