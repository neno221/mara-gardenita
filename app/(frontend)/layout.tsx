import { RootHtml, siteMetadata } from "@/lib/rootLayout";
import "./globals.css";

export const metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml locale="en">{children}</RootHtml>;
}
