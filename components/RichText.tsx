import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Media } from "@/payload-types";
import { toArtwork } from "@/lib/media";

/**
 * Renders a Payload rich-text field as the markup this site already publishes.
 *
 * Three deliberate departures from the library's defaults, each one measured
 * against the phase-0 fingerprint rather than chosen:
 *
 * **No wrapper.** `RichText` normally wraps its output in
 * `<div class="payload-richtext">`. Every caller here already has the element
 * the design puts around the prose — `<article class="body">` on a post, the
 * service panel's block — so a second div is an extra node in the class
 * sequence and a new margin box between the copy and its container.
 * `disableContainer` hands back a fragment and the caller keeps its own element.
 *
 * **`<ul role="list">`, not `<ul class="list-bullet">`.** The default list
 * converter tags the list with a class the site's stylesheet knows nothing
 * about, and drops the explicit `role` the published markup carries — Safari
 * removes a list from the accessibility tree when `list-style` is none, which is
 * why the template put it there. It also writes `value` onto every `<li>`, an
 * attribute that is only conforming inside an ordered list.
 *
 * **Figures, not `<picture>`.** The default upload converter emits a `<picture>`
 * with one `<source>` per image size, `media="(max-width: Npx)"` — a different
 * mechanism from the `srcSet`/`sizes` pair every other photograph on this site
 * uses, and one that would pick a *different* file at the same viewport width.
 * The converter below goes through `toArtwork`, so an image inside a post body
 * resolves exactly the way an image in a hero does, and §1.3's `figcaption`
 * comes off the Media document's `caption`.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  list: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const Tag = node.tag;
    return <Tag role="list">{children}</Tag>;
  },

  listitem: ({ node, nodesToJSX }) => <li>{nodesToJSX({ nodes: node.children })}</li>,

  upload: ({ node }) => {
    // A node queried below its depth comes back as a bare id. That is a query to
    // fix, not a figure to render — and rendering nothing keeps the rest of the
    // body standing while it is fixed.
    if (typeof node.value !== "object" || node.value === null) return null;
    const media = node.value as Media;

    return (
      <figure>
        {/* No `sizes` hint: both figures in the journal body shipped
            single-source, and lib/media.ts's first invariant says the caller
            states that intent rather than inferring it from the pixels. */}
        <img {...toArtwork(media)} loading="lazy" alt={media.alt ?? ""} />
        {media.caption ? <figcaption>{media.caption}</figcaption> : null}
      </figure>
    );
  },
});

export function RichText({ data }: { data: SerializedEditorState }) {
  return <LexicalRichText data={data} converters={converters} disableContainer />;
}
