import { ARTWORK } from "@/lib/artwork";
import { SiteShell } from "./SiteShell";
import { Hero } from "./Hero";
import { ServiceGrid } from "./ServiceGrid";
import { StorySplit } from "./StorySplit";
import { PortfolioGrid } from "./PortfolioGrid";
import { Testimonials } from "./Testimonials";

export function HomeView() {
  return (
    <SiteShell>
      <Hero />
      <ServiceGrid />
      <StorySplit
        eyebrow="who we are"
        heading="Weave story into every thread of your event"
        copy="Cras urna sed purus magna morbi morbi congue suspendisse. Est faucibus hendrerit donec nisi, feugiat suscipit eu, sit. Orci euismod nibh."
        cta={{ label: "more about us", href: "/about/about-b" }}
        image={ARTWORK.whoWeAre}
        petals="tall"
        side="right"
      />
      <StorySplit
        eyebrow="What We Do"
        heading="We are concept creators. We tell your story."
        copy="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim tincidunt magna viverra nibh scelerisque lorem ipsum adipiscing dolor."
        cta={{ label: "more Services", href: "/services/services-b" }}
        image={ARTWORK.whatWeDo}
        petals="wide"
        side="left"
      />
      <PortfolioGrid />
      <Testimonials />
    </SiteShell>
  );
}
