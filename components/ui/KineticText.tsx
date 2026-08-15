"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsFinePointer, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Kinetic headline: each letter reacts to the cursor — weight swells,
 * letters lift and tilt near the pointer, then spring back. Uses the
 * variable axis of Geist, so it's pure CSS transforms + font-weight.
 */
export function KineticText({ text, className, accentLast = false }: { text: string; className?: string; accentLast?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!fine || reduced || !ref.current) return;
    const letters = Array.from(ref.current.querySelectorAll<HTMLSpanElement>("[data-letter]"));
    const setters = letters.map((el) => ({
      y: gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" }),
      rot: gsap.quickTo(el, "rotation", { duration: 0.6, ease: "expo.out" }),
      wght: gsap.quickTo(el, "--wght", { duration: 0.5, ease: "power2.out" }),
      el,
    }));
    const onMove = (e: PointerEvent) => {
      for (const s of setters) {
        const r = s.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const t = Math.max(0, 1 - dist / 260);
        s.y(-t * 18);
        s.rot((dx / 260) * -6 * t);
        s.wght(600 + t * 300);
      }
    };
    const onLeave = () => setters.forEach((s) => { s.y(0); s.rot(0); s.wght(600); });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduced]);

  const chars = Array.from(text);
  return (
    <span ref={ref} className={cn("inline-block whitespace-nowrap", className)} aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={i}
          data-letter
          aria-hidden
          className={cn("inline-block will-change-transform [font-variation-settings:'wght'_var(--wght,600)]", accentLast && i === chars.length - 1 && "text-accent")}
          style={{ ["--wght" as string]: 600 }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
