import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/data/types";
import { projects } from "@/data/projects";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, ArrowUpRight, GitHub, Play } from "@/components/ui/Icons";
import { TechList } from "@/components/work/ProjectMeta";
import { CodeBlock } from "./CodeBlock";
import { CaseStudyToc } from "./CaseStudyToc";

const toc = [
  { id: "overview", label: "Overview", index: "01" },
  { id: "problem", label: "Problem", index: "02" },
  { id: "architecture", label: "Architecture", index: "03" },
  { id: "implementation", label: "Implementation", index: "04" },
  { id: "challenges", label: "Challenges", index: "05" },
  { id: "decisions", label: "Technical decisions", index: "06" },
  { id: "result", label: "Result", index: "07" },
  { id: "lessons", label: "Lessons", index: "08" },
  { id: "links", label: "Links", index: "09" },
];

export function CaseStudy({ project }: { project: Project }) {
  const cs = project.caseStudy!;
  const i = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(i + 1) % projects.length];
  const prev = projects[(i - 1 + projects.length) % projects.length];

  return (
    <article className="relative">
      {/* header */}
      <header className="gutter relative mx-auto max-w-[100rem] pt-32 pb-16 lg:pt-40">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative">
          <Reveal>
            <Link href="/#work" className="label inline-flex items-center gap-2 text-fg-3 transition-colors hover:text-fg-1">
              <ArrowLeft /> Selected work
            </Link>
          </Reveal>
          <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 lg:col-span-8">
              <Reveal className="label flex items-center gap-3 text-fg-3">
                <span className="text-accent">{project.number}</span>
                <span className="h-px w-6 bg-line-2" aria-hidden />
                <span>{project.category}</span>
                <span className="h-px w-6 bg-line-2" aria-hidden />
                <span>{project.year}</span>
              </Reveal>
              <h1 className="text-display mt-6 text-fg-1">
                <SplitText immediate by="words">{project.title}</SplitText>
              </h1>
              <Reveal delay={0.2}>
                <p className="text-lead mt-8 max-w-[52ch] text-balance text-fg-2">{project.tagline}</p>
              </Reveal>
            </div>
            <Reveal delay={0.3} className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-4">
              <TechList items={project.technologies} />
              <div className="flex flex-wrap gap-3">
                {project.github && (
                  <Button href={project.github} icon={<GitHub />} cursor="GitHub ↗">
                    Source
                  </Button>
                )}
                {project.live && (
                  <Button href={project.live} variant="outline" icon={<ArrowUpRight />} cursor="Open ↗">
                    Live
                  </Button>
                )}
                {project.video && (
                  <Button href={project.video} variant="outline" icon={<Play />} cursor="Watch">
                    Walkthrough
                  </Button>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* hero visual */}
      <div className="gutter mx-auto max-w-[100rem]">
        <Reveal amount={0.2} className="overflow-hidden rounded-3xl border border-line-1 bg-bg-2/40 [box-shadow:var(--shadow-soft)]">
          <ProductVisual project={project} />
        </Reveal>
        {project.image && (
          <Reveal className="mt-6 overflow-hidden rounded-3xl border border-line-1" amount={0.2}>
            <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} sizes="100vw" className="h-auto w-full object-cover" />
          </Reveal>
        )}
        <dl className="mt-8 grid gap-6 border-t border-line-1 pt-6 sm:grid-cols-3">
          {project.facts.map((f) => (
            <div key={f.label}>
              <dt className="label text-fg-3">{f.label}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-fg-1">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* body */}
      <div className="gutter mx-auto mt-24 grid max-w-[100rem] grid-cols-12 gap-x-6">
        <aside className="col-span-12 lg:col-span-3">
          <CaseStudyToc items={toc} />
        </aside>
        <div className="col-span-12 lg:col-span-8 lg:col-start-5">
          <Section id="overview" index="01" title="Overview">
            <Prose paragraphs={cs.overview} />
          </Section>
          <Section id="problem" index="02" title="Problem">
            <Prose paragraphs={cs.problem} />
          </Section>
          <Section id="architecture" index="03" title="Architecture">
            <ol className="space-y-4">
              {cs.architectureNotes.map((n, idx) => (
                <li key={idx} className="flex gap-4 text-[15px] leading-relaxed text-fg-2">
                  <span className="label mt-1.5 shrink-0 text-accent">{String(idx + 1).padStart(2, "0")}</span>
                  <span>{n}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section id="implementation" index="04" title="Implementation">
            <div className="space-y-12">
              {cs.implementation.map((step) => (
                <div key={step.title}>
                  <h3 className="text-h3 text-fg-1">{step.title}</h3>
                  <Prose paragraphs={step.body} className="mt-3" />
                  {step.code && (
                    <div className="mt-5">
                      <CodeBlock {...step.code} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
          <Section id="challenges" index="05" title="Challenges">
            <Cards items={cs.challenges} />
          </Section>
          <Section id="decisions" index="06" title="Technical decisions">
            <Cards items={cs.decisions} />
          </Section>
          <Section id="result" index="07" title="Result">
            <Prose paragraphs={cs.result} lead />
          </Section>
          <Section id="lessons" index="08" title="Lessons">
            <ul className="space-y-4">
              {cs.lessons.map((l, idx) => (
                <li key={idx} className="flex gap-4 border-t border-line-1 pt-4 text-lead text-fg-1">
                  <span className="label mt-2 shrink-0 text-accent">{String(idx + 1).padStart(2, "0")}</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section id="links" index="09" title="Links">
            <div className="flex flex-wrap gap-3">
              {project.github && (
                <Button href={project.github} icon={<GitHub />} cursor="GitHub ↗">
                  Repository
                </Button>
              )}
              {project.live && (
                <Button href={project.live} variant="outline" icon={<ArrowUpRight />}>
                  Live site
                </Button>
              )}
              {project.video && (
                <Button href={project.video} variant="outline" icon={<Play />}>
                  Walkthrough video
                </Button>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* prev / next */}
      <nav className="mt-32 border-t border-line-1" aria-label="Other projects">
        <div className="gutter mx-auto grid max-w-[100rem] grid-cols-1 divide-y divide-line-1 md:grid-cols-2 md:divide-x md:divide-y-0">
          <NextLink project={prev} dir="prev" />
          <NextLink project={next} dir="next" />
        </div>
      </nav>
    </article>
  );
}

function Section({ id, index, title, children }: { id: string; index: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-line-1 py-12 first:border-t-0 first:pt-0" aria-labelledby={`${id}-h`}>
      <Reveal amount={0.15}>
        <div className="label flex items-center gap-3 text-fg-3">
          <span className="text-accent">{index}</span>
          <span>{title}</span>
        </div>
        <h2 id={`${id}-h`} className="sr-only">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </Reveal>
    </section>
  );
}

function Prose({ paragraphs, className, lead }: { paragraphs: string[]; className?: string; lead?: boolean }) {
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className={lead ? "text-lead mt-4 max-w-[60ch] text-fg-1 first:mt-0" : "mt-4 max-w-[68ch] text-[15px] leading-relaxed text-fg-2 first:mt-0"}>
          {p}
        </p>
      ))}
    </div>
  );
}

function Cards({ items }: { items: { title: string; body: string }[] }) {
  return (
    <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border border-line-1 bg-line-1 sm:grid-cols-2">
      {items.map((c, i) => (
        <RevealItem key={c.title} className="bg-bg-1 p-5 transition-colors hover:bg-bg-2">
          <div className="label flex items-center justify-between text-fg-3">
            <span>{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3 className="mt-3 text-[15px] font-medium text-fg-1">{c.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">{c.body}</p>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

function NextLink({ project, dir }: { project: Project; dir: "prev" | "next" }) {
  const href = project.caseStudy ? `/work/${project.slug}` : "/#work";
  return (
    <Link href={href} className="group flex flex-col gap-3 py-12 md:pr-10 md:[&:last-child]:pl-10 md:[&:last-child]:text-right" data-cursor={project.caseStudy ? "Case study" : "View"}>
      <span className="label flex items-center gap-2 text-fg-3 md:group-last:justify-end">
        {dir === "prev" ? <ArrowLeft /> : null}
        {dir === "prev" ? "Previous" : "Next"}
        {dir === "next" ? <ArrowRight className="transition-transform group-hover:translate-x-1" /> : null}
      </span>
      <span className="text-h2 text-fg-1">{project.title}</span>
      <span className="text-sm text-fg-2">{project.category}</span>
    </Link>
  );
}
