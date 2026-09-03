import { artworkFrom } from "@/lib/media";
import { getServices } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { PageMasthead } from "./HeroTop";
import { Section } from "./Section";
import { ServicePanel, type ServiceDetail } from "./ServicePanel";
import { SiteShell } from "./SiteShell";
import styles from "./ServicesView.module.css";

/**
 * `/services`.
 *
 * The layout is still a hand-placed triptych — the second panel drops, the third
 * spans both columns — because those are properties of *positions*, not of the
 * three documents. Phase 4's `servicePanels` block is where an editor gets to
 * add a fourth service and have it land somewhere sensible.
 */
export async function ServicesView() {
  const services = await getServices();
  const [weddings, eventDesign, branding] = services.map(toDetail);

  return (
    <SiteShell>
      <PageMasthead subtitle="Services" heading="Our Services" />

      <Section first>
        <div className={styles.grid}>
          {weddings && <ServicePanel service={weddings} />}
          {eventDesign && <ServicePanel service={eventDesign} dropped petals />}
          {branding && <ServicePanel service={branding} wide />}
        </div>
      </Section>
    </SiteShell>
  );
}

function toDetail(service: Awaited<ReturnType<typeof getServices>>[number]): ServiceDetail {
  return {
    title: service.title,
    icon: artworkFrom(service.icon),
    photo: artworkFrom(service.photo, SIZES.service),
    copy: service.copy,
  };
}
