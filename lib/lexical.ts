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
 * Only the node the seed actually writes is here: the paragraph. The headings,
 * quote, list and figure builders went with the journal body, the one document
 * that used them; `components/RichText` still renders all of those for anything
 * an editor writes.
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
