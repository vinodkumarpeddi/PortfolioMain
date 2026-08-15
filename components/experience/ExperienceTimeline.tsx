"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { milestones, type Milestone } from "@/data/experience";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { Tilt } from "@/components/visuals/Tilt";

const kindLabel: Record<Milestone["kind"], string> = { work: "Experience", education: "Education", build: "Systems work" };
const ordered = [...milestones].reverse(); // now → 2022

/**
 * Sticky card deck: each milestone is a full-width glass card that sticks
 * near the top; the next one slides over it while the previous recedes
 * (scale, dim, blur). Native sticky, so it works the same on phones.
 */
export function ExperienceTimeline() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = q(".xp-card") as HTMLElement[];
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          const inner = card.querySelector(".xp-inner");
          // entrance
          gsap.from(card.querySelectorAll(".xp-reveal"), {
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: { trigger: card, start: "top 78%", once: true },
          });
          if (!next || !inner) return;
          // recede while the next card slides over
          gsap.to(inner, {
            scale: 0.94,
            opacity: 0.35,
            filter: "blur(4px)",
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 90%", end: "top 20%", scrub: true },
          });
        });
        gsap.fromTo(q(".xp-progress"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: q(".xp-deck")[0], start: "top 60%", end: "bottom 90%", scrub: true } });
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
            <span>now</span>
            <span className="relative h-px w-24 bg-line-2">
              <span className="xp-progress absolute inset-0 origin-left bg-accent" />
            </span>
            <span className="text-fg-2">2022</span>
          </Reveal>
        </div>

        <div className="xp-deck relative mt-14 pb-[10vh]">
          {ordered.map((m, i) => (
            <MilestoneCard key={m.id} m={m} index={i} total={ordered.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MilestoneCard({ m, index, total }: { m: Milestone; index: number; total: number }) {
  return (
    <article
      className="xp-card sticky top-[5.5rem] mb-[6vh] lg:top-[6.5rem]"
      style={{ zIndex: index + 1, paddingBottom: index === total - 1 ? 0 : undefined }}
      aria-label={`${m.org} — ${m.role}`}
    >
      <div
        className={cn(
          "xp-inner relative overflow-hidden rounded-[28px] border border-line-1 bg-[#101013]/95 backdrop-blur-2xl [box-shadow:0_1px_0_rgba(255,255,255,0.06)_inset,0_-30px_80px_-40px_rgba(0,0,0,0.9),0_40px_100px_-30px_rgba(0,0,0,0.9)]",
        )}
      >
        {/* glow + numeral */}
        <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.10] blur-[90px]" />
        <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none text-[clamp(7rem,14vw,13rem)] font-semibold leading-none tracking-[-0.06em] text-fg-1/[0.045]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <Tilt max={2} className="group/tilt">
        <div className="relative grid grid-cols-12 gap-x-6 gap-y-8 p-6 sm:p-8 lg:p-10">
          {/* identity */}
          <div className="col-span-12 lg:col-span-5">
            <div className="xp-reveal flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line-2 bg-gradient-to-br from-fg-1/[0.10] to-transparent text-[22px] font-semibold text-fg-1">
                {m.org[0]}
              </span>
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
            <h3 className="xp-reveal text-h1 mt-6 text-fg-1">{m.org}</h3>
            <p className="xp-reveal mt-3 text-lead text-fg-2">
              {m.role}
              {m.location && <span className="block text-[15px] text-fg-3">{m.location}</span>}
            </p>
            {m.link && (
              <a href={m.link} target="_blank" rel="noopener noreferrer" className="xp-reveal mt-6 inline-flex items-center gap-1 text-sm text-fg-2 transition-colors hover:text-fg-1">
                <span className="link-underline">{m.kind === "build" ? "On GitHub" : "About the company"}</span> <ArrowUpRight />
              </a>
            )}
          </div>

          {/* detail */}
          <div className="col-span-12 lg:col-span-7 lg:border-l lg:border-line-1 lg:pl-10">
            <p className="xp-reveal max-w-[60ch] text-[15.5px] leading-relaxed text-fg-2">{m.summary}</p>
            {m.points.length > 0 && (
              <ul className="xp-reveal mt-6 grid gap-x-8 gap-y-3 text-sm text-fg-2 sm:grid-cols-2">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-[9px] h-px w-3 shrink-0 bg-accent/70" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="xp-reveal mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line-1 pt-6">
              {m.systems && (
                <p className="label flex flex-wrap gap-x-2 gap-y-1 text-fg-3">
                  {m.systems.map((s, i) => (
                    <span key={s} className="flex items-center gap-2">
                      {s}
                      {i < m.systems!.length - 1 && <span className="h-0.5 w-0.5 rounded-full bg-fg-3" aria-hidden />}
                    </span>
                  ))}
                </p>
              )}
              {m.technologies.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                  {m.technologies.map((t) => (
                    <li key={t} className="label rounded-full border border-line-1 bg-bg-1/60 px-2.5 py-1.5 text-fg-3">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        </Tilt>
      </div>
    </article>
  );
}
