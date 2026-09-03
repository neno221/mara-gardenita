import { pageMetadata } from "@/lib/metadata";
import { PortfolioView } from "@/components/PortfolioView";

export const metadata = pageMetadata({
  title: "Portfolio — Loovio",
  description:
    "Weddings and celebrations designed by Loovio, from first concept through to the last table setting.",
});

export default function Page() {
  return <PortfolioView />;
}
