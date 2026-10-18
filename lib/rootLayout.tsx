import type { Metadata } from "next";
import { Marcellus, Montserrat, Homemade_Apple } from "next/font/google";
import { SITE_URL, pageMetadata } from "@/lib/metadata";
import { HTML_LANG, type Locale } from "@/lib/i18n";

const marcellus = Marcellus({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-body",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-ui",
});

const homemadeApple = Homemade_Apple({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-signature",
});

export const siteMetadata: Metadata = {
  ...(SITE_URL ? { metadataBase: SITE_URL } : {}),
  ...pageMetadata({
    title: "Loovio — Destination Wedding Planners & Event Designers",
    description:
      "Loovio plans and designs destination weddings and celebrations, from full-service planning to event design and branding.",
  }),
};

/**
 * The `<html>` shell. The two languages are separate root layouts, one under
 * `app/(frontend)` and one under `app/(greek)/gr`, so each can state its own
 * `lang` without making every page dynamic to find out which one it is in.
 */
export function RootHtml({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${marcellus.variable} ${montserrat.variable} ${homemadeApple.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
