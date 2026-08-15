"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { Project } from "@/data/types";
import { ScaledFrame } from "./ScaledFrame";
import { PaymentScreen } from "./screens/PaymentScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { SaasScreen } from "./screens/SaasScreen";
import { ExamScreen } from "./screens/ExamScreen";
import { GrillBotScreen } from "./screens/GrillBotScreen";
import { cn } from "@/lib/utils";
import { ScreenLightbox } from "./ScreenLightbox";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

export const screenFor: Record<string, React.ComponentType> = {
  "payment-orchestrator": PaymentScreen,
  "event-driven-analytics": AnalyticsScreen,
  "exam-seating-management": ExamScreen,
  "multi-tenant-saas": SaasScreen,
  grillbot: GrillBotScreen,
};

/**
 * A project's product screen, always shown whole — never cropped or panned. On phones it goes
 * full-bleed to win back the gutters, lifts on a slight perspective as it enters, and opens
 * full screen on tap.
 */
export function ProductVisual({ project, className, bleed = true }: { project: Project; className?: string; priority?: boolean; bleed?: boolean }) {
  const Screen = screenFor[project.slug];
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [9, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const lift = useTransform(scrollYProgress, [0, 1], [26, 0]);
  if (!Screen) return null;

  const label = `${project.title} — product screen (demo data)`;
  const frame = (
    <ScaledFrame className="relative rounded-[18px] sm:rounded-[22px]" label={label}>
      <Screen />
    </ScaledFrame>
  );

  return (
    <div ref={ref} className={cn("relative", bleed && "-mx-[var(--spacing-gutter)] sm:mx-0", className)}>
      <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[32px] bg-accent/[0.07] blur-3xl sm:-inset-6" />
      <motion.div
        className="relative [transform-style:preserve-3d] [perspective:1200px]"
        style={reduced ? undefined : { rotateX, scale, y: lift }}
      >
        {frame}
        {/* a light sweeps across the glass as it settles */}
        {!reduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[18px] sm:rounded-[22px]"
            style={{ background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.16) 48%,transparent 62%)" }}
            initial={{ x: "-120%" }}
            whileInView={{ x: "120%" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </motion.div>
      <div className="relative mt-3 flex items-center justify-between gap-3 px-[var(--spacing-gutter)] sm:hidden">
        <span className="label text-fg-3">{project.category}</span>
        <ScreenLightbox title={project.title} trigger="inline">
          <ScaledFrame className="rounded-2xl" label={label}>
            <Screen />
          </ScaledFrame>
        </ScreenLightbox>
      </div>
      <div className="hidden sm:block">
        <ScreenLightbox title={project.title}>
          <ScaledFrame className="rounded-2xl" label={label}>
            <Screen />
          </ScaledFrame>
        </ScreenLightbox>
      </div>
    </div>
  );
}
