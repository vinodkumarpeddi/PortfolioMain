"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scroll-driven focus for a horizontal snap row: each child gets a `--focus` custom
 * property from 0 (far from the centre) to 1 (centred). Paired with the `deck-focus`
 * utility so the centred card lifts and its neighbours settle back.
 */
export function useDeckFocus<T extends HTMLElement>(ref: RefObject<T | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = () => Array.from(el.children) as HTMLElement[];
    // only a rail that actually scrolls has a centre to focus
    const active = () => enabled && el.scrollWidth > el.clientWidth + 8;
    if (!active() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      children().forEach((c) => c.style.removeProperty("--focus"));
      return;
    }
    let raf = 0;
    const apply = () => {
      raf = 0;
      if (!active()) {
        children().forEach((c) => c.style.removeProperty("--focus"));
        return;
      }
      const box = el.getBoundingClientRect();
      const centre = box.left + box.width / 2;
      const span = Math.max(1, box.width * 0.62);
      for (const child of children()) {
        const c = child.getBoundingClientRect();
        const d = Math.abs(c.left + c.width / 2 - centre) / span;
        child.style.setProperty("--focus", Math.max(0, 1 - d).toFixed(3));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      children().forEach((c) => c.style.removeProperty("--focus"));
    };
  }, [ref, enabled]);
}
