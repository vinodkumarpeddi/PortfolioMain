import { projects } from "@/data/projects";
import { SectionLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { ArchitectureScene } from "./ArchitectureScene";
import { SplitScene } from "./SplitScene";
import { HorizontalScene } from "./HorizontalScene";
import { CompactScene } from "./CompactScene";
import { ProjectIndex } from "./ProjectIndex";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { WorkWash } from "./WorkWash";

export function WorkSection() {
  const [, cqrs, exam, saas, grillbot] = projects;
  return (
    <section id="work" data-section="work" className="relative" aria-labelledby="work-title">
      <WorkWash />
      <div className="relative z-10">
      <div className="gutter relative mx-auto max-w-[100rem] pt-[calc(var(--spacing-section)*0.9)]">
        <SectionNumeral>02</SectionNumeral>
        <Reveal>
          <SectionLabel index="02">Selected work</SectionLabel>
        </Reveal>
        <h2 id="work-title" className="v-skew text-h1 relative mt-6 max-w-[16ch] origin-left text-fg-1">
          <SplitText by="words">Five systems, five different problems.</SplitText>
        </h2>
        <Reveal delay={0.15} className="relative mt-8">
          <ol
            className="label no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-[var(--spacing-gutter)] text-fg-3 sm:mx-0 sm:flex-wrap sm:gap-x-6 sm:gap-y-2 sm:overflow-visible sm:px-0"
            aria-label="Projects in this section"
          >
            {projects.map((p) => (
              <li
                key={p.slug}
                className="flex shrink-0 snap-start items-center gap-2 rounded-full border border-line-1 px-3 py-2 sm:shrink sm:rounded-none sm:border-0 sm:px-0 sm:py-0"
              >
                <span className="text-accent">{p.number}</span> {p.title}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <div className="mt-8 border-t border-line-1" data-wash="#22d3ee">
        <ArchitectureScene project={cqrs} />
      </div>
      <div className="border-t border-line-1" data-wash="#4c1d95">
        <SplitScene project={exam} />
      </div>
      <div className="border-t border-line-1" data-wash="#7c3aed">
        <HorizontalScene project={saas} />
      </div>
      <div className="border-t border-line-1" data-wash="#c026d3">
        <CompactScene project={grillbot} />
      </div>
      <div className="border-t border-line-1" data-wash="#e9a23b">
        <ProjectIndex />
      </div>
      </div>
    </section>
  );
}
