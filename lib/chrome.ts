/**
 * The header and footer, as props (docs/payload-plan.md, phase 4).
 *
 * Both are rendered by `SiteShell` on every page, and `SiteShell` is a client
 * component — it wires the header's hairline to the body's scroll, so it cannot
 * fetch. So the three routes that render a page read the two globals here and
 * hand the shell finished props: strings, hrefs and `Artwork`, nothing that
 * needs a database on the other side of the boundary.
 *
 * That is also why this module exists rather than the two components fetching
 * for themselves: one call site per route, one place the shape is decided, and
 * the Local API's memoised client makes the three reads a single round of
 * queries per request.
 */
import type { Artwork } from "./artwork";
import { artworkFrom } from "./media";
import { getInstagramTiles } from "./instagram";
import { resolveLink, type ResolvedLink } from "./links";
import { getFooter, getHeader } from "./payload";
import { DEFAULT_LOCALE, type Locale } from "./i18n";
import type { InstagramTileData } from "@/components/InstagramFeed";

/**
 * The wordmark's alt text, where the Media document does not carry its own.
 *
 * The seed leaves `alt` empty on every upload — the components supply alt where
 * they have any, and the rest of the library is decorative. The wordmark is the
 * one image whose alt is the site's name rather than a description of a
 * photograph, so it has a default here and an editor filling in the Media
 * document's `alt` takes it over.
 */
const SITE_NAME = "Loovio";

/** The wordmark's own alt, or the site's name. */
function logoAlt(value: number | { alt?: string | null }): string {
  return (typeof value === "object" && value?.alt) || SITE_NAME;
}

export type HeaderProps = {
  locale: Locale;
  logo: Artwork;
  logoAlt: string;
  nav: ResolvedLink[];
  cta: ResolvedLink | null;
};

export type FooterProps = {
  instagramHeading: string;
  tiles: InstagramTileData[];
  socialHeading: string;
  social: { label: string; href: string }[];
  quickLinksHeading: string;
  quickLinks: ResolvedLink[];
  logo: Artwork;
  logoAlt: string;
  credit: { label: string; href: string } | null;
};

export type ChromeProps = { header: HeaderProps; footer: FooterProps };

/** How many tiles the footer prints. Six, as published. */
const FOOTER_TILES = 6;

export async function getChrome(locale: Locale = DEFAULT_LOCALE): Promise<ChromeProps> {
  const [header, footer, tiles] = await Promise.all([
    getHeader(),
    getFooter(),
    getInstagramTiles(FOOTER_TILES),
  ]);

  return {
    header: {
      locale,
      logo: artworkFrom(header.logo),
      logoAlt: logoAlt(header.logo),
      // `resolveLink` returns null for an unlabelled row, which is how a
      // half-filled nav entry stops the page rather than rendering a blank link.
      nav: header.nav.flatMap((item) => resolveLink(item, locale) ?? []),
      cta: resolveLink(header.cta, locale),
    },
    footer: {
      instagramHeading: footer.instagramHeading,
      tiles,
      socialHeading: footer.socialHeading,
      social: (footer.social ?? []).map((item) => ({ label: item.label, href: item.url })),
      quickLinksHeading: footer.quickLinksHeading,
      quickLinks: (footer.quickLinks ?? []).flatMap((item) => resolveLink(item, locale) ?? []),
      logo: artworkFrom(footer.logo),
      logoAlt: logoAlt(footer.logo),
      credit: footer.credit?.label
        ? { label: footer.credit.label, href: footer.credit.url ?? "#" }
        : null,
    },
  };
}
