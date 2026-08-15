"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Giant outlined section numeral that drifts with scroll — a recurring visual motif. */
export function SectionNumeral({ children, className, align = "right" }: { children: string; className?: string; align?: "left" | "right" }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { yPercent: 18, opacity: 0 },
          { yPercent: -18, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 z-0 select-none font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(241,239,233,0.09)]",
        "text-[clamp(10rem,26vw,26rem)]",
        align === "right" ? "right-0 sm:right-[-0.05em]" : "left-0 sm:left-[-0.05em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
