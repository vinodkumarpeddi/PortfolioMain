"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { milestones, type Milestone } from "@/data/experience";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const kindLabel: Record<Milestone["kind"], string> = { work: "Experience", education: "Education", build: "Systems work" };
const ordered = [...milestones].reverse(); // now → 2022
const STEP = 42; // degrees between cards on the ring

/**
 * Cinematic 3D timeline. Cards sit on a ring in 3D space; scrolling rotates
 * the ring so each milestone comes forward in turn. Below the desktop
 * breakpoint the same cards render as a stacked list.
 */
export function ExperienceTimeline() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        const ring = q(".xp-ring")[0];
        const cards = q(".xp-card") as HTMLElement[];
        const yearEl = q(".xp-year")[0];
        const idxEl = q(".xp-index")[0];
        const bar = q(".xp-bar")[0];
        const n = cards.length;
        const radius = () => Math.min(el.clientWidth * 0.5, 720);

        cards.forEach((c, i) => {
          gsap.set(c, { rotateY: -i * STEP, transformOrigin: "50% 50%", z: 0 });
          gsap.set(c, { transform: `translate(-50%, -50%) rotateY(${-i * STEP}deg) translateZ(${radius()}px)` });
        });

        const setters = cards.map((c) => ({
          op: gsap.quickSetter(c, "opacity"),
          blur: gsap.quickSetter(c, "filter"),
        }));

        const update = (angle: number) => {
          cards.forEach((c, i) => {
            const delta = Math.abs(((angle - i * STEP + 540) % 360) - 180); // angular distance from front
            const t = Math.min(1, delta / (STEP * 1.6));
            setters[i].op(1 - t * 0.75);
            setters[i].blur(`blur(${(t * 5).toFixed(2)}px)`);
            c.classList.toggle("is-front", delta < STEP / 2);
          });
          const idx = Math.min(n - 1, Math.max(0, Math.round(angle / STEP)));
          if (yearEl) yearEl.textContent = cards[idx]?.dataset.year ?? "";
          if (idxEl) idxEl.textContent = String(idx + 1).padStart(2, "0");
        };

        const state = { angle: 0 };
        gsap.set(ring, { z: -radius(), rotateY: 0 });
        update(0);
        gsap.timeline({
          scrollTrigger: {
            trigger: q(".xp-stage")[0],
            start: "top top",
            end: `+=${n * 80}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, ease: "power2.inOut", delay: 0.05 },
            onRefresh: () => {
              cards.forEach((c, i) => gsap.set(c, { transform: `translate(-50%, -50%) rotateY(${-i * STEP}deg) translateZ(${radius()}px)` }));
              gsap.set(ring, { z: -radius(), rotateY: state.angle });
            },
          },
        })
          .to(state, {
            angle: (n - 1) * STEP,
            ease: "none",
            onUpdate: () => {
              gsap.set(ring, { z: -radius(), rotateY: state.angle });
              update(state.angle);
            },
          }, 0)
          .fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      });

      mm.add(`${MOTION_OK} and (max-width: 1023px)`, () => {
        gsap.from(q(".xp-card"), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: q(".xp-stage")[0], start: "top 80%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="experience" ref={ref} data-section="experience" className="relative" aria-labelledby="exp-title">
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
            <span>Scroll to travel back</span>
            <span className="h-px w-16 bg-line-2" />
            <span className="text-fg-2">now → 2022</span>
          </Reveal>
        </div>
      </div>

      <div className="xp-stage relative mt-10 lg:h-[100svh] lg:overflow-hidden">
        {/* year + index (desktop) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-8 hidden items-start justify-between px-[var(--spacing-gutter)] lg:flex">
          <span className="label text-fg-3">
            <span className="xp-index text-fg-1">01</span> / {String(ordered.length).padStart(2, "0")}
          </span>
          <span className="xp-year text-display select-none text-fg-1/[0.06]">{ordered[0].start.slice(0, 4)}</span>
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[60vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[130px] lg:block" />

        {/* 3D ring (desktop) / stack (mobile) */}
        <div className="relative flex flex-col gap-6 px-[var(--spacing-gutter)] py-6 lg:h-full lg:py-0 lg:[perspective:1800px]">
          <div className="xp-ring relative flex flex-col gap-6 lg:absolute lg:left-1/2 lg:top-1/2 lg:h-0 lg:w-0 lg:[transform-style:preserve-3d]">
            {ordered.map((m, i) => (
              <MilestoneCard key={m.id} m={m} index={i} />
            ))}
          </div>
        </div>

        {/* progress (desktop) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[var(--spacing-gutter)] bottom-8 hidden h-px bg-line-1 lg:block">
          <span className="xp-bar block h-full w-full origin-left bg-accent/80" />
        </div>
      </div>
    </section>
  );
}

function MilestoneCard({ m, index }: { m: Milestone; index: number }) {
  return (
    <article
      data-year={m.start.slice(0, 4)}
      className={cn(
        "xp-card group relative w-full lg:absolute lg:left-0 lg:top-0 lg:w-[min(40vw,36rem)] lg:[backface-visibility:hidden]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-line-1 bg-bg-2/70 p-6 backdrop-blur-2xl transition-[border-color,box-shadow] duration-[var(--duration-cinematic)] sm:p-7",
          "[box-shadow:var(--shadow-soft)] group-[.is-front]:border-accent/30 group-[.is-front]:[box-shadow:0_1px_0_rgba(255,255,255,0.07)_inset,0_40px_100px_-30px_rgba(233,162,59,0.28),0_30px_80px_-30px_rgba(0,0,0,0.8)]",
        )}
      >
        <span aria-hidden className="pointer-events-none absolute -right-6 -top-10 select-none text-[9rem] font-semibold leading-none tracking-[-0.06em] text-fg-1/[0.045]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-accent/[0.12] blur-[80px] opacity-0 transition-opacity duration-[var(--duration-cinematic)] group-[.is-front]:opacity-100" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line-2 bg-gradient-to-br from-fg-1/[0.08] to-transparent text-[18px] font-semibold text-fg-1">
              {m.org[0]}
            </span>
            <div className="label flex flex-wrap items-center justify-end gap-2 text-fg-3">
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
          <h3 className="text-h2 mt-5 text-fg-1">{m.org}</h3>
          <p className="mt-2 text-[15px] text-fg-2">
            {m.role}
            {m.location && <span className="text-fg-3"> · {m.location}</span>}
          </p>
          <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed text-fg-2">{m.summary}</p>
          {m.points.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-line-1 pt-4 text-[13.5px] text-fg-2">
              {m.points.slice(0, 3).map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-accent/70" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            {m.technologies.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                {m.technologies.slice(0, 7).map((t) => (
                  <li key={t} className="label rounded-full border border-line-1 bg-bg-1/60 px-2.5 py-1.5 text-fg-3">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {m.link && (
              <a href={m.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-fg-2 transition-colors hover:text-fg-1">
                <span className="link-underline">{m.kind === "build" ? "On GitHub" : "About the company"}</span> <ArrowUpRight />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
