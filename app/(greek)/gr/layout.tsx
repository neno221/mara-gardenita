import { RootHtml, siteMetadata } from "@/lib/rootLayout";
import "../../(frontend)/globals.css";

export const metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml locale="gr">{children}</RootHtml>;
}
