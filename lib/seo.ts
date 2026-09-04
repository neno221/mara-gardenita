/**
 * `@payloadcms/plugin-seo`'s three generators, and the one field it does not ship
 * (docs/payload-plan.md, phase 5; spec §8).
 *
 * These are **fallbacks the admin offers**, not what the site renders. Clicking
 * "Auto-generate" writes the result into `meta.title`; the route then reads the
 * stored value like any other field. So a generator changing does not move a
 * published page — which is the property that lets phase 4's seeded titles
 * survive this phase untouched, `document.title` included.
 */
import type { GenerateDescription, GenerateImage, GenerateTitle } from "@payloadcms/plugin-seo/types";

/** Every page title on this site is "<something> — Loovio". */
const SUFFIX = " — Loovio";

/**
 * The document's name, suffixed.
 *
 * Pages and Posts carry a `title`; Projects carry a `name`. Nothing else has SEO
 * fields, so those two cases are the whole space.
 */
export const generateTitle: GenerateTitle = ({ doc }) => {
  const name = (doc?.title as string) || (doc?.name as string) || "";
  return name ? `${name}${SUFFIX}` : SUFFIX.trim();
};

/**
 * The excerpt, where the document has one.
 *
 * Posts do. Pages and Projects do not, and the spec's suggestion — "the first
 * `prose` block's opening sentence" — is not offered here: a description
 * assembled by cutting a paragraph at its first full stop reads like it was, and
 * an empty field an editor has to fill is more honest than a bad one they have to
 * notice. The six seeded pages already carry hand-written descriptions.
 */
export const generateDescription: GenerateDescription = ({ doc }) => {
  const excerpt = doc?.excerpt as string | undefined;
  return excerpt?.trim() ?? "";
};

/**
 * The document's own photograph: a post's hero plate, a project's image.
 *
 * Returns the id rather than the document, which is the shape the plugin's upload
 * field stores.
 */
export const generateImage: GenerateImage = ({ doc }) => {
  const candidate = doc?.hero ?? doc?.image;
  if (typeof candidate === "number") return candidate;
  if (typeof candidate === "object" && candidate !== null && "id" in candidate) {
    return candidate.id as number;
  }
  return "";
};
