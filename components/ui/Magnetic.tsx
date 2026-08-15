"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { spring } from "@/lib/motion";
import { useIsFinePointer, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

type Props = {
  children: ReactNode;
  className?: string;
  /** maximum translation in px */
  strength?: number;
  /** how far outside the element the pull starts, in px */
  radius?: number;
};

export function Magnetic({ children, className, strength = 8, radius = 24 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, spring.magnetic);
  const y = useSpring(my, spring.magnetic);

  const onMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const max = Math.max(r.width, r.height) / 2 + radius;
    const t = Math.max(0, 1 - dist / max);
    mx.set((dx / (r.width / 2 + radius)) * strength * (0.4 + 0.6 * t));
    my.set((dy / (r.height / 2 + radius)) * strength * (0.4 + 0.6 * t));
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={enabled ? { x, y, display: "inline-block" } : { display: "inline-block" }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
