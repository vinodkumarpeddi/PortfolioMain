"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { HeroState } from "@/components/three/HeroObject";

/**
 * The silk behind About. Sticky inside the section so it travels with the reader, fed the
 * scroll velocity so it whips when they move fast, and faded at both ends of the section.
 */
export function AboutBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef<HeroState>({ spread: 0, opacity: 0, energy: 0 });

  useLenis(({ velocity }) => {
    state.current.energy = Math.min(1, Math.abs(velocity) / 45);
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      /* full strength through the middle of the section, off at the top and the bottom */
      const head = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.9)));
      const tail = Math.min(1, Math.max(0, r.bottom / (vh * 0.9)));
      state.current.opacity = Math.min(head, tail);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-clip motion-reduce:hidden">
      <div className="sticky top-0 h-svh">
        <HeroCanvas stateRef={state} scene="ribbon" className="absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_30%_45%,var(--color-bg-1)_0%,transparent_75%)] opacity-45 lg:bg-[radial-gradient(45%_60%_at_25%_40%,var(--color-bg-1)_0%,transparent_75%)]" />
      </div>
    </div>
  );
}
