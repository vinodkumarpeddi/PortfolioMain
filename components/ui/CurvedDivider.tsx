"use client";

import { useEffect, useRef } from "react";
import { useIsFinePointer, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

/** A hairline that bends toward the cursor as it passes — a quiet interactive divider. */
export function CurvedDivider({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const path = svg.querySelector("path")!;
    let target = 0;
    let cur = 0;
    let x = 0.5;
    let raf = 0;
    const draw = () => {
      cur += (target - cur) * 0.12;
      const w = 1000;
      const cx = x * w;
      path.setAttribute("d", `M0 50 Q ${cx} ${50 + cur} ${w} 50`);
      if (Math.abs(target - cur) > 0.05) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const inside = e.clientY > r.top - 80 && e.clientY < r.bottom + 80;
      x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      target = inside ? Math.max(-60, Math.min(60, (e.clientY - (r.top + r.height / 2)) * 0.9)) : 0;
      kick();
    };
    const onLeave = () => { target = 0; kick(); };
    if (fine && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fine, reduced]);
  return (
    <svg ref={ref} viewBox="0 0 1000 100" preserveAspectRatio="none" className={className} aria-hidden style={{ overflow: "visible" }}>
      <path d="M0 50 Q 500 50 1000 50" fill="none" stroke="rgba(241,239,233,0.16)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
