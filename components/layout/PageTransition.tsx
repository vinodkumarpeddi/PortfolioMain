"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

/**
 * Route enter transition as a curtain that lifts off the new page.
 * The page itself is never transformed or filtered, so fixed/pinned
 * elements inside keep their containing block.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 60);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <>
      {children}
      {!reduced && (
        <AnimatePresence>
          {show && (
            <motion.div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-[95] bg-bg-1"
              initial={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
