import type { Project } from "@/data/types";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowUpRight, GitHub, Play } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function TechList({ items, className, chipClass }: { items: string[]; className?: string; chipClass?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Technologies">
      {items.map((t) => (
        <li key={t} className={cn("label rounded-full border border-line-1 px-3 py-2 text-fg-2", chipClass)}>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function ProjectLinks({ project, className, primary = "case" }: { project: Project; className?: string; primary?: "case" | "live" }) {
  const hasCase = Boolean(project.caseStudy);
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {hasCase && primary === "case" && (
        <Button href={`/work/${project.slug}`} icon={<ArrowRight />} cursor="Case study">
          Case study
        </Button>
      )}
      {project.live && (
        <Button href={project.live} variant={primary === "live" ? "primary" : "outline"} icon={<ArrowUpRight />} cursor="Open ↗">
          Live
        </Button>
      )}
      {hasCase && primary === "live" && (
        <Button href={`/work/${project.slug}`} variant="outline" icon={<ArrowRight />} cursor="Case study">
          Case study
        </Button>
      )}
      {project.github && (
        <Button href={project.github} variant="outline" icon={<GitHub />} cursor="GitHub ↗">
          Source
        </Button>
      )}
      {project.video && (
        <Button href={project.video} variant="ghost" icon={<Play />} cursor="Watch">
          Walkthrough
        </Button>
      )}
    </div>
  );
}

export function FactList({ facts, className }: { facts: Project["facts"]; className?: string }) {
  return (
    <dl className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {facts.map((f) => (
        <div key={f.label} className="border-t border-line-1 pt-3">
          <dt className="label text-fg-3">{f.label}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-fg-1">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectHeader({ project, className }: { project: Project; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="label flex items-center gap-3 text-fg-3">
        <span className="text-accent">{project.number}</span>
        <span className="h-px w-6 bg-line-2" aria-hidden />
        <span>{project.category}</span>
      </div>
      <span className="label hidden text-fg-3 sm:block">{project.year}</span>
    </div>
  );
}
