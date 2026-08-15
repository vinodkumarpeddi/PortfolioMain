"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders a fixed-size design (default 1200×750) scaled to the container width,
 * so complex UI mocks keep their layout at every viewport size.
 */
export function ScaledFrame({ children, width = 1200, height = 750, className, label }: { children: ReactNode; width?: number; height?: number; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: `${width} / ${height}` }} role="img" aria-label={label}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }} aria-hidden>
        {children}
      </div>
    </div>
  );
}
