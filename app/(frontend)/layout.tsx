import type { Metadata } from "next";
import { Marcellus, Montserrat, Homemade_Apple } from "next/font/google";
import { SITE_URL, pageMetadata } from "@/lib/metadata";
import "./globals.css";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-body",
});

const montserrat = Montserrat({
  subsets: ["latin"],
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

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: SITE_URL } : {}),
  ...pageMetadata({
    title: "Loovio — Destination Wedding Planners & Event Designers",
    description:
      "Loovio plans and designs destination weddings and celebrations, from full-service planning to event design and branding.",
  }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${montserrat.variable} ${homemadeApple.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
