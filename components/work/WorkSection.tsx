import { projects } from "@/data/projects";
import { SectionLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { ArchitectureScene } from "./ArchitectureScene";
import { SplitScene } from "./SplitScene";
import { HorizontalScene } from "./HorizontalScene";
import { CompactScene } from "./CompactScene";
import { ProjectIndex } from "./ProjectIndex";

export function WorkSection() {
  const [, cqrs, exam, saas, grillbot] = projects;
  return (
    <section id="work" data-section="work" className="relative" aria-labelledby="work-title">
      <div className="gutter mx-auto max-w-[100rem] pt-[calc(var(--spacing-section)*0.9)]">
        <Reveal>
          <SectionLabel index="02">Selected work</SectionLabel>
        </Reveal>
        <h2 id="work-title" className="text-h1 mt-6 max-w-[16ch] text-fg-1">
          <SplitText by="words">Five systems, five different problems.</SplitText>
        </h2>
        <Reveal delay={0.15} className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
          <p className="max-w-[56ch] text-lead text-fg-2">
            From a payment engine and a CQRS pipeline to a platform used across web and mobile — each one chosen because it forced a real
            engineering decision.
          </p>
          <ol className="label flex flex-wrap gap-x-5 gap-y-2 text-fg-3" aria-label="Projects in this section">
            {projects.map((p) => (
              <li key={p.slug} className="flex items-center gap-2">
                <span className="text-accent">{p.number}</span> {p.title}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <div className="mt-8 border-t border-line-1">
        <ArchitectureScene project={cqrs} highlight={{ challenge: ["cmd", "wdb", "mq"], solution: ["wdb", "mq", "consumer"] }} />
      </div>
      <div className="border-t border-line-1">
        <SplitScene project={exam} />
      </div>
      <div className="border-t border-line-1">
        <HorizontalScene project={saas} />
      </div>
      <div className="border-t border-line-1">
        <CompactScene project={grillbot} />
      </div>
      <div className="border-t border-line-1">
        <ProjectIndex />
      </div>
    </section>
  );
}
