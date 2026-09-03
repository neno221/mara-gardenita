/**
 * Builders for the serialized Lexical state the seed writes into rich-text
 * fields (docs/payload-plan.md, phase 3).
 *
 * Payload stores rich text as the editor's own JSON, so seeding one means
 * emitting that JSON directly — there is no markdown or HTML door in. The shapes
 * below are the node types `@payloadcms/richtext-lexical` round-trips; the
 * constants that look like noise (`version`, `format: ""`, `direction: "ltr"`)
 * are not optional. A node missing them loads, but the editor rewrites it on the
 * first save and the document silently changes under an editor who only opened
 * it.
 *
 * Only the nodes this site actually uses are here: paragraph, h3, blockquote,
 * bulleted list, and the upload node that carries a figure. §1.3 enumerates
 * exactly that set, and `app/(frontend)/globals.css` already styles every one of
 * them as a bare element — which is why the converted body inherits the site's
 * typography rather than needing any of its own.
 */
import type { SerializedEditorState, SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";

/** Shared by every element node. Spread first, then override. */
const ELEMENT = {
  direction: "ltr" as const,
  format: "" as const,
  indent: 0,
  version: 1,
};

/** A run of plain text. The site's copy carries no bold, italic or links. */
export function text(value: string): SerializedLexicalNode {
  return {
    type: "text",
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text: value,
    version: 1,
  } as unknown as SerializedLexicalNode;
}

export function paragraph(value: string): SerializedLexicalNode {
  return {
    ...ELEMENT,
    type: "paragraph",
    children: [text(value)],
    textFormat: 0,
    textStyle: "",
  } as unknown as SerializedLexicalNode;
}

export function heading(tag: "h2" | "h3" | "h4", value: string): SerializedLexicalNode {
  return {
    ...ELEMENT,
    type: "heading",
    tag,
    children: [text(value)],
  } as unknown as SerializedLexicalNode;
}

export function quote(value: string): SerializedLexicalNode {
  return {
    ...ELEMENT,
    type: "quote",
    children: [text(value)],
  } as unknown as SerializedLexicalNode;
}

export function bulletList(items: string[]): SerializedLexicalNode {
  return {
    ...ELEMENT,
    type: "list",
    listType: "bullet",
    start: 1,
    tag: "ul",
    children: items.map((item, index) => ({
      ...ELEMENT,
      type: "listitem",
      checked: undefined,
      // 1-based, and Lexical keeps it even for bulleted lists. `components/RichText`
      // drops it from the rendered <li>, where it would be non-conforming HTML.
      value: index + 1,
      children: [text(item)],
    })),
  } as unknown as SerializedLexicalNode;
}

/**
 * A figure: the image, and the `<figcaption>` its Media document's `caption`
 * carries.
 *
 * The caption is deliberately *not* stored on the node. Lexical's upload node
 * has a `fields` bag that could hold one, but the spec's Media `caption` field —
 * which it describes as "optional, unused by current components" — is exactly
 * what the published `figcaption` says, and keeping the two in one place means a
 * photograph reused in a second post cannot caption itself differently by
 * accident. `components/RichText` reads it off the populated document.
 *
 * `id` is the node's own identity, not the document's, and Lexical requires one
 * on any node with sub-fields. It is derived from the filename rather than
 * random so that re-running the seed produces byte-identical JSON and Postgres
 * sees no change.
 */
export function figure(mediaId: number | string, nodeId: string): SerializedLexicalNode {
  return {
    type: "upload",
    format: "",
    relationTo: "media",
    value: mediaId,
    fields: {},
    id: nodeId,
    version: 3,
  } as unknown as SerializedLexicalNode;
}

/** Wraps nodes in the root every rich-text field expects. */
export function editorState(children: SerializedLexicalNode[]): SerializedEditorState {
  return {
    root: {
      ...ELEMENT,
      type: "root",
      children,
    },
  } as unknown as SerializedEditorState;
}
