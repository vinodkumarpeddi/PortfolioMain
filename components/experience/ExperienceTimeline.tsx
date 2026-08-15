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
  const state = useRef<HeroState>({ spread: 0.05, opacity: 1, energy: 0.2 });
  const panelsRef = useRef<HTMLOListElement>(null);

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

        <div className="mt-10 grid grid-cols-12 gap-x-8">
          {/* planet + orbit (sticky) */}
          <div className="col-span-12 lg:col-span-6">
            <div className="sticky top-16 z-10 h-[40vh] lg:top-24 lg:h-[calc(100svh-7rem)]">
              <div className="absolute inset-0 rounded-[28px] border border-line-1 bg-bg-1/40 [box-shadow:var(--shadow-soft)]">
                <div aria-hidden className="grid-bg absolute inset-0 rounded-[28px] opacity-60 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
                <HeroCanvas stateRef={state} variant="orbit" orbit={{ count: ordered.length, activeRef }} className="absolute inset-0" />
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
                  <p className="label tabular-nums text-fg-3">
                    <span className="text-fg-1">{String(active + 1).padStart(2, "0")}</span> / {String(ordered.length).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* story panels */}
          <ol ref={panelsRef} className="col-span-12 lg:col-span-6">
            {ordered.map((m, i) => (
              <li key={m.id} data-panel={i} className="flex min-h-[70vh] items-center py-8 lg:min-h-[100svh]">
                <motion.article
                  className="w-full"
                  animate={{ opacity: active === i ? 1 : 0.45, scale: active === i ? 1 : 0.985 }}
                  transition={{ duration: 0.6, ease: ease.outExpo }}
                >
                  <div className={cn("relative overflow-hidden rounded-[28px] border bg-[#101013]/90 p-6 backdrop-blur-xl transition-[border-color,box-shadow] duration-[var(--duration-cinematic)] sm:p-8", active === i ? "border-accent/25 [box-shadow:0_1px_0_rgba(255,255,255,0.07)_inset,0_40px_100px_-30px_rgba(233,162,59,0.22),0_30px_80px_-30px_rgba(0,0,0,0.9)]" : "border-line-1 [box-shadow:var(--shadow-soft)]")}>
                    <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none text-[clamp(6rem,10vw,10rem)] font-semibold leading-none tracking-[-0.06em] text-fg-1/[0.045]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <div className="label flex flex-wrap items-center gap-2 text-fg-3">
                        <span className={cn("rounded-full border px-2.5 py-1", m.kind === "work" ? "border-accent/40 text-accent" : "border-line-2 text-fg-2")}>{kindLabel[m.kind]}</span>
                        <span className="rounded-full border border-line-1 px-2.5 py-1 text-fg-2">{m.period}</span>
                        {!m.end && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 px-2.5 py-1 text-success">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70 motion-reduce:animate-none" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                            </span>
                            Now
                          </span>
                        )}
                      </div>
                      <h3 className="text-h2 mt-5 break-words text-fg-1">{m.org}</h3>
                      <p className="mt-2 text-lead text-fg-2">
                        {m.role}
                        {m.location && <span className="block text-[15px] text-fg-3">{m.location}</span>}
                      </p>
                      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_11rem]">
                        <div>
                          <p className="max-w-[56ch] text-[15px] leading-relaxed text-fg-2">{m.summary}</p>
                          {m.points.length > 0 && (
                            <ul className="mt-5 space-y-2 text-sm text-fg-2">
                              {m.points.slice(0, 4).map((p) => (
                                <li key={p} className="flex gap-3">
                                  <span className="mt-[9px] h-px w-3 shrink-0 bg-accent/70" aria-hidden />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="hidden sm:block">
                          <CoverFor id={m.id} />
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line-1 pt-5">
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
    </section>
  );
}
