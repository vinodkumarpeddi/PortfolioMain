"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "motion/react";

/**
 * Normalised pointer position in [-1, 1] on both axes, spring-smoothed.
 * Only active on fine pointers; on touch devices the values stay at 0.
 */
export function useMouseParallax(enabled = true, stiffness = 60, damping = 20) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping, mass: 0.8 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.8 });

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}
