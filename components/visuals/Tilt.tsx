"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useIsFinePointer, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

/** Pointer-driven 3D tilt with a moving specular highlight. */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 160, damping: 22, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 160, damping: 22, mass: 0.6 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative [transform-style:preserve-3d] will-change-transform", className)}
      style={enabled ? { rotateX, rotateY, perspective: 1200 } : undefined}
      onPointerMove={(e) => {
        if (!enabled || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
      {enabled && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 [background:radial-gradient(40%_35%_at_var(--gx)_var(--gy),rgba(255,255,255,0.09),transparent_70%)] group-hover/tilt:opacity-100"
          style={{ "--gx": glareX, "--gy": glareY } as React.CSSProperties}
        />
      )}
    </motion.div>
  );
}
