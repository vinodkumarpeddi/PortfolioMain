import type { Transition, Variants } from "motion/react";

export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  standard: [0.2, 0, 0, 1] as const,
};

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.48,
  cinematic: 0.8,
  scene: 1.2,
};

export const spring = {
  snappy: { type: "spring", stiffness: 420, damping: 34, mass: 0.6 } satisfies Transition,
  soft: { type: "spring", stiffness: 180, damping: 26, mass: 0.8 } satisfies Transition,
  cursor: { stiffness: 900, damping: 60, mass: 0.4 },
  cursorRing: { stiffness: 380, damping: 40, mass: 0.7 },
  magnetic: { stiffness: 260, damping: 22, mass: 0.5 },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.cinematic, ease: ease.outExpo, delay: i * 0.06 },
  }),
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.standard } },
};

export const stagger = (children = 0.06, delay = 0): Transition => ({
  staggerChildren: children,
  delayChildren: delay,
});

export const viewportOnce = { once: true, amount: 0.3, margin: "0px 0px -10% 0px" } as const;
