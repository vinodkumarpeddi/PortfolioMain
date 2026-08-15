"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import type { Project } from "@/data/types";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { FactList, ProjectHeader, ProjectLinks, TechList } from "./ProjectMeta";
import { cn } from "@/lib/utils";

const roles = [
  { role: "Super admin", scope: "Platform", can: ["View tenants", "View plans and limits"], cannot: ["Read tenant projects, users or tasks"] },
  { role: "Tenant admin", scope: "One tenant", can: ["Dashboard", "Create projects and tasks", "Manage users within plan limits"], cannot: ["See other tenants"] },
  { role: "User", scope: "One tenant", can: ["Dashboard", "View projects and tasks"], cannot: ["Write anything"] },
];

/**
 * Horizontal technical scene: on desktop the panels slide horizontally while
 * the section is pinned; on smaller screens they stack vertically.
 */
export function HorizontalScene({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        const panels = gsap.utils.toArray<HTMLElement>(".h-panel", track);
        const distance = () => track.scrollWidth - el.clientWidth;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance(), ease: "none", duration: 1 }, 0);
        panels.forEach((p) => {
          const items = p.querySelectorAll(".h-reveal");
          if (!items.length) return;
          gsap.from(items, {
            y: 24,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: "expo.out",
            scrollTrigger: { trigger: p, containerAnimation: tl, start: "left 78%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <article ref={ref} className="relative overflow-hidden" aria-labelledby={`p-${project.slug}`}>
      <div className="lg:h-[100svh]">
        <div ref={trackRef} className="flex flex-col gap-12 py-16 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-0 lg:py-0 sm:py-24">
          {/* panel 1 — title */}
          <Panel className="lg:pl-[var(--spacing-gutter)]">
            <div className="h-reveal">
              <ProjectHeader project={project} />
            </div>
            <h3 id={`p-${project.slug}`} className="h-reveal text-h1 mt-6 text-fg-1">
              {project.title}
            </h3>
            <p className="h-reveal text-lead mt-6 max-w-[38ch] text-balance text-fg-2">{project.tagline}</p>
            <p className="h-reveal mt-5 max-w-[50ch] text-[15px] leading-relaxed text-fg-2">{project.description}</p>
            <div className="h-reveal mt-8 hidden items-center gap-3 lg:flex" aria-hidden>
              <span className="label text-fg-3">Scroll to move</span>
              <span className="h-px w-16 bg-line-2" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
          </Panel>

          {/* panel 2 — roles */}
          <Panel wide>
            <div className="h-reveal flex items-baseline justify-between gap-4">
              <p className="label text-fg-3">Roles and what they can touch</p>
              <p className="label text-fg-3 sm:hidden" aria-hidden>Three roles</p>
            </div>
            <RoleRow />
          </Panel>

          {/* panel 3 — request path */}
          <Panel wide>
            <p className="h-reveal label text-fg-3">Every request, in order</p>
            <div className="h-reveal mt-6">
              <ProductVisual project={project} />
            </div>
            <p className="h-reveal mt-4 max-w-[60ch] text-sm leading-relaxed text-fg-2">
              Identity from the JWT, then role, then tenant — each enforced by middleware before a controller runs, so isolation cannot be forgotten in a query.
            </p>
          </Panel>

          {/* panel 4 — facts + links */}
          <Panel className="lg:pr-[var(--spacing-gutter)]">
            <div className="h-reveal">
              <FactList facts={project.facts} className="sm:grid-cols-1" />
            </div>
            <div className="h-reveal mt-8">
              <TechList items={project.technologies} />
            </div>
            <div className="h-reveal mt-8">
              <ProjectLinks project={project} />
            </div>
          </Panel>
        </div>
      </div>
    </article>
  );
}

/** The three roles: a snap-scrolling row with dots on phones, a grid from sm up. */
function RoleRow() {
  const scroller = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    let best = 0;
    let bestDelta = Infinity;
    cards.forEach((c, i) => {
      const delta = Math.abs(c.offsetLeft - el.scrollLeft);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = i;
      }
    });
    setCurrent(best);
  }, []);

  const goTo = (i: number) => {
    const el = scroller.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar mt-6 -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain px-[var(--spacing-gutter)] pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0"
      >
        {roles.map((r, i) => (
          <div
            key={r.role}
            className="h-reveal w-[80vw] max-w-[22rem] shrink-0 snap-start rounded-2xl border border-line-1 bg-bg-2/60 p-5 sm:w-auto sm:max-w-none"
          >
            <div className="label flex items-center justify-between text-fg-3">
              <span className="text-accent">0{i + 1}</span>
              <span>{r.scope}</span>
            </div>
            <p className="mt-3 text-h3 text-fg-1">{r.role}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-fg-2">
              {r.can.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-success" aria-hidden />
                  {c}
                </li>
              ))}
              {r.cannot.map((c) => (
                <li key={c} className="flex gap-2 text-fg-3">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-error/70" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 sm:hidden">
        {roles.map((r, i) => (
          <button
            key={r.role}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${r.role}`}
            aria-current={current === i}
            className="-m-2.5 grid h-11 w-11 place-items-center"
          >
            <span className={cn("h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-base)]", current === i ? "w-5 bg-accent" : "w-1.5 bg-fg-3/40")} />
          </button>
        ))}
      </div>
    </>
  );
}

function Panel({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className={cn("h-panel gutter shrink-0 lg:px-10", wide ? "lg:w-[min(64vw,60rem)]" : "lg:w-[min(46vw,40rem)]", className)}>
      {children}
    </div>
  );
}
