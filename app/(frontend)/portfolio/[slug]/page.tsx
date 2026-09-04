import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChrome } from "@/lib/chrome";
import { artworkFrom } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";
import { getProject, getProjects } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { AboutPhoto } from "@/components/AboutPhoto";
import { PageMasthead } from "@/components/HeroTop";
import { RenderBlocks } from "@/components/RenderBlocks";
import { Section } from "@/components/Section";
import { SiteShell } from "@/components/SiteShell";

/**
 * A project's own page.
 *
 * Decision A puts this in scope, and it retires eight of the fourteen dead links
 * §1.4 inventories in one file: every `/portfolio/<slug>` on the home grid and
 * the portfolio index pointed at a route that did not exist.
 *
 * **The body is empty on all four projects, and that is not an oversight.** The
 * template shipped no detail-page copy and decision B forbids inventing any, so
 * `RenderBlocks` renders nothing until someone writes something. What the page
 * shows meanwhile is the one piece of real content a Project holds — its
 * photograph — in the same masthead-then-plate shape a journal post uses. That
 * is a layout borrowed from the site, not copy invented for it.
 *
 * This route is exempt from the fingerprint: it has no "before" to compare to.
 */
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};

  return pageMetadata({
    title: project.meta?.title || `${project.name} — Loovio`,
    description: project.meta?.description ?? undefined,
    image: project.meta?.image ?? project.image,
    noIndex: project.meta?.noIndex,
  });
}

export default async function Page({ params }: Params) {
  const slug = (await params).slug;
  const [project, chrome] = await Promise.all([getProject(slug), getChrome()]);
  if (!project) notFound();

  return (
    <SiteShell {...chrome}>
      <PageMasthead subtitle="Portfolio" heading={project.name} />

      <Section first>
        <AboutPhoto image={artworkFrom(project.image, SIZES.fullWidth)} delay={400} />
      </Section>

      <RenderBlocks blocks={project.body ?? []} />
    </SiteShell>
  );
}
