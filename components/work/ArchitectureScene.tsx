"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP, MOBILE } from "@/lib/gsap";
import type { Project } from "@/data/types";
import { SystemViz } from "@/components/viz/SystemViz";
import { createVizAmbient, createVizReveal } from "@/components/viz/animate";
import { FactList, ProjectHeader, ProjectLinks, TechList } from "./ProjectMeta";
import { cn } from "@/lib/utils";

/**
 * Pinned scene: the architecture builds itself while the story
 * (intro → challenge → solution → facts) advances in the side column.
 */
export function ArchitectureScene({ project, highlight }: { project: Project; highlight: { challenge: string[]; solution: string[] } }) {
  const ref = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arch = project.architecture!;

  useGSAP(
    () => {
      const el = ref.current;
      const svg = svgRef.current;
      if (!el || !svg) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, desktop: DESKTOP, mobile: MOBILE }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;

        const reveal = createVizReveal(svg, arch, { restOpacity: 0.18 });
        const killAmbient = createVizAmbient(svg, arch, { speed: 80 });
        const allNodes = svg.querySelectorAll(".viz-node");
        const box = (ids: string[]) => ids.map((id) => svg.querySelector(`[data-node="${id}"] .viz-node-box`)).filter(Boolean);
        const nodes = (ids: string[]) => ids.map((id) => svg.querySelector(`[data-node="${id}"]`)).filter(Boolean);
        const others = (ids: string[]) => Array.from(allNodes).filter((n) => !ids.includes((n as SVGGElement).dataset.node ?? ""));

        gsap.set(q(".stage"), { autoAlpha: 0, y: 16 });
        gsap.set(q(".stage-intro"), { autoAlpha: 1, y: 0 });
        gsap.set(q(".scene-facts"), { autoAlpha: 0, y: 12 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".pin")[0],
            start: "top top",
            end: desktop ? "+=320%" : "+=280%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(reveal, { progress: 1, duration: 3.2 }, 0)
          .to(q(".stage-intro"), { autoAlpha: 0, y: -12, duration: 0.5 }, 3.4)
          .to(q(".stage-challenge"), { autoAlpha: 1, y: 0, duration: 0.7 }, 3.6)
          .to(others(highlight.challenge), { opacity: 0.35, duration: 0.6 }, 3.6)
          .to(box(highlight.challenge), { stroke: "var(--color-accent)", duration: 0.5 }, 3.7)
          .to(q(".stage-challenge"), { autoAlpha: 0, y: -12, duration: 0.5 }, 5.6)
          .to(box(highlight.challenge), { stroke: "var(--color-line-2)", duration: 0.4 }, 5.6)
          .to(others(highlight.challenge), { opacity: 1, duration: 0.4 }, 5.6)
          .to(q(".stage-solution"), { autoAlpha: 1, y: 0, duration: 0.7 }, 5.9)
          .to(others(highlight.solution), { opacity: 0.35, duration: 0.6 }, 5.9)
          .to(box(highlight.solution), { stroke: "var(--color-accent)", duration: 0.5 }, 6.0)
          .to(nodes(highlight.solution), { scale: 1.03, transformOrigin: "50% 50%", duration: 0.5 }, 6.0)
          .to(others(highlight.solution), { opacity: 1, duration: 0.5 }, 7.8)
          .to(box(highlight.solution), { stroke: "var(--color-line-2)", duration: 0.5 }, 7.8)
          .to(nodes(highlight.solution), { scale: 1, duration: 0.5 }, 7.8)
          .to(q(".scene-facts"), { autoAlpha: 1, y: 0, duration: 0.7 }, 8.0)
          .to({}, { duration: 1.2 }, 8.4);

        return () => {
          reveal.kill();
          killAmbient();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <article ref={ref} className="relative" aria-labelledby={`p-${project.slug}`}>
      <div className="pin relative flex min-h-[100svh] flex-col motion-reduce:min-h-0">
        <div className="gutter mx-auto grid w-full max-w-[100rem] flex-1 grid-cols-12 gap-x-6 gap-y-10 pb-10 pt-24 lg:items-center lg:pt-28">
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <ProjectHeader project={project} />
            <h3 id={`p-${project.slug}`} className="text-h2 mt-6 max-w-[12ch] text-fg-1">
              {project.title}
            </h3>
            <div className="relative mt-6 min-h-[11rem] motion-reduce:min-h-0">
              <div className="stage stage-intro absolute inset-x-0 top-0 motion-reduce:relative motion-reduce:mb-6">
                <p className="text-lead text-balance text-fg-2">{project.tagline}</p>
              </div>
              <Stage className="stage-challenge" index="A" label="Challenge" title={project.challenge!.title} body={project.challenge!.body} />
              <Stage className="stage-solution" index="B" label="Solution" title={project.solution!.title} body={project.solution!.body} />
            </div>
            <TechList items={project.technologies} className="mt-8" />
            <ProjectLinks project={project} className="mt-8" />
          </div>

          <div className="col-span-12 lg:col-span-7 lg:pl-6 xl:col-span-8 xl:pl-8">
            <div className="rounded-3xl border border-line-1 bg-bg-1/40 p-4 sm:p-6 lg:p-8">
              <SystemViz
                ref={svgRef}
                id={`viz-${project.slug}`}
                architecture={arch}
                title={`${project.title} architecture`}
                desc={project.description}
              />
            </div>
            <FactList facts={project.facts} className="scene-facts mt-8" />
          </div>
        </div>
      </div>
    </article>
  );
}

function Stage({ className, index, label, title, body }: { className: string; index: string; label: string; title: string; body: string }) {
  return (
    <div className={cn("stage absolute inset-x-0 top-0 motion-reduce:relative motion-reduce:mb-6", className)}>
      <div className="label flex items-center gap-3 text-fg-3">
        <span className="text-accent">{index}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-h3 text-fg-1">{title}</p>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{body}</p>
    </div>
  );
}
