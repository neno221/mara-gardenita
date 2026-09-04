import type { Metadata } from "next";

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
  /**
   * Optional since phase 4, where a Pages document supplies it and an editor may
   * leave the field blank. Omitted rather than emitted empty, so the page falls
   * back to the layout's description instead of declaring it has none.
   */
  description?: string;
  /** Set on a journal post, which shares as an article rather than a page. */
  article?: { publishedTime: string; images: string[] };
};

/**
 * Every route sets the same four fields, with the title and description echoed
 * into the Open Graph and Twitter cards. Declared once here so a page only has
 * to say what it is.
 */
export function pageMetadata({ title, description, article }: PageMetadata): Metadata {
  return {
    title,
    description,
    openGraph: article
      ? {
          type: "article",
          title,
          description,
          publishedTime: article.publishedTime,
          images: article.images,
        }
      : { type: "website", title, description },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(article ? { images: article.images } : {}),
    },
  };
}
