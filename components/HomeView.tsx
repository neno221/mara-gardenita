import { ARTWORK } from "@/lib/artwork";
import { toArtwork } from "@/lib/media";
import { mediaByFilename } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { SiteShell } from "./SiteShell";
import { Hero } from "./Hero";
import { ServiceGrid } from "./ServiceGrid";
import { StorySplit } from "./StorySplit";
import { PortfolioGrid } from "./PortfolioGrid";
import { Testimonials } from "./Testimonials";

/**
 * The three collage plates, by filename.
 *
 * A filename is a poor handle for a photograph and this is the only place that uses
 * one: phase 2 of docs/payload-plan.md moves the hero onto Payload before Pages
 * exist to hold an upload relationship, so there is nothing better to key on yet.
 * Phase 4 replaces the whole lookup with three fields on the `hero` block, and this
 * view is deleted in the same commit.
 */
const HERO_PLATES = ["hero-left.jpg", "hero-right.jpg", "hero-center.jpg"] as const;

export async function HomeView() {
  const plates = await mediaByFilename(HERO_PLATES);

  return (
    <SiteShell>
      <Hero
        left={toArtwork(plates["hero-left.jpg"], SIZES.heroSide)}
        right={toArtwork(plates["hero-right.jpg"], SIZES.heroSide)}
        center={toArtwork(plates["hero-center.jpg"], SIZES.heroCenter)}
      />
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
