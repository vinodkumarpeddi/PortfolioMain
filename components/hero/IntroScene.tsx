"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK, DESKTOP, MOBILE } from "@/lib/gsap";
import { projects } from "@/data/projects";
import { profile, type SectionId } from "@/data/profile";
import { SplitText as SplitReveal } from "@/components/ui/SplitText";
import { KineticText } from "@/components/ui/KineticText";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Section";
import { ArrowDown, ArrowRight, ArrowUpRight, GitHub } from "@/components/ui/Icons";
import { setSectionOverride } from "@/components/providers/ScrollState";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { HeroState } from "@/components/three/HeroObject";
import { ProductVisual } from "@/components/visuals/ProductVisual";
import { cn } from "@/lib/utils";

const project = projects[0];
const heroStack = ["Node.js", "TypeScript", "PostgreSQL", "Redis", "RabbitMQ", "React", "Next.js", "Docker"];

export function IntroScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const coreWrapRef = useRef<HTMLDivElement>(null);
  const heroState = useRef<HeroState>({ spread: 0, opacity: 1 });
  /* the city is faded out well before the pin releases, and an invisible WebGL scene costs the
     same as a visible one — right where the project reveal needs the frames */
  const [coreLive, setCoreLive] = useState(true);
  const coreLiveRef = useRef(true);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const coreWrap = coreWrapRef.current;
      if (!pin || !coreWrap) return;

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
          .fromTo(q("[data-grid]"), { clipPath: "inset(0 100% 100% 0)" }, { clipPath: "inset(0 0% 0% 0)", duration: 1.8, ease: "power3.inOut" }, 0);
        return () => intro.kill();
      });

      // ---- scroll choreography ----
      mm.add({ motion: MOTION_OK, desktop: DESKTOP, mobile: MOBILE }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; mobile: boolean; motion: boolean };
        if (!motion) return;

        const titleSplit = SplitText.create(q(".proj-title"), { type: "words", mask: "words", aria: "auto" });
        const chips = q(".proj-chip");
        heroState.current.spread = 0;
        heroState.current.opacity = 1;

        gsap.set(q(".proj-layer"), { autoAlpha: 0 });
        gsap.set(q(".proj-visual"), { autoAlpha: 0, y: 90, scale: 0.9, rotateX: 10, transformPerspective: 1400, transformOrigin: "50% 100%" });
        gsap.set(q(".proj-head"), { autoAlpha: 0, y: 12 });
        gsap.set(titleSplit.words, { yPercent: 110 });
        gsap.set(q(".proj-tagline, .proj-links"), { autoAlpha: 0, y: 14 });
        gsap.set(q(".stage-tech"), { autoAlpha: 0, y: 10 });
        gsap.set(q(".proj-chips-m"), { autoAlpha: 0, y: 10 });
        gsap.set(q(".stage-challenge, .stage-solution"), { autoAlpha: 0, y: 16 });
        gsap.set(chips, { opacity: 0.45 });

        /* The scroll position arrives in native touch-sized steps on phones, so a hard scrub
           replays every one of them; a small catch-up smooths them into one move. */
        let section: SectionId | null = null;
        const track = (self: ScrollTrigger) => {
          const next = self.isActive ? (self.progress > 0.4 ? "work" : "intro") : null;
          if (next !== section) {
            section = next;
            setSectionOverride(next);
          }
          /* the fade of .core-wrap completes at unit 2.8 of 10 */
          const live = self.progress < 0.32;
          if (live !== coreLiveRef.current) {
            coreLiveRef.current = live;
            setCoreLive(live);
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => "+=" + pin.offsetHeight * (desktop ? 4.7 : 2.1),
            pin: true,
            scrub: desktop ? 0.7 : 0.6,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            onUpdate: track,
            onRefresh: track,
            onLeave: track,
            onLeaveBack: track,
          },
        });

        // 0 → 10 units
        tl.to(q("[data-grid]"), { y: -120, duration: 10, ease: "none" }, 0)
          .to(heroState.current, { spread: 1, duration: 2.4, ease: "power2.inOut" }, 0.3)
          .to(coreWrap, { y: -80, scale: 1.08, duration: 2.6, ease: "power1.inOut" }, 0.3)
          .to(heroState.current, { opacity: 0, duration: 1.4, ease: "power2.in" }, 1.4)
          .to(coreWrap, { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" }, 1.6)
          .to(q(".hero-bottom, .hero-scrim"), { autoAlpha: 0, y: 10, duration: 0.6 }, 0.8)
          .to(q(".hero-copy"), { yPercent: -14, scale: 0.92, autoAlpha: 0, transformOrigin: "0% 0%", duration: 1.5, ease: "power2.inOut" }, 1.0)
          .set(q(".proj-layer"), { autoAlpha: 1 }, 1.9)
          .to(q(".proj-visual"), { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: 1.6, ease: "power2.out" }, 2.0)
          .to(q(".proj-head"), { autoAlpha: 1, y: 0, duration: 0.7 }, 3.2)
          .to(titleSplit.words, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "power2.out" }, 3.4)
          .to(q(".proj-tagline, .proj-links"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15 }, 4.1);

        if (desktop) {
          tl.to(q(".stage-tech"), { autoAlpha: 1, y: 0, duration: 0.6 }, 4.4)
            .to(chips, { opacity: 1, duration: 0.25, stagger: 0.16 }, 4.8)
            .to(q(".stage-tech"), { autoAlpha: 0, y: -10, duration: 0.4 }, 6.3)
            .to(q(".stage-challenge"), { autoAlpha: 1, y: 0, duration: 0.6 }, 6.75)
            .to(q(".stage-challenge"), { autoAlpha: 0, y: -10, duration: 0.4 }, 7.9)
            .to(q(".stage-solution"), { autoAlpha: 1, y: 0, duration: 0.6 }, 8.35)
            .to({}, { duration: 1.2 }, 8.8);
        } else {
          tl.to(q(".proj-chips-m"), { autoAlpha: 1, y: 0, duration: 0.6 }, 4.4)
            .to(q(".stage-challenge"), { autoAlpha: 1, y: 0, duration: 0.6 }, 5.0)
            .to(q(".stage-challenge"), { autoAlpha: 0, y: -10, duration: 0.4 }, 6.6)
            .to(q(".stage-solution"), { autoAlpha: 1, y: 0, duration: 0.6 }, 7.05)
            .to({}, { duration: 1.5 }, 8.5);
        }

        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        return () => {
          titleSplit.revert();
          setSectionOverride(null);
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="intro" ref={sectionRef} data-section="intro" className="relative" aria-labelledby="hero-title">
      <div
        ref={pinRef}
        className="relative h-[100svh] min-h-[34rem] overflow-hidden pb-[env(safe-area-inset-bottom)] motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:overflow-visible"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(70%_60%_at_60%_40%,black,transparent)]">
          <div data-grid className="grid-bg absolute inset-x-0 -bottom-[160px] top-0" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-[10%] top-[5%] hidden h-[70svh] w-[60vw] rounded-full bg-accent/[0.07] blur-[140px] lg:block" />

        {/* 3D OBJECT (hero state) */}
        <div ref={coreWrapRef} className="core-wrap absolute inset-0 z-0 motion-reduce:hidden">
          <HeroCanvas stateRef={heroState} scene="voxel" paused={!coreLive} className="absolute inset-0" />
        </div>

        {/* HERO LAYER */}
        <div className="hero-layer pointer-events-none absolute inset-0 z-10 flex flex-col motion-reduce:relative motion-reduce:min-h-[100svh]">
          <div aria-hidden className="hero-scrim pointer-events-none absolute inset-x-0 top-0 h-[64%] bg-gradient-to-b from-bg-0 via-bg-0/80 to-transparent lg:hidden" />
          <div className="gutter mx-auto grid w-full max-w-[100rem] flex-1 grid-cols-12 gap-x-6 pt-24 sm:pt-28 lg:items-center lg:pt-24">
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

              <h1 id="hero-title" className="sheen text-display mt-7 uppercase text-fg-1 lg:mt-9">
                <span className="block">
                  <SplitReveal immediate by="lines" delay={0.1}>
                    <KineticText text="Systems" />
                  </SplitReveal>
                </span>
                <span className="block text-fg-2">
                  <SplitReveal immediate by="lines" delay={0.22}>
                    <KineticText text="that" />
                  </SplitReveal>
                </span>
                <span className="block">
                  <SplitReveal immediate by="lines" delay={0.34}>
                    <KineticText text="hold." accentLast />
                  </SplitReveal>
                </span>
              </h1>

              <p className="hero-lead text-lead mt-6 max-w-[46ch] text-balance text-fg-2 max-sm:text-[16px] max-sm:leading-[1.55] sm:mt-7 lg:mt-9">
                Software engineer building full-stack products and the backend systems behind them — queues, ledgers,
                access control — designed to stay correct under load, failure and time.
              </p>

              <div className="hero-cta mt-7 flex flex-wrap items-center gap-3 sm:mt-8 lg:mt-10">
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
            <ul className="label hidden flex-wrap items-center gap-x-3 gap-y-1 text-fg-3 sm:flex" aria-label="Core stack">
              {heroStack.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span>{s}</span>
                  {i < heroStack.length - 1 && <span className="h-0.5 w-0.5 rounded-full bg-fg-3" aria-hidden />}
                </li>
              ))}
            </ul>
            <a href="#work" className="label ml-auto inline-flex min-h-11 items-center gap-2 text-fg-3 transition-colors hover:text-fg-1 sm:ml-0">
              Scroll
              <ArrowDown className="animate-[bob_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
            </a>
          </div>
        </div>

        {/* PROJECT 01 LAYER */}
        <div className="proj-layer gutter absolute inset-0 z-20 mx-auto flex max-w-[100rem] flex-col pb-6 pt-24 motion-safe:invisible motion-safe:opacity-0 motion-reduce:relative motion-reduce:pt-0 lg:justify-between lg:pb-9">
          <div className="proj-head flex items-center justify-between gap-4">
            <SectionLabel index={project.number}>Selected work</SectionLabel>
            <span className="label hidden text-fg-3 sm:block">{project.category}</span>
          </div>

          <div className="proj-visual pointer-events-auto relative mt-5 w-full lg:absolute lg:right-[var(--spacing-gutter)] lg:top-[6.5rem] lg:mt-0 lg:w-[min(46vw,40rem)] motion-reduce:relative motion-reduce:right-auto motion-reduce:top-auto motion-reduce:my-10 motion-reduce:w-full">
            <ProductVisual project={project} priority bleed={false} />
          </div>

          <ul className="proj-chips-m mt-4 flex flex-wrap gap-2 lg:hidden [@media(max-height:720px)]:hidden" aria-label="Technologies">
            {project.technologies.map((t) => (
              <li key={t} className="label rounded-full border border-line-2 px-3 py-2 text-[10.5px] text-fg-1">
                {t}
              </li>
            ))}
          </ul>

          <div className="pointer-events-none relative mt-3 min-h-[8.5rem] flex-1 lg:hidden">
            <StagePanel className="stage-challenge" index="A" label="Challenge" title={project.challenge!.title} body={project.challenge!.body} compact />
            <StagePanel className="stage-solution" index="B" label="Solution" title={project.solution!.title} body={project.solution!.body} compact />
          </div>

          <div className="pointer-events-auto grid grid-cols-12 items-end gap-x-6 gap-y-6">
            <div className="col-span-12 lg:col-span-6">
              <h2 className="proj-title text-h1 text-fg-1">{project.title}</h2>
              <p className="proj-tagline text-lead mt-3 max-w-[50ch] text-balance text-fg-2 lg:mt-4">{project.tagline}</p>
              <div className="proj-links mt-5 flex flex-wrap items-center gap-3 lg:mt-6">
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

            <div className="hidden lg:col-span-6 lg:block">
              <div className="relative min-h-[9.5rem]">
                <ul className="stage-tech absolute inset-x-0 bottom-0 flex flex-wrap justify-end gap-2" aria-label="Technologies">
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

function StagePanel({ className, index, label, title, body, compact }: { className: string; index: string; label: string; title: string; body: string; compact?: boolean }) {
  return (
    <div className={cn("absolute inset-x-0 bottom-0 rounded-2xl border border-line-1 bg-bg-1/95 lg:ml-auto lg:max-w-[26rem]", compact ? "p-3.5" : "p-5", className)}>
      <div className="label flex items-center gap-3 text-fg-3">
        <span className="text-accent">{index}</span>
        <span>{label}</span>
      </div>
      <p className={cn("mt-2 font-medium text-fg-1", compact ? "text-[13.5px]" : "mt-3 text-[15px]")}>{title}</p>
      <p className={cn("mt-1 leading-relaxed text-fg-2", compact ? "line-clamp-3 text-[12px]" : "mt-1.5 text-sm")}>{body}</p>
    </div>
  );
}
