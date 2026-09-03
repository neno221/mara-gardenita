import { pageMetadata } from "@/lib/metadata";
import { AboutView } from "@/components/AboutView";

export const metadata = pageMetadata({
  title: "About — Loovio",
  description:
    "Who we are and how we work: the studio behind Loovio's weddings and celebrations, from first concept through to the last table setting.",
});

export default function Page() {
  return <AboutView />;
}
