import type { Metadata } from "next";
import { asMedia, type Upload } from "./media";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Absolute base for the Open Graph and Twitter image URLs, from
 * `NEXT_PUBLIC_SITE_URL`. Left undefined when the deploy does not set one, so
 * Next still falls back to the deployment host — pinning a default here would
 * bake that default into every share card instead.
 */
export const SITE_URL = siteUrl ? new URL(siteUrl) : undefined;

type PageMetadata = {
  title: string;
  description?: string;
  /** The share card's picture: `meta.image`, or the document's own photograph. */
  image?: Upload;
  /** Emits `robots: noindex`. The checkbox `plugin-seo` does not ship. */
  noIndex?: boolean | null;
  /** Set on a journal post, which shares as an article rather than a page. */
  article?: { publishedTime: string };
};

/**
 * Every route sets the same four fields, with the title and description echoed
 * into the Open Graph and Twitter cards. Declared once here so a page only has
 * to say what it is.
 *
 * Phase 5 fed it from the documents rather than from constants in each route
 * file, and added the two things `plugin-seo` implies: a share image, and
 * `noIndex`. The shape of what it emits did not change — which is why
 * `document.title` on all nine fingerprinted routes did not move.
 */
export function pageMetadata({
  title,
  description,
  image,
  noIndex,
  article,
}: PageMetadata): Metadata {
  const src = asMedia(image)?.url ?? undefined;
  const images = src ? [src] : undefined;

  return {
    title,
    ...(description ? { description } : {}),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      ...(article ? { type: "article", publishedTime: article.publishedTime } : { type: "website" }),
      title,
      ...(description ? { description } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      ...(images ? { images } : {}),
    },
  };
}
