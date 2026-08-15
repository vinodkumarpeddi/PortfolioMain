"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { useIsFinePointer, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Bento tile: reveals in, glows toward the cursor, and on desktop can be
 * picked up and dragged a little (springs back) — playful, not functional.
 */
export function BentoTile({ children, className, label, span }: { children: ReactNode; className?: string; label?: string; span?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();
  const playful = fine && !reduced;
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.cinematic, ease: ease.outExpo } },
      }}
      drag={playful}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.18}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 260, bounceDamping: 22 }}
      whileDrag={{ scale: 1.02, zIndex: 20, cursor: "grabbing" }}
      whileHover={playful ? { y: -2 } : undefined}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !playful) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-line-1 bg-bg-2/50 p-6 backdrop-blur-md [box-shadow:var(--shadow-soft)] transition-[border-color] duration-[var(--duration-slow)] hover:border-line-2",
        playful && "cursor-grab",
        span,
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100 [background:radial-gradient(38%_38%_at_var(--gx,50%)_var(--gy,50%),rgba(233,162,59,0.10),transparent_70%)]"
      />
      {label && <p className="label relative text-fg-3">{label}</p>}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
