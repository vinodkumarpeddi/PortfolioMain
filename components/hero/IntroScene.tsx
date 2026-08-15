"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK, DESKTOP, MOBILE } from "@/lib/gsap";
import { heroArchitecture, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { SystemViz } from "@/components/viz/SystemViz";
import { createVizAmbient, createVizReveal } from "@/components/viz/animate";
import { SplitText as SplitReveal } from "@/components/ui/SplitText";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Section";
import { ArrowDown, ArrowRight, ArrowUpRight, GitHub } from "@/components/ui/Icons";
import { setSectionOverride } from "@/components/providers/ScrollState";
import { CoreCanvas } from "@/components/three/CoreCanvas";
import type { CoreState } from "@/components/three/SystemCore";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const project = projects[0];
const heroStack = ["Node.js", "TypeScript", "PostgreSQL", "Redis", "RabbitMQ", "React", "Next.js", "Docker"];

export function IntroScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const vizWrapRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<SVGSVGElement>(null);
  const coreWrapRef = useRef<HTMLDivElement>(null);
  const coreState = useRef<CoreState>({ explode: 0, opacity: 1 });
  const isDesktop = useIsDesktop();

  useGSAP(
    () => {
      const pin = pinRef.current;
      const vizWrap = vizWrapRef.current;
      const svg = vizRef.current;
      const coreWrap = coreWrapRef.current;
      if (!pin || !vizWrap || !svg || !coreWrap) return;

      const q = gsap.utils.selector(pin);
      const mm = gsap.matchMedia();

      // ---- entrance (runs once on load, independent of scroll) ----
      mm.add(MOTION_OK, () => {
        const intro = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });
        intro
          .from(q(".hero-meta"), { opacity: 0, y: 12, duration: 0.9 }, 0.15)
          .from(q(".hero-lead"), { opacity: 0, y: 18, filter: "blur(6px)" }, 0.55)
          .from(q(".hero-cta"), { opacity: 0, y: 14 }, 0.75)
          .from(q(".hero-bottom > *"), { opacity: 0, y: 10, stagger: 0.08, duration: 0.8 }, 0.9)
          .from(q("[data-grid]"), { opacity: 0, duration: 1.6, ease: "power1.out" }, 0);
        return () => intro.kill();
      });

      // ---- ambient viz packets ----
      let killAmbient = () => {};
      mm.add(MOTION_OK, () => {
        killAmbient = createVizAmbient(svg, heroArchitecture, { speed: 90 });
        return () => killAmbient();
      });

      // ---- scroll choreography ----
      mm.add(
        { motion: MOTION_OK, desktop: DESKTOP, mobile: MOBILE },
        (ctx) => {
          const { desktop, motion } = ctx.conditions as { desktop: boolean; mobile: boolean; motion: boolean };
          if (!motion) return;
          const reveal = createVizReveal(svg, heroArchitecture, { restOpacity: 0.55 });
          reveal.progress(0);

          const titleSplit = SplitText.create(q(".proj-title"), { type: "words", mask: "words", aria: "auto" });
          const chips = q(".proj-chip");
          const mainLabels = svg.querySelectorAll(".viz-label-main");
          const altLabels = svg.querySelectorAll(".viz-label-alt");

          gsap.set(vizWrap, { opacity: 0, scale: 0.94, y: 24, transformOrigin: "50% 50%" });
          coreState.current.explode = 0;
          coreState.current.opacity = 1;
          gsap.set(q(".proj-layer"), { autoAlpha: 0 });
          gsap.set(q(".proj-head"), { autoAlpha: 0, y: 12 });
          gsap.set(titleSplit.words, { yPercent: 110 });
          gsap.set(q(".proj-tagline, .proj-links"), { autoAlpha: 0, y: 14 });
          gsap.set(q(".stage-tech"), { autoAlpha: 0, y: 10 });
          gsap.set(q(".stage-challenge, .stage-solution"), { autoAlpha: 0, y: 16 });
          gsap.set(chips, { opacity: 0.45 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: desktop ? "+=520%" : "+=420%",
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => setSectionOverride(self.progress > 0.42 ? "work" : "intro"),
              onLeave: () => setSectionOverride(null),
              onLeaveBack: () => setSectionOverride(null),
              onEnterBack: (self) => setSectionOverride(self.progress > 0.42 ? "work" : "intro"),
            },
          });

          // 0 → 10 units
          tl.to(q("[data-grid]"), { backgroundPositionY: -120, duration: 10, ease: "none" }, 0)
            .to(coreState.current, { explode: 1, duration: 2.4, ease: "power2.inOut" }, 0.5)
            .to(coreState.current, { opacity: 0, duration: 1.6, ease: "power2.in" }, 1.3)
            .to(coreWrap, { autoAlpha: 0, y: -40, duration: 1.4, ease: "power2.inOut" }, 1.5)
            .to(vizWrap, { opacity: 1, scale: 1, y: 0, duration: 1.6, ease: "power2.out" }, 1.4)
            .to(reveal, { progress: 1, duration: 2.6, ease: "none" }, 1.7)
            .to(q(".hero-bottom"), { autoAlpha: 0, y: 10, duration: 0.6 }, 1.9)
            .to(q(".hero-copy"), { yPercent: -18, scale: 0.9, autoAlpha: 0, transformOrigin: "0% 0%", duration: 1.6, ease: "power2.inOut" }, 2.4)
            .set(q(".proj-layer"), { autoAlpha: 1 }, 3.9)
            .to(mainLabels, { autoAlpha: 0, duration: 0.5, stagger: 0.06 }, 4.0)
            .to(altLabels, { autoAlpha: 1, duration: 0.5, stagger: 0.06 }, 4.15)
            .to(q(".proj-head"), { autoAlpha: 1, y: 0, duration: 0.7 }, 4.2)
            .to(titleSplit.words, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "power2.out" }, 4.5)
            .to(q(".proj-tagline, .proj-links"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15 }, 5.3);

          if (desktop) {
            tl.to(q(".stage-tech"), { autoAlpha: 1, y: 0, duration: 0.6 }, 5.7)
              .to(chips, { opacity: 1, duration: 0.25, stagger: 0.16 }, 6.1)
              .to(q(".stage-tech"), { autoAlpha: 0, y: -10, duration: 0.5 }, 7.5)
              .to(q(".stage-challenge"), { autoAlpha: 1, y: 0, duration: 0.7 }, 7.7)
              .to(q(".stage-challenge"), { autoAlpha: 0, y: -10, duration: 0.5 }, 8.7)
              .to(q(".stage-solution"), { autoAlpha: 1, y: 0, duration: 0.7 }, 8.9)
              .to({}, { duration: 1.1 }, 9.0);
          } else {
            tl.to(q(".stage-challenge"), { autoAlpha: 1, y: 0, duration: 0.7 }, 6.2)
              .to(q(".stage-challenge"), { autoAlpha: 0, y: -10, duration: 0.5 }, 7.6)
              .to(q(".stage-solution"), { autoAlpha: 1, y: 0, duration: 0.7 }, 7.8)
              .to({}, { duration: 1.2 }, 8.8);
          }

          const refresh = () => ScrollTrigger.refresh();
          document.fonts?.ready.then(refresh);

          return () => {
            titleSplit.revert();
            reveal.kill();
            setSectionOverride(null);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="intro" ref={sectionRef} data-section="intro" className="relative" aria-labelledby="hero-title">
      <div
        ref={pinRef}
        className="relative h-[100svh] min-h-[640px] overflow-hidden motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:overflow-visible"
      >
        <div
          data-grid
          aria-hidden
          className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_60%_40%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10%] top-[10%] h-[60vh] w-[60vw] rounded-full bg-accent/[0.06] blur-[120px]"
        />

        {/* HERO LAYER */}
        <div className="hero-layer pointer-events-none absolute inset-0 z-10 flex flex-col motion-reduce:relative motion-reduce:min-h-[100svh]">
          <div className="gutter mx-auto grid w-full max-w-[100rem] flex-1 grid-cols-12 gap-x-6 pt-28 lg:items-center lg:pt-24">
            <div className="hero-copy pointer-events-auto relative z-10 col-span-12 lg:col-span-7">
              <div className="hero-meta label flex flex-wrap items-center gap-x-4 gap-y-2 text-fg-3">
                <span className="inline-flex items-center gap-2 text-fg-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  {profile.role} · {profile.company}
                </span>
                <span className="hidden h-3 w-px bg-line-2 sm:block" aria-hidden />
                <span>{profile.focus}</span>
                <span className="hidden h-3 w-px bg-line-2 md:block" aria-hidden />
                <span className="hidden md:inline">{profile.location}</span>
              </div>

              <h1 id="hero-title" className="text-display mt-7 uppercase text-fg-1 lg:mt-9">
                <span className="block">
                  <SplitReveal immediate by="chars" delay={0.1} stagger={0.028}>
                    Systems
                  </SplitReveal>
                </span>
                <span className="block text-fg-2">
                  <SplitReveal immediate by="chars" delay={0.24} stagger={0.028}>
                    that
                  </SplitReveal>
                </span>
                <span className="block">
                  <SplitReveal immediate by="chars" delay={0.36} stagger={0.028}>
                    hold<span className="text-accent">.</span>
                  </SplitReveal>
                </span>
              </h1>

              <p className="hero-lead text-lead mt-7 max-w-[46ch] text-balance text-fg-2 lg:mt-9">
                Software engineer building full-stack products and the backend systems behind them — queues, ledgers,
                access control — designed to stay correct under load, failure and time.
              </p>

              <div className="hero-cta mt-8 flex flex-wrap items-center gap-3 lg:mt-10">
                <Button href="#work" icon={<ArrowDown />} magnetic>
                  Selected work
                </Button>
                <Button href={profile.socials[0].href} variant="outline" icon={<ArrowUpRight />} cursor="GitHub ↗">
                  GitHub
                </Button>
              </div>
            </div>

          </div>

          <div className="hero-bottom gutter pointer-events-auto mx-auto flex w-full max-w-[100rem] flex-wrap items-end justify-between gap-4 pb-7 lg:pb-9">
            <ul className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-3" aria-label="Core stack">
              {heroStack.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span>{s}</span>
                  {i < heroStack.length - 1 && <span className="h-0.5 w-0.5 rounded-full bg-fg-3" aria-hidden />}
                </li>
              ))}
            </ul>
            <a href="#work" className="label hidden items-center gap-2 text-fg-3 transition-colors hover:text-fg-1 sm:inline-flex">
              Scroll
              <ArrowDown className="animate-[bob_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
            </a>
          </div>
        </div>

        {/* 3D SYSTEM CORE (hero state) */}
        <div
          ref={coreWrapRef}
          className="core-wrap absolute inset-y-0 right-0 z-0 w-full lg:w-[62vw] motion-reduce:hidden"
        >
          <CoreCanvas stateRef={coreState} compact={!isDesktop} className="absolute inset-0 opacity-70 lg:opacity-100" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--bg-current)] to-transparent lg:hidden" />
        </div>

        {/* SHARED VIZ */}
        <div
          ref={vizWrapRef}
          className="viz-wrap pointer-events-none absolute left-1/2 top-[44%] z-[5] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 opacity-0 lg:top-[41%] lg:w-[min(68vw,1120px)] motion-reduce:opacity-100 motion-reduce:relative motion-reduce:left-auto motion-reduce:top-auto motion-reduce:mx-auto motion-reduce:my-16 motion-reduce:translate-x-0 motion-reduce:translate-y-0"
        >
          <SystemViz
            ref={vizRef}
            id="hero-viz"
            architecture={heroArchitecture}
            altLabels={project.architecture!.nodes.map((n) => ({ label: n.label, sub: n.sub }))}
            title="System architecture visualisation"
            desc="Client, API, services, queue, workers, database and infrastructure connected by data flow; morphs into the Payment Orchestrator architecture."
          />
        </div>

        {/* PROJECT 01 LAYER */}
        <div className="proj-layer gutter absolute inset-0 z-20 mx-auto flex max-w-[100rem] flex-col justify-between pb-7 pt-24 motion-safe:invisible motion-safe:opacity-0 motion-reduce:relative motion-reduce:pt-0 lg:pb-9">
          <div className="proj-head flex items-center justify-between gap-4">
            <SectionLabel index={project.number}>Selected work</SectionLabel>
            <span className="label hidden text-fg-3 sm:block">{project.category}</span>
          </div>

          <div className="pointer-events-auto grid grid-cols-12 items-end gap-x-6 gap-y-6">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="proj-title text-h1 text-fg-1">{project.title}</h2>
              <p className="proj-tagline text-lead mt-4 max-w-[50ch] text-balance text-fg-2">{project.tagline}</p>
              <div className="proj-links mt-6 flex flex-wrap items-center gap-3">
                <Button href={`/work/${project.slug}`} icon={<ArrowRight />} cursor="Case study">
                  Read the case study
                </Button>
                {project.github && (
                  <Button href={project.github} variant="outline" icon={<GitHub />} cursor="GitHub ↗">
                    Source
                  </Button>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <div className="relative min-h-[8.5rem] lg:min-h-[9.5rem]">
                <ul className="stage-tech absolute inset-x-0 bottom-0 hidden flex-wrap justify-end gap-2 lg:flex" aria-label="Technologies">
                  {project.technologies.map((t) => (
                    <li key={t} className="proj-chip label rounded-full border border-line-2 px-3 py-2 text-fg-1 transition-colors">
                      {t}
                    </li>
                  ))}
                </ul>
                <StagePanel className="stage-challenge" index="A" label="Challenge" title={project.challenge!.title} body={project.challenge!.body} />
                <StagePanel className="stage-solution" index="B" label="Solution" title={project.solution!.title} body={project.solution!.body} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Link href={`/work/${project.slug}`} className="sr-only">
        Payment Orchestrator case study
      </Link>
    </section>
  );
}

function StagePanel({ className, index, label, title, body }: { className: string; index: string; label: string; title: string; body: string }) {
  return (
    <div className={cn("absolute inset-x-0 bottom-0 rounded-2xl border border-line-1 bg-bg-2/70 p-5 backdrop-blur-md lg:ml-auto lg:max-w-[26rem]", className)}>
      <div className="label flex items-center gap-3 text-fg-3">
        <span className="text-accent">{index}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-[15px] font-medium text-fg-1">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{body}</p>
    </div>
  );
}
