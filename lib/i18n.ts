/**
 * The site's two languages.
 *
 * English is served at the root and Greek under `/gr`, so every English URL
 * that existed before localization still does. The Payload locale codes are the
 * same strings as the URL prefix, which keeps the mapping a no-op; the `<html
 * lang>` for Greek is the ISO code `el`.
 */
export const LOCALES = ["en", "gr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const HTML_LANG: Record<Locale, string> = { en: "en", gr: "el" };

/** `/about` in English stays `/about`; in Greek it becomes `/gr/about`. */
export function withLocale(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** The same page in the other language, from the path being viewed. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const bare = pathname.replace(/^\/gr(?=\/|$)/, "") || "/";
  return withLocale(bare, to);
}
