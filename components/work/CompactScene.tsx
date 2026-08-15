import type { Project } from "@/data/types";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { Tilt } from "@/components/visuals/Tilt";
import { FactList, ProjectHeader, ProjectLinks, TechList } from "./ProjectMeta";

/** Minimal compact presentation. */
export function CompactScene({ project }: { project: Project }) {
  return (
    <article className="gutter mx-auto max-w-[100rem] py-[calc(var(--spacing-section)*0.7)]" aria-labelledby={`p-${project.slug}`}>
      <div className="grid grid-cols-12 items-center gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-5 lg:order-2 lg:col-start-8">
          <Reveal>
            <ProjectHeader project={project} />
          </Reveal>
          <h3 id={`p-${project.slug}`} className="text-h1 mt-6 text-fg-1">
            <SplitText by="words">{project.title}</SplitText>
          </h3>
          <Reveal delay={0.1}>
            <p className="text-lead mt-5 max-w-[36ch] text-balance text-fg-2">{project.tagline}</p>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-fg-2">{project.description}</p>
            <TechList items={project.technologies} className="mt-7" />
            <ProjectLinks project={project} className="mt-8" primary="live" />
          </Reveal>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:order-1">
          <div className="group/tilt">
            <Tilt max={5}>
              <ProductVisual project={project} />
            </Tilt>
          </div>
          <Reveal className="mt-6" amount={0.5}>
            <FactList facts={project.facts} className="sm:grid-cols-2" />
          </Reveal>
        </div>
      </div>
    </article>
  );
}
