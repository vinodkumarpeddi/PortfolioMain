"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "motion/react";
import { milestones, type Milestone } from "@/data/experience";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { ArrowUpRight, ArrowRight, ArrowLeft } from "@/components/ui/Icons";
import { CoverFor } from "./Covers";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const kindLabel: Record<Milestone["kind"], string> = { work: "Experience", education: "Education", build: "Systems work" };
const ordered = [...milestones].reverse(); // now → 2022

/**
 * Interactive experience carousel: drag or swipe through large illustrated
 * cards (inertia + snap), arrows and keyboard also work, active card comes
 * forward while neighbours recede. Same component on mobile.
 */
export function ExperienceTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [pad, setPad] = useState(0);

  // measure card step & centering pad
  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      const first = trackRef.current?.querySelector<HTMLElement>(".xp-slide");
      if (!vp || !first) return;
      const gap = 24;
      setStep(first.offsetWidth + gap);
      setPad(Math.max(0, (vp.clientWidth - first.offsetWidth) / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (i: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(ordered.length - 1, i));
      setIndex(clamped);
      animate(x, -clamped * step, { type: "spring", stiffness: 260, damping: 32, mass: 0.8, velocity });
    },
    [step, x],
  );

  useEffect(() => {
    if (step) animate(x, -index * step, { type: "spring", stiffness: 260, damping: 32, mass: 0.8 });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!step) return;
    const projected = -x.get() - info.velocity.x * 0.18;
    const target = Math.round(projected / step);
    goTo(target, info.velocity.x);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(index + 1);
    if (e.key === "ArrowLeft") goTo(index - 1);
  };

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
          <Reveal delay={0.15} className="flex items-center gap-3">
            <span className="label hidden text-fg-3 sm:block">Drag · swipe · arrow keys</span>
            <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full border border-line-2 text-fg-1 transition-colors hover:border-fg-1/60 disabled:opacity-30" disabled={index === 0}>
              <ArrowLeft />
            </button>
            <button type="button" onClick={() => goTo(index + 1)} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full border border-line-2 text-fg-1 transition-colors hover:border-fg-1/60 disabled:opacity-30" disabled={index === ordered.length - 1}>
              <ArrowRight />
            </button>
          </Reveal>
        </div>

        {/* year track */}
        <ol className="mt-10 flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label="Milestones">
          {ordered.map((m, i) => (
            <li key={m.id} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === index ? "step" : undefined}
                className={cn(
                  "label flex items-center gap-2 rounded-full border px-3 py-2 transition-colors duration-[var(--duration-base)]",
                  i === index ? "border-accent/60 bg-accent-soft text-fg-1" : "border-line-1 text-fg-3 hover:text-fg-1",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", i === index ? "bg-accent" : "bg-fg-3")} />
                {m.start.slice(0, 4)} · {m.org}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* carousel */}
      <div ref={viewportRef} className="relative mt-8 overflow-hidden py-6 outline-none [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]" tabIndex={0} onKeyDown={onKey} aria-roledescription="carousel">
        <motion.div
          ref={trackRef}
          className="flex cursor-grab gap-6 active:cursor-grabbing"
          style={{ x, paddingLeft: pad, paddingRight: pad }}
          drag="x"
          dragConstraints={{ left: -(ordered.length - 1) * step, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {ordered.map((m, i) => (
            <Slide key={m.id} m={m} i={i} active={i === index} onFocus={() => goTo(i)} />
          ))}
        </motion.div>
      </div>

      {/* progress */}
      <div className="gutter mx-auto mt-6 flex max-w-[100rem] items-center gap-4">
        <span className="label tabular-nums text-fg-3">
          {String(index + 1).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
        </span>
        <div className="relative h-px flex-1 bg-line-1">
          <motion.span className="absolute inset-y-0 left-0 bg-accent" animate={{ width: `${((index + 1) / ordered.length) * 100}%` }} transition={{ duration: 0.5, ease: ease.outExpo }} />
        </div>
      </div>
    </section>
  );
}

function Slide({ m, i, active, onFocus }: { m: Milestone; i: number; active: boolean; onFocus: () => void }) {
  return (
    <motion.article
      className="xp-slide relative w-[86vw] shrink-0 select-none sm:w-[72vw] lg:w-[min(64vw,60rem)]"
      animate={{ scale: active ? 1 : 0.94, opacity: active ? 1 : 0.55 }}
      transition={{ duration: 0.6, ease: ease.outExpo }}
      aria-label={`${m.org} — ${m.role}`}
      onFocus={onFocus}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border bg-[#101013]/95 backdrop-blur-2xl transition-[border-color,box-shadow] duration-[var(--duration-cinematic)]",
          active ? "border-accent/25 [box-shadow:0_1px_0_rgba(255,255,255,0.07)_inset,0_40px_100px_-30px_rgba(233,162,59,0.25),0_30px_80px_-30px_rgba(0,0,0,0.9)]" : "border-line-1 [box-shadow:var(--shadow-soft)]",
        )}
      >
        <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.10] blur-[90px]" />
        <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none text-[clamp(7rem,14vw,13rem)] font-semibold leading-none tracking-[-0.06em] text-fg-1/[0.045]">
          {String(i + 1).padStart(2, "0")}
        </span>

        <div className="relative grid grid-cols-12 gap-x-6 gap-y-8 p-6 sm:p-8 lg:p-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line-2 bg-gradient-to-br from-fg-1/[0.10] to-transparent text-[22px] font-semibold text-fg-1">{m.org[0]}</span>
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
            </div>
            <h3 className="text-h2 mt-6 break-words text-fg-1">{m.org}</h3>
            <p className="mt-3 text-lead text-fg-2">
              {m.role}
              {m.location && <span className="block text-[15px] text-fg-3">{m.location}</span>}
            </p>
            {m.link && (
              <a href={m.link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm text-fg-2 transition-colors hover:text-fg-1" draggable={false}>
                <span className="link-underline">{m.kind === "build" ? "On GitHub" : "About the company"}</span> <ArrowUpRight />
              </a>
            )}
          </div>

          <div className="col-span-12 lg:col-span-5 lg:border-l lg:border-line-1 lg:pl-8">
            <p className="max-w-[60ch] text-[15.5px] leading-relaxed text-fg-2">{m.summary}</p>
            {m.points.length > 0 && (
              <ul className="mt-6 grid gap-x-8 gap-y-3 text-sm text-fg-2">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-[9px] h-px w-3 shrink-0 bg-accent/70" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line-1 pt-6">
              {m.systems && (
                <p className="label flex flex-wrap gap-x-2 gap-y-1 text-fg-3">
                  {m.systems.map((s, j) => (
                    <span key={s} className="flex items-center gap-2">
                      {s}
                      {j < m.systems!.length - 1 && <span className="h-0.5 w-0.5 rounded-full bg-fg-3" aria-hidden />}
                    </span>
                  ))}
                </p>
              )}
              {m.technologies.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                  {m.technologies.map((t) => (
                    <li key={t} className="label rounded-full border border-line-1 bg-bg-1/60 px-2.5 py-1.5 text-fg-3">{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <CoverFor id={m.id} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
