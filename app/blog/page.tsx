import { pageMetadata } from "@/lib/metadata";
import { JournalView } from "@/components/JournalView";

export const metadata = pageMetadata({
  title: "Journal — Loovio",
  description:
    "Notes from the Loovio studio on planning, styling and hosting a wedding worth remembering.",
});

export default function Page() {
  return <JournalView />;
}
