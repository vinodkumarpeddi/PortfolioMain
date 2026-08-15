import type { Project } from "@/data/types";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { ProjectImage } from "./ProjectImage";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { FactList, ProjectHeader, ProjectLinks, TechList } from "./ProjectMeta";
import { Tilt } from "@/components/visuals/Tilt";

/** Split-screen editorial: sticky copy on the left, image + architecture on the right. */
export function SplitScene({ project }: { project: Project }) {
  return (
    <article className="gutter mx-auto max-w-[100rem] py-[calc(var(--spacing-section)*0.8)]" aria-labelledby={`p-${project.slug}`}>
      <div className="grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <ProjectHeader project={project} />
            </Reveal>
            <h3 id={`p-${project.slug}`} className="text-h1 mt-6 text-fg-1">
              <SplitText by="words">{project.title}</SplitText>
            </h3>
            <Reveal delay={0.1}>
              <p className="text-lead mt-6 max-w-[40ch] text-balance text-fg-2">{project.tagline}</p>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-fg-2">{project.description}</p>
            </Reveal>
            <RevealGroup className="mt-8">
              <RevealItem>
                <TechList items={project.technologies} />
              </RevealItem>
              <RevealItem>
                <ProjectLinks project={project} className="mt-8" primary="live" />
              </RevealItem>
            </RevealGroup>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <div className="group/tilt">
            <Tilt max={5}>
              <ProductVisual project={project} />
            </Tilt>
          </div>
          {project.image && (
            <Reveal className="mt-6" amount={0.3}>
              <p className="label mb-3 text-fg-3">From the live product</p>
              <ProjectImage image={project.image} href={project.live ?? project.github} className="aspect-[16/9]" sizes="(min-width: 1024px) 56vw, 100vw" reveal={false} />
            </Reveal>
          )}
          <Reveal className="mt-8" amount={0.4}>
            <FactList facts={project.facts} />
          </Reveal>
        </div>
      </div>
    </article>
  );
}
