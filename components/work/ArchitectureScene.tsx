"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP, MOBILE } from "@/lib/gsap";
import type { Project } from "@/data/types";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { Tilt } from "@/components/visuals/Tilt";
import { FactList, ProjectHeader, ProjectLinks, TechList } from "./ProjectMeta";
import { cn } from "@/lib/utils";

/**
 * Story scene. Desktop: pinned — the product visual rises into place while the
 * story (intro → challenge → solution → facts) advances beside it.
 * Small screens: a clean stacked flow with reveal animations, no pinning.
 */
export function ArchitectureScene({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        gsap.set(q(".stage"), { autoAlpha: 0, y: 16 });
        gsap.set(q(".stage-intro"), { autoAlpha: 1, y: 0 });
        gsap.set(q(".scene-facts"), { autoAlpha: 0, y: 12 });
        gsap.set(q(".scene-visual"), { autoAlpha: 0, y: 80, rotateY: -10, rotateX: 6, scale: 0.92, transformPerspective: 1600, transformOrigin: "50% 60%" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".pin")[0],
            start: "top top",
            end: "+=300%",
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

      mm.add(`${MOTION_OK} and ${MOBILE}`, () => {
        gsap.from(q(".scene-visual"), { y: 40, opacity: 0, scale: 0.96, duration: 1, ease: "expo.out", scrollTrigger: { trigger: q(".scene-visual")[0], start: "top 85%", once: true } });
        gsap.from(q(".stage-challenge, .stage-solution"), { y: 24, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: q(".stage-challenge")[0], start: "top 88%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <article ref={ref} className="relative" aria-labelledby={`p-${project.slug}`}>
      <div className="pin relative flex flex-col lg:min-h-[100svh]">
        <div className="gutter mx-auto grid w-full max-w-[100rem] flex-1 grid-cols-12 gap-x-6 gap-y-8 py-20 lg:items-center lg:py-28">
          {/* A — header + title + intro */}
          <div className="col-span-12 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-end xl:col-span-4">
            <ProjectHeader project={project} />
            <h3 id={`p-${project.slug}`} className="text-h2 mt-6 max-w-[12ch] text-fg-1">
              {project.title}
            </h3>
            <div className="stage stage-intro mt-5 lg:mt-6">
              <p className="text-lead text-balance text-fg-2">{project.tagline}</p>
            </div>
          </div>

          {/* B — visual */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:pl-6 xl:col-span-8 xl:col-start-5 xl:pl-8">
            <div className="scene-visual group/tilt">
              <Tilt max={4}>
                <ProductVisual project={project} />
              </Tilt>
            </div>
          </div>

          {/* C — stages + tech + links */}
          <div className="col-span-12 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start xl:col-span-4">
            <div className="relative lg:min-h-[11rem]">
              <Stage className="stage-challenge" index="A" label="Challenge" title={project.challenge!.title} body={project.challenge!.body} />
              <Stage className="stage-solution mt-5 lg:mt-0" index="B" label="Solution" title={project.solution!.title} body={project.solution!.body} />
            </div>
            <TechList items={project.technologies} className="mt-8" />
            <ProjectLinks project={project} className="mt-8" />
          </div>

          {/* D — facts */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6 lg:row-start-3 lg:pl-6 xl:col-span-8 xl:col-start-5 xl:pl-8">
            <FactList facts={project.facts} className="scene-facts" />
          </div>
        </div>
      </div>
    </article>
  );
}

function Stage({ className, index, label, title, body }: { className: string; index: string; label: string; title: string; body: string }) {
  return (
    <div className={cn("stage rounded-2xl border border-line-1 bg-bg-2/50 p-5 lg:absolute lg:inset-x-0 lg:top-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0", className)}>
      <div className="label flex items-center gap-3 text-fg-3">
        <span className="text-accent">{index}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-h3 text-fg-1">{title}</p>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{body}</p>
    </div>
  );
}
