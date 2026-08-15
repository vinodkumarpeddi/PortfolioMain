"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP, MOBILE } from "@/lib/gsap";
import type { Project } from "@/data/types";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { Tilt } from "@/components/visuals/Tilt";
import { FactList, ProjectHeader, ProjectLinks, TechList } from "./ProjectMeta";
import { cn } from "@/lib/utils";

/**
 * Pinned story scene: the product visual rises into place while the story
 * (intro → challenge → solution → facts) advances; stages spotlight parts of the visual.
 */
export function ArchitectureScene({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, desktop: DESKTOP, mobile: MOBILE }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;


        gsap.set(q(".stage"), { autoAlpha: 0, y: 16 });
        gsap.set(q(".stage-intro"), { autoAlpha: 1, y: 0 });
        gsap.set(q(".scene-facts"), { autoAlpha: 0, y: 12 });
        gsap.set(q(".scene-visual"), { autoAlpha: 0, y: 80, rotateY: desktop ? -10 : 0, rotateX: 6, scale: 0.92, transformPerspective: 1600, transformOrigin: "50% 60%" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".pin")[0],
            start: "top top",
            end: desktop ? "+=300%" : "+=260%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(q(".scene-visual"), { autoAlpha: 1, y: 0, rotateY: 0, rotateX: 0, scale: 1, duration: 2.2, ease: "power2.out" }, 0)
          .to(q(".stage-intro"), { autoAlpha: 0, y: -12, duration: 0.5 }, 2.6)
          .to(q(".stage-challenge"), { autoAlpha: 1, y: 0, duration: 0.7 }, 2.9)
          .to(q(".scene-visual"), { rotateY: 6, scale: 0.98, duration: 1.2 }, 2.9)
          .to(q(".stage-challenge"), { autoAlpha: 0, y: -12, duration: 0.5 }, 5.0)
          .to(q(".stage-solution"), { autoAlpha: 1, y: 0, duration: 0.7 }, 5.4)
          .to(q(".scene-visual"), { rotateY: -4, scale: 1, duration: 1.2 }, 5.4)
          .to(q(".scene-facts"), { autoAlpha: 1, y: 0, duration: 0.7 }, 7.6)
          .to({}, { duration: 1.2 }, 8.0);
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
            <div className="scene-visual group/tilt">
              <Tilt max={4}>
                <ProductVisual project={project} />
              </Tilt>
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
