"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

/**
 * Counts up to `value` the first time it scrolls into view. The real value is what renders
 * unless the count is actually running, so a throttled or hidden tab never leaves a 0 on screen.
 */
export function Counter({ value, duration = 1100, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = usePrefersReducedMotion();
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduced || typeof document === "undefined" || document.visibilityState !== "visible") return;
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setRunning(false);
    };
    raf = requestAnimationFrame(() => {
      setRunning(true);
      raf = requestAnimationFrame(tick);
    });
    // if frames never arrive (hidden or throttled tab), settle on the real number
    const safety = window.setTimeout(() => setRunning(false), duration + 700);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className}>
      {(running ? shown : value).toLocaleString()}
    </span>
  );
}
