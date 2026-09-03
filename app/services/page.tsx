import { pageMetadata } from "@/lib/metadata";
import { ServicesView } from "@/components/ServicesView";

export const metadata = pageMetadata({
  title: "Services — Loovio",
  description:
    "What we take on: weddings, event design and branding, from the first conversation through to the day itself.",
});

export default function Page() {
  return <ServicesView />;
}
