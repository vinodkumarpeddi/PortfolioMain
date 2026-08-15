"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { branches, technologies } from "@/data/technology";
import { indexProjects, projects } from "@/data/projects";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion, useIsDesktop } from "@/lib/hooks/use-media-query";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SectionNumeral } from "@/components/ui/SectionNumeral";

type ProjectRef = { key: string; title: string; kind: "featured" | "index" };

const projectRefs: ProjectRef[] = [
  ...projects.map((p) => ({ key: p.slug, title: p.title, kind: "featured" as const })),
  ...indexProjects.map((p) => ({ key: p.title, title: p.title, kind: "index" as const })),
];

type Line = { d: string; key: string };

export function TechnologyMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const reduced = usePrefersReducedMotion();
  const desktop = useIsDesktop();

  const tech = useMemo(() => technologies.find((t) => t.id === activeTech) ?? null, [activeTech]);
  const connectedProjects = useMemo(() => new Set(tech?.projects ?? []), [tech]);
  const techsForProject = useMemo(
    () => new Set(activeProject ? technologies.filter((t) => t.projects.includes(activeProject)).map((t) => t.id) : []),
    [activeProject],
  );

  // auto-cycle until the visitor interacts
  useEffect(() => {
    if (touched || reduced) return;
    const ids = ["postgres", "rabbitmq", "redis", "idempotency", "nextjs", "docker", "outbox", "node"];
    let i = 0;
    let visible = false;
    const root = rootRef.current;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
    if (root) io.observe(root);
    const tick = window.setInterval(() => {
      if (!visible) return;
      setActiveTech(ids[i % ids.length]);
      i++;
    }, 2400);
    return () => {
      window.clearInterval(tick);
      io.disconnect();
    };
  }, [touched, reduced]);

  const computeLines = useCallback(() => {
    const root = rootRef.current;
    if (!root || !tech || !desktop) {
      setLines([]);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const from = root.querySelector<HTMLElement>(`[data-tech="${tech.id}"]`);
    if (!from) return;
    const f = from.getBoundingClientRect();
    const x1 = f.right - rootRect.left;
    const y1 = f.top + f.height / 2 - rootRect.top;
    const next: Line[] = [];
    for (const key of tech.projects) {
      const to = root.querySelector<HTMLElement>(`[data-project="${CSS.escape(key)}"]`);
      if (!to) continue;
      const t = to.getBoundingClientRect();
      const x2 = t.left - rootRect.left;
      const y2 = t.top + t.height / 2 - rootRect.top;
      const dx = Math.max(60, (x2 - x1) * 0.5);
      next.push({ key, d: `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}` });
    }
    setLines(next);
  }, [tech, desktop]);

  useLayoutEffect(() => {
    computeLines();
  }, [computeLines]);

  useEffect(() => {
    const onResize = () => computeLines();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computeLines]);

  const interact = (fn: () => void) => {
    setTouched(true);
    fn();
  };

  return (
    <div ref={rootRef} className="relative mt-14">
      {/* connection overlay */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
        <defs>
          <filter id="tm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <AnimatePresence>
          {lines.map((l, i) => (
            <g key={`${tech?.id}-${l.key}`}>
              <motion.path
                d={l.d}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                strokeOpacity="0.85"
                filter="url(#tm-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.7, ease: ease.outExpo, delay: i * 0.04 }}
              />
              <motion.circle r="3.5" fill="#ffd18a" filter="url(#tm-glow)" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 + i * 0.12, ease: "linear" }}>
                <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${0.3 + i * 0.12}s`} path={l.d} />
              </motion.circle>
            </g>
          ))}
        </AnimatePresence>
      </svg>

      <div className="grid grid-cols-12 gap-x-6 gap-y-12">
        {/* map */}
        <div className="col-span-12 lg:col-span-8">
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="relative grid h-10 w-10 place-items-center">
                <span className="absolute inset-0 rounded-full border border-line-2" />
                <span className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-dashed border-accent/40 motion-reduce:animate-none" />
                <span className="h-2 w-2 rounded-full bg-accent" />
              </span>
              <p className="text-h3 text-fg-1">Software engineering</p>
              <span className="label ml-auto hidden text-fg-3 sm:block">{technologies.length} nodes · {branches.length} branches</span>
            </div>
            <div aria-hidden className="ml-5 mt-2 h-8 w-px bg-line-2" />
          </div>

          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-5" role="list" aria-label="Technology map">
            {branches.map((b) => (
              <div key={b.id} role="listitem" className="relative rounded-2xl border border-line-1 bg-bg-2/40 p-3 transition-colors duration-[var(--duration-slow)] hover:border-line-2">
                <div className="label flex items-center gap-2 border-b border-line-1 px-2 pb-3 text-fg-2">
                  <span className="text-accent">{b.index}</span>
                  {b.label}
                </div>
                <ul className="mt-2 space-y-0.5">
                  {technologies
                    .filter((t) => t.branch === b.id)
                    .map((t) => {
                      const on = activeTech === t.id;
                      const inProject = techsForProject.has(t.id);
                      const dim = (activeTech && !on) || (activeProject && !inProject);
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            data-tech={t.id}
                            onMouseEnter={() => interact(() => { setActiveProject(null); setActiveTech(t.id); })}
                            onFocus={() => interact(() => { setActiveProject(null); setActiveTech(t.id); })}
                            onClick={() => interact(() => { setActiveProject(null); setActiveTech(t.id); })}
                            aria-pressed={on}
                            className={cn(
                              "group relative flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-[14.5px] leading-snug transition-[opacity,color,background-color,border-color,box-shadow] duration-[var(--duration-base)]",
                              on ? "border-accent/50 bg-accent-soft text-fg-1 [box-shadow:0_0_0_1px_rgba(233,162,59,0.15),0_10px_30px_-12px_rgba(233,162,59,0.45)]" : inProject ? "border-accent/30 bg-fg-1/[0.05] text-fg-1" : "border-transparent text-fg-2 hover:border-line-1 hover:bg-fg-1/[0.03] hover:text-fg-1",
                              dim && "opacity-35",
                            )}
                          >
                            <span className={cn("relative h-1.5 w-1.5 shrink-0 rounded-full transition-colors", on || inProject ? "bg-accent" : "bg-fg-3")}>
                              {on && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70 motion-reduce:animate-none" />}
                            </span>
                            <span>{t.name}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* console */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-2xl border border-line-1 bg-bg-2/60 p-5 [box-shadow:var(--shadow-soft)]" aria-live="polite">
              <span aria-hidden className={cn("pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/[0.12] blur-3xl transition-opacity duration-[var(--duration-slow)]", tech ? "opacity-100" : "opacity-0")} />
              <div className="label flex items-center justify-between text-fg-3">
                <span>Where it was used</span>
                <span className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", tech ? "bg-success" : "bg-fg-3")} />
                  {tech ? "live" : "idle"}
                </span>
              </div>
              <div className="mt-4 min-h-[6.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {tech ? (
                    <motion.div key={tech.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: ease.outExpo }}>
                      <p className="text-h3 text-fg-1">{tech.name}</p>
                      <p className="mt-2 text-sm leading-relaxed text-fg-2">
                        <span className="vis-reveal">{tech.usage}</span>
                      </p>
                      <p className="label mt-3 text-fg-3">{tech.projects.length} system{tech.projects.length === 1 ? "" : "s"} · {tech.branch}</p>
                    </motion.div>
                  ) : (
                    <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm leading-relaxed text-fg-3">
                      Hover a technology to see where it was used and which systems it connects to. Hover a system to see its stack.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Systems">
              {projectRefs.map((p) => {
                const on = connectedProjects.has(p.key);
                const selected = activeProject === p.key;
                const dim = (tech && !on) || (activeProject && !selected);
                return (
                  <li key={p.key}>
                    <button
                      type="button"
                      data-project={p.key}
                      onMouseEnter={() => interact(() => { setActiveTech(null); setActiveProject(p.key); })}
                      onFocus={() => interact(() => { setActiveTech(null); setActiveProject(p.key); })}
                      onClick={() => interact(() => { setActiveTech(null); setActiveProject(p.key); })}
                      aria-pressed={selected}
                      className={cn(
                        "label rounded-full border px-3 py-2 transition-[opacity,border-color,color,background-color,box-shadow] duration-[var(--duration-base)]",
                        on || selected ? "border-accent/70 bg-accent-soft text-fg-1 [box-shadow:0_8px_24px_-10px_rgba(233,162,59,0.5)]" : "border-line-1 text-fg-2 hover:border-line-2 hover:text-fg-1",
                        p.kind === "featured" && "font-semibold",
                        dim && "opacity-35",
                      )}
                    >
                      {p.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SystemsSection() {
  return (
    <section id="systems" data-section="systems" className="relative" aria-labelledby="sys-title">
      <div className="gutter relative mx-auto max-w-[100rem] py-[var(--spacing-section)]">
        <SectionNumeral>04</SectionNumeral>
        <Reveal>
          <SectionLabel index="04">Systems &amp; technology</SectionLabel>
        </Reveal>
        <div className="relative mt-6 flex flex-wrap items-end justify-between gap-6">
          <h2 id="sys-title" className="text-h1 max-w-[14ch] text-fg-1">
            <SplitText by="words">Not a list of logos. A map of decisions.</SplitText>
          </h2>
          <Reveal delay={0.15} className="max-w-[34ch] text-[15px] leading-relaxed text-fg-2">
            Every node is tied to a system I built with it. Hover one to see where — and what it connects to.
          </Reveal>
        </div>
        <TechnologyMap />
      </div>
    </section>
  );
}
