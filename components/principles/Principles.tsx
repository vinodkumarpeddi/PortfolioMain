"use client";

import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, SplitText, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { principles } from "@/data/principles";
import { SectionLabel } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

/**
 * "How I think": a pinned typographic sequence. Each principle arrives as
 * letters that spread apart, holds with its line + proof, then drifts out.
 */
export function Principles() {
  const ref = useRef<HTMLElement>(null);
  const stRef = useRef<{ start: number; end: number } | null>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const lenis = useLenis();

  // phones: the chapter chips jump the pinned timeline to a principle. The pin spacer's
  // geometry is the fallback for when the ScrollTrigger has not been created yet.
  const jump = (i: number) => {
    const st = stRef.current;
    const el = ref.current;
    let start = st?.start;
    let end = st?.end;
    if ((start === undefined || end === undefined) && el) {
      start = el.getBoundingClientRect().top + window.scrollY;
      end = start + Math.max(0, el.offsetHeight - window.innerHeight);
    }
    if (start === undefined || end === undefined) return;
    const y = start + (end - start) * ((i + 0.5) / principles.length);
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add({ motionOk: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motionOk) return;
        const desktop = Boolean(ctx.conditions?.desktop);
        const items = q(".pr-item");
        const counter = q(".pr-index")[0];
        const splits = items.map((item) => SplitText.create(item.querySelector(".pr-word")!, { type: "chars", aria: "auto" }));

        gsap.set(items, { autoAlpha: 0 });
        gsap.set(q(".pr-glow"), { xPercent: -30 });

        const per = 3; // timeline units per principle
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".pr-stage")[0],
            start: "top top",
            end: `+=${principles.length * (desktop ? 90 : 70)}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            snap: { snapTo: 1 / (principles.length - 1), duration: { min: 0.15, max: 0.5 }, ease: "power2.inOut", delay: 0.05 },
            onUpdate: (self) => {
              const i = Math.min(principles.length - 1, Math.floor(self.progress * principles.length + 0.0001));
              if (counter) counter.textContent = String(i + 1).padStart(2, "0");
              if (indexRef.current !== i) {
                indexRef.current = i;
                setIndex(i);
              }
            },
          },
        });

        stRef.current = tl.scrollTrigger ?? null;

        items.forEach((item, i) => {
          const chars = splits[i].chars;
          const mid = (chars.length - 1) / 2;
          const meta = item.querySelectorAll(".pr-meta > *");
          const t = i * per;
          tl.set(item, { autoAlpha: 1 }, t)
            .fromTo(
              chars,
              { x: (idx: number) => (mid - idx) * (desktop ? 22 : 10), opacity: 0, ...(desktop ? { filter: "blur(10px)" } : null) },
              { x: 0, opacity: 1, ...(desktop ? { filter: "blur(0px)" } : null), duration: 1.1, ease: "power2.out", stagger: { each: 0.02, from: "center" } },
              t,
            )
            .fromTo(meta, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" }, t + 0.7)
            .to(q(".pr-glow"), { xPercent: -30 + (i / (principles.length - 1)) * 60, duration: per, ease: "none" }, t);
          if (i < principles.length - 1) {
            tl.to(chars, { x: (idx: number) => (idx - mid) * 16, opacity: 0, ...(desktop ? { filter: "blur(8px)" } : null), duration: 0.7, ease: "power2.in", stagger: { each: 0.015, from: "center" } }, t + per - 0.8)
              .to(meta, { y: -10, opacity: 0, duration: 0.4 }, t + per - 0.8)
              .set(item, { autoAlpha: 0 }, t + per);
          }
        });

        return () => splits.forEach((s) => s.revert());
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="mindset" ref={ref} data-section="mindset" className="relative" aria-labelledby="mind-title">
      <div className="pr-stage relative flex min-h-[100svh] flex-col overflow-hidden motion-reduce:min-h-0">
        <div aria-hidden className="pr-glow pointer-events-none absolute left-1/2 top-1/2 hidden h-[70svh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.05] blur-[140px] lg:block" />
        <div className="gutter mx-auto flex w-full max-w-[100rem] items-center justify-between pt-24">
          <SectionLabel index="05">How I think</SectionLabel>
          <p className="label text-fg-3 tabular-nums" aria-hidden>
            <span className="pr-index text-fg-1">01</span> / {String(principles.length).padStart(2, "0")}
          </p>
        </div>
        <h2 id="mind-title" className="sr-only">
          Engineering principles
        </h2>

        <nav className="gutter mx-auto mt-5 w-full max-w-[100rem] motion-reduce:hidden lg:hidden" aria-label="Principles">
          <ul className="flex flex-wrap gap-1.5">
            {principles.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "label inline-flex h-11 items-center rounded-full border px-3.5 transition-[color,background-color,border-color,transform] duration-[var(--duration-base)] active:scale-95",
                    i === index ? "border-accent/60 bg-accent-soft text-fg-1" : i < index ? "border-line-1 text-fg-3" : "border-line-1/60 text-fg-3/70",
                  )}
                >
                  {p.word}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="gutter mx-auto w-full max-w-[100rem]">
            <div className="relative min-h-[50svh] motion-reduce:min-h-0">
              {principles.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "pr-item absolute inset-0 flex flex-col justify-center motion-reduce:relative motion-reduce:mb-20",
                  )}
                >
                  <p className="pr-word whitespace-nowrap text-[clamp(2.4rem,11.5vw,12rem)] sm:text-[clamp(2.1rem,9.5vw,12rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em] text-fg-1" aria-label={p.word}>
                    {p.word}
                  </p>
                  <div className="pr-meta mt-6 grid grid-cols-12 gap-x-6 gap-y-3 sm:mt-8">
                    <p className="col-span-12 text-lead text-fg-1 lg:col-span-6">{p.line}</p>
                    <p className="col-span-12 flex gap-3 text-[15px] leading-relaxed text-fg-2 lg:col-span-5 lg:col-start-8">
                      <span className="label mt-1.5 shrink-0 text-accent">{p.index}</span>
                      <span>{p.proof}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="gutter mx-auto mb-8 w-full max-w-[100rem] motion-reduce:hidden lg:hidden" aria-hidden>
          <div className="flex gap-1.5">
            {principles.map((p, i) => (
              <span key={p.id} className={cn("h-0.5 flex-1 rounded-full transition-colors duration-[var(--duration-slow)]", i <= index ? "bg-accent" : "bg-line-2")} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
