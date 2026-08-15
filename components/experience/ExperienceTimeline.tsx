"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { milestones, type Milestone } from "@/data/experience";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { ArrowUpRight } from "@/components/ui/Icons";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { HeroState } from "@/components/three/HeroObject";
import { CoverFor } from "./Covers";
import { ease } from "@/lib/motion";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const kindLabel: Record<Milestone["kind"], string> = { work: "Experience", education: "Education", build: "Systems work" };
const ordered = [...milestones].reverse(); // now → 2022

/**
 * "Orbit": the planet from the hero returns; each milestone is a marker on
 * an orbit ring. Scrolling the story panels rotates the active marker to the
 * front and pulses it. Planet is sticky; panels scroll — same on mobile.
 */
export function ExperienceTimeline() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const desktop = useIsDesktop();
  const state = useRef<HeroState>({ spread: 0.05, opacity: 1, energy: 0.2 });
  const panelsRef = useRef<HTMLOListElement>(null);
  const jump = (i: number) => {
    const el = panelsRef.current?.querySelector<HTMLElement>(`[data-panel="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const els = Array.from(panelsRef.current?.querySelectorAll<HTMLElement>("[data-panel]") ?? []);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const i = Number((hit.target as HTMLElement).dataset.panel);
        activeRef.current = i;
        setActive(i);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const current = ordered[active];

  return (
    <section id="experience" data-section="experience" className="relative" aria-labelledby="exp-title">
      <div className="gutter relative mx-auto max-w-[100rem] pt-[var(--spacing-section)]">
        <SectionNumeral>03</SectionNumeral>
        <Reveal>
          <SectionLabel index="03">Engineering experience</SectionLabel>
        </Reveal>
        <div className="relative mt-6 flex flex-wrap items-end justify-between gap-6">
          <h2 id="exp-title" className="text-h1 max-w-[14ch] text-fg-1">
            <SplitText by="words">Where the work happened.</SplitText>
          </h2>
          <Reveal delay={0.15} className="label hidden items-center gap-3 text-fg-3 lg:flex" aria-hidden>
            <span>Scroll — the orbit follows</span>
            <span className="h-px w-16 bg-line-2" />
            <span className="text-fg-2">now → 2022</span>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-12 gap-x-4 lg:gap-x-8">
          {/* planet + orbit (sticky) */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative z-10 h-[40vh] lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)]">
              <div className="absolute inset-0 rounded-[28px] border border-line-1 bg-bg-1/40 [box-shadow:var(--shadow-soft)]">
                <div aria-hidden className="grid-bg absolute inset-0 rounded-[28px] opacity-60 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
                <HeroCanvas stateRef={state} variant="orbit" orbit={{ count: ordered.length, activeRef, labels: ordered.map((m) => `${m.start.slice(0, 4)} · ${m.org}`), onSelect: jump }} className="absolute inset-0 [&_canvas]:pointer-events-auto" />
                {/* readout */}
                <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 lg:inset-x-7 lg:bottom-7">
                  <div>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: ease.outExpo }} className="text-h2 tabular-nums text-fg-1 lg:text-h1">
                        {current.start.slice(0, 4)}
                      </motion.p>
                    </AnimatePresence>
                    <p className="label mt-2 text-fg-3">{current.org}</p>
                  </div>
                  <div className="pointer-events-auto flex flex-col items-end gap-3">
                    <p className="label tabular-nums text-fg-3">
                      <span className="text-fg-1">{String(active + 1).padStart(2, "0")}</span> / {String(ordered.length).padStart(2, "0")}
                    </p>
                    <div className="hidden gap-1.5 lg:flex" role="tablist" aria-label="Jump to milestone">
                      {ordered.map((m, i) => (
                        <button key={m.id} type="button" role="tab" aria-selected={active === i} aria-label={m.org} onClick={() => jump(i)} className="grid h-6 place-items-center px-0.5"><span className={cn("block h-2 rounded-full transition-all duration-[var(--duration-slow)]", active === i ? "w-6 bg-accent" : "w-2 bg-fg-3/60 hover:bg-fg-2")} /></button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="label pointer-events-none absolute left-5 top-5 text-fg-3 lg:left-7 lg:top-7">
                  Orbit · <span className="lg:hidden">tap a marker</span>
                  <span className="hidden lg:inline">click a marker to jump</span>
                </p>
              </div>
            </div>
          </div>

          {/* story panels */}
          <div className="col-span-12 lg:col-span-6">
            {/* phones: a slim sticky scrubber keeps the orbit's context while the cards scroll */}
            <div className="sticky top-[4.25rem] z-30 mb-5 lg:hidden">
              <div className="flex items-center gap-3 rounded-full border border-line-1 bg-bg-1/90 pl-4 pr-2 backdrop-blur-xl [box-shadow:var(--shadow-soft)]">
                <span className="tabular-nums text-[15px] font-semibold text-fg-1">{current.start.slice(0, 4)}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-fg-2">{current.org}</span>
                <div className="flex items-center" role="tablist" aria-label="Jump to milestone">
                  {ordered.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={active === i}
                      aria-label={`${m.start.slice(0, 4)} · ${m.org}`}
                      onClick={() => jump(i)}
                      className="grid h-11 w-7 place-items-center transition-transform duration-150 active:scale-90"
                    >
                      <span className={cn("block h-1.5 rounded-full transition-all duration-[var(--duration-slow)]", active === i ? "w-5 bg-accent" : "w-1.5 bg-fg-3/60")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ol ref={panelsRef}>
            {ordered.map((m, i) => (
              <li key={m.id} data-panel={i} className="flex items-center py-5 sm:min-h-[70vh] sm:py-8 lg:min-h-[100svh]">
                <motion.article
                  className="w-full"
                  animate={{ opacity: active === i ? 1 : desktop ? 0.45 : 0.75, scale: active === i ? 1 : 0.985 }}
                  transition={{ duration: 0.6, ease: ease.outExpo }}
                >
                  <div className={cn("relative overflow-hidden rounded-[28px] border bg-[#101013]/90 p-6 backdrop-blur-xl transition-[border-color,box-shadow] duration-[var(--duration-cinematic)] sm:p-8", active === i ? "border-accent/25 [box-shadow:0_1px_0_rgba(255,255,255,0.07)_inset,0_40px_100px_-30px_rgba(233,162,59,0.22),0_30px_80px_-30px_rgba(0,0,0,0.9)]" : "border-line-1 [box-shadow:var(--shadow-soft)]")}>
                    <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none text-[clamp(6rem,10vw,10rem)] font-semibold leading-none tracking-[-0.06em] text-fg-1/[0.045]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <div className="overflow-hidden rounded-2xl border border-line-1">
                        <CoverFor id={m.id} />
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className={cn("label rounded-full border px-2.5 py-1", m.kind === "work" ? "border-accent/40 text-accent" : "border-line-2 text-fg-2")}>{kindLabel[m.kind]}</span>
                        <span className="label rounded-full border border-line-1 px-2.5 py-1 text-fg-2">{m.period}</span>
                        {!m.end && (
                          <span className="label inline-flex items-center gap-1.5 rounded-full border border-success/40 px-2.5 py-1 text-success">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70 motion-reduce:animate-none" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                            </span>
                            Now
                          </span>
                        )}
                        {m.highlights && m.highlights.map((h, k) => (
                          <motion.span key={h} initial={false} animate={{ opacity: active === i ? 1 : 0.5, y: active === i ? 0 : 4 }} transition={{ duration: 0.5, delay: active === i ? 0.08 + k * 0.06 : 0, ease: ease.outExpo }} className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[12px] text-fg-1">
                            {h}
                          </motion.span>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h3 className="text-h2 break-words text-fg-1">{m.org}</h3>
                        <p className="text-[15px] text-fg-2">
                          {m.role}
                          {m.location && <span className="text-fg-3"> · {m.location}</span>}
                        </p>
                      </div>
                      <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-fg-2">{m.summary}</p>
                      {m.points.length > 0 && <Points points={m.points} />}
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line-1 pt-4">
                        {m.technologies.length > 0 && (
                          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                            {m.technologies.slice(0, 8).map((t) => (
                              <li key={t} className="label rounded-full border border-line-1 bg-bg-1/60 px-2.5 py-1.5 text-fg-3">{t}</li>
                            ))}
                          </ul>
                        )}
                        {m.link && (
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm text-fg-2 transition-colors hover:text-fg-1">
                            <span className="link-underline">{m.kind === "build" ? "On GitHub" : "About the company"}</span> <ArrowUpRight />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              </li>
            ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Cards stay short on phones: two points, then a toggle. All four from sm up. */
function Points({ points }: { points: string[] }) {
  const [open, setOpen] = useState(false);
  const shown = points.slice(0, 4);
  const extra = shown.length - 2;
  return (
    <>
      <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-fg-2 sm:grid-cols-2">
        {shown.map((p, i) => (
          <li key={p} className={cn("flex gap-3", !open && i >= 2 && "hidden sm:flex")}>
            <span className="mt-[9px] h-px w-3 shrink-0 bg-accent/70" aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="label mt-3 inline-flex h-10 items-center rounded-full border border-line-1 px-3.5 text-fg-3 transition-transform duration-150 active:scale-95 sm:hidden"
        >
          {open ? "Show less" : `+${extra} more`}
        </button>
      )}
    </>
  );
}
