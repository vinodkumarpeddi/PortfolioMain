"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Site-wide motion policy for `motion` components: with `reducedMotion="user"` transform and
 * layout animations stop when the OS preference is set, while opacity and colour still animate —
 * reduce rather than remove. GSAP timelines are gated separately via gsap.matchMedia.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
