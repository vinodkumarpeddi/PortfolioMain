"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { sections, type SectionId } from "@/data/profile";

type ScrollState = {
  active: SectionId;
  index: number;
  total: number;
  scrolled: boolean;
};

const backgrounds: Record<SectionId, string> = {
  intro: "#0a0a0c",
  work: "#0f0f12",
  experience: "#0c0c0f",
  systems: "#08080a",
  mindset: "#0a0a0c",
  about: "#0d0d10",
  contact: "#050506",
};

export function setSectionOverride(id: SectionId | null) {
  window.dispatchEvent(new CustomEvent("scrollstate:override", { detail: id }));
}

const Ctx = createContext<ScrollState>({ active: "intro", index: 0, total: sections.length, scrolled: false });

export function ScrollStateProvider({ children }: { children: ReactNode }) {
  const [ioActive, setIoActive] = useState<SectionId>("intro");
  const [override, setOverride] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const active = override ?? ioActive;

  useEffect(() => {
    const onOverride = (e: Event) => setOverride((e as CustomEvent<SectionId | null>).detail);
    window.addEventListener("scrollstate:override", onOverride);
    return () => window.removeEventListener("scrollstate:override", onOverride);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    if (!els.length) return;
    const ratios = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
        let best: Element | null = null;
        let bestRatio = 0;
        for (const [el, r] of ratios) if (r > bestRatio) { best = el; bestRatio = r; }
        const id = (best as HTMLElement | null)?.dataset.section as SectionId | undefined;
        if (id) setIoActive(id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.05, 0.15, 0.3, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 48));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.setProperty("--bg-current", backgrounds[active] ?? "var(--color-bg-1)");
  }, [active]);

  const value = useMemo<ScrollState>(() => {
    const index = Math.max(0, sections.findIndex((s) => s.id === active));
    return { active, index, total: sections.length, scrolled };
  }, [active, scrolled]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useScrollState = () => useContext(Ctx);
