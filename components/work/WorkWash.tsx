"use client";

import { useEffect, useRef } from "react";

/**
 * Each project's own brand colour washes the page while its scene is in view — the purple of
 * the payments product, the cyan of the analytics console — so the section changes key as
 * the reader moves through it. Reads `data-wash` from the scene wrappers; a sticky layer
 * carries the gradient and CSS transitions do the cross-fade.
 */
export function WorkWash() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.closest("section");
    if (!layer || !section) return;
    const scenes = Array.from(section.querySelectorAll<HTMLElement>("[data-wash]"));
    if (!scenes.length) return;
    const ratios = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
        let best: HTMLElement | null = null;
        let bestRatio = 0;
        for (const [el, r] of ratios) if (r > bestRatio) { best = el as HTMLElement; bestRatio = r; }
        const color = best?.dataset.wash;
        if (color) {
          layer.style.setProperty("--wash", color);
          document.body.style.setProperty("--ink", color);
        }
        layer.style.opacity = best ? "1" : "0";
      },
      { rootMargin: "-20% 0px -20% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    scenes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-clip motion-reduce:hidden">
      <div
        ref={ref}
        className="sticky top-0 h-svh w-full opacity-0 transition-opacity duration-[1200ms] ease-[var(--ease-standard)]"
        style={{
          ["--wash" as string]: "#e9a23b",
          background:
            "radial-gradient(55% 60% at 72% 38%, color-mix(in oklab, var(--wash) 34%, transparent) 0%, transparent 70%), radial-gradient(40% 45% at 18% 85%, color-mix(in oklab, var(--wash) 16%, transparent) 0%, transparent 70%)",
          transition: "opacity 1200ms var(--ease-standard), --wash 1200ms var(--ease-standard)",
        }}
      />
    </div>
  );
}
