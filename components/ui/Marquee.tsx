"use client";

import { useRef, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";

/** Infinite horizontal ticker (pure CSS, pauses on hover, respects reduced motion). */
export function Marquee({ items, className, separator = "·" }: { items: ReactNode[]; className?: string; separator?: ReactNode }) {
  const row = [...items, ...items];
  const track = useRef<HTMLDivElement>(null);
  // scroll velocity drives the ticker: it runs faster and skews slightly while the page moves
  useLenis(({ velocity }) => {
    const el = track.current;
    if (!el) return;
    const v = Math.min(3, Math.abs(velocity) / 12);
    el.style.setProperty("--marquee-boost", String(1 + v));
    el.style.setProperty("--marquee-skew", `${Math.max(-6, Math.min(6, -velocity / 6)).toFixed(2)}deg`);
  });
  return (
    <div className={cn("marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)} aria-hidden>
      <div ref={track} className="marquee-track">
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-8 pr-8">
            <span>{it}</span>
            <span className="text-accent">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
