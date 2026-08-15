"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useScrollState } from "@/components/providers/ScrollState";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const { index, total } = useScrollState();
  const home = usePathname() === "/";

  return (
    <div aria-hidden className="pointer-events-none fixed bottom-6 right-5 top-24 z-[60] hidden flex-col items-center gap-3 lg:flex">
      <div className="relative w-px flex-1 overflow-hidden bg-line-1">
        <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-fg-1/60" style={{ scaleY }} />
      </div>
      {home && (
        <span className="label text-fg-3 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
