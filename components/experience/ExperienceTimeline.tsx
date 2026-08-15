"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { milestones, type Milestone } from "@/data/experience";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const kindLabel: Record<Milestone["kind"], string> = { work: "Experience", education: "Education", build: "Systems work" };

export function ExperienceTimeline() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear] = useState(milestones[0].start.slice(0, 4));

  useGSAP(
    () => {
      const el = ref.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".ms-card", track);
        const stage = q(".stage")[0];
        const distance = () => track.scrollWidth - stage.clientWidth;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance(), ease: "none" }, 0);
        tl.fromTo(q(".ms-line-fill"), { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);

        cards.forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            containerAnimation: tl,
            start: "left 62%",
            end: "right 38%",
            onToggle: (self) => {
              card.classList.toggle("is-active", self.isActive);
              if (self.isActive) setActiveYear(card.dataset.year ?? "");
            },
          });
        });
        cards[0]?.classList.add("is-active");
      });

      mm.add(`${MOTION_OK} and (max-width: 1023px)`, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".ms-card", track);
        cards.forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) => {
              card.classList.toggle("is-active", self.isActive);
              if (self.isActive) setActiveYear(card.dataset.year ?? "");
            },
          });
        });
        gsap.fromTo(q(".ms-line-fill"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: track, start: "top 60%", end: "bottom 60%", scrub: true } });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="experience" ref={ref} data-section="experience" className="relative" aria-labelledby="exp-title">
      <div className="gutter mx-auto max-w-[100rem] pt-[var(--spacing-section)]">
        <Reveal>
          <SectionLabel index="03">Engineering experience</SectionLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-12 gap-x-6 gap-y-6">
          <h2 id="exp-title" className="text-h1 col-span-12 max-w-[14ch] text-fg-1 lg:col-span-7">
            <SplitText by="words">Where the work happened.</SplitText>
          </h2>
          <Reveal delay={0.15} className="col-span-12 lg:col-span-5 lg:pt-3">
            <p className="max-w-[46ch] text-lead text-fg-2">
              Now a software engineer at EverUptime. Before that: an internship building full-stack products, another engineering
              workflows and access control on ServiceNow, and a parallel run of systems built to production shape.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="stage relative mt-12 lg:h-[100svh] lg:overflow-hidden">
        {/* giant ghost year */}
        <div aria-hidden className="pointer-events-none absolute right-[var(--spacing-gutter)] top-6 hidden select-none lg:block">
          <span key={activeYear} className="text-display block text-fg-1/[0.05] [animation:fade-in_600ms_var(--ease-out-expo)]">
            {activeYear}
          </span>
        </div>
        {/* playhead */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[38%] hidden w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent lg:block" />

        <div className="lg:flex lg:h-full lg:items-center">
          <div ref={trackRef} className="relative flex flex-col gap-10 px-[var(--spacing-gutter)] py-6 lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:py-0 lg:pl-[38vw] lg:pr-[40vw]">
            {/* line */}
            <div aria-hidden className="absolute left-[calc(var(--spacing-gutter)+7px)] top-0 h-full w-px bg-line-1 lg:left-0 lg:top-[3.25rem] lg:h-px lg:w-full">
              <div className="ms-line-fill h-full w-full origin-top bg-accent/70 lg:origin-left" />
            </div>
            {milestones.map((m, i) => (
              <MilestoneCard key={m.id} m={m} index={i} />
            ))}
          </div>
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
        "ms-card group relative shrink-0 pl-10 transition-[opacity,transform] duration-[var(--duration-cinematic)] ease-[var(--ease-out-expo)] lg:w-[min(38vw,34rem)] lg:pl-0 lg:pt-16",
        "opacity-45 lg:scale-[0.96] [&.is-active]:opacity-100 [&.is-active]:lg:scale-100",
      )}
    >
      {/* marker */}
      <span aria-hidden className="absolute left-0 top-1 grid h-4 w-4 place-items-center lg:left-0 lg:top-[3.25rem] lg:-translate-y-1/2">
        <span className="absolute inset-0 rounded-full border border-accent/40 opacity-0 transition-opacity group-[.is-active]:opacity-100" />
        <span className="h-1.5 w-1.5 rounded-full bg-fg-3 transition-colors group-[.is-active]:bg-accent" />
      </span>
      <div className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-3">
        <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
        <span>{kindLabel[m.kind]}</span>
        <span className="h-3 w-px bg-line-2" />
        <span className="text-fg-2">{m.period}</span>
        {!m.end && (
          <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-success/40 px-2 py-1 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Now
          </span>
        )}
      </div>
      <h3 className="text-h3 mt-4 text-fg-1">{m.org}</h3>
      <p className="mt-1 text-sm text-fg-2">
        {m.role}
        {m.location && <span className="text-fg-3"> · {m.location}</span>}
      </p>
      <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-fg-2">{m.summary}</p>
      <ul className="mt-4 space-y-2 text-sm text-fg-2">
        {m.points.map((p) => (
          <li key={p} className="flex gap-3">
            <span className="mt-[9px] h-px w-3 shrink-0 bg-line-2" aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {m.systems && (
        <p className="label mt-5 text-fg-3">
          {m.systems.map((s, i) => (
            <span key={s}>
              {s}
              {i < m.systems!.length - 1 && <span className="mx-2 text-line-2">·</span>}
            </span>
          ))}
        </p>
      )}
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
        {m.technologies.map((t) => (
          <li key={t} className="label rounded-full border border-line-1 px-2.5 py-1.5 text-fg-3">
            {t}
          </li>
        ))}
      </ul>
      {m.link && (
        <a href={m.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm text-fg-2 transition-colors hover:text-fg-1">
          <span className="link-underline">On GitHub</span> <ArrowUpRight />
        </a>
      )}
    </article>
  );
}
