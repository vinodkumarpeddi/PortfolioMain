"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

/**
 * Route enter transition as a curtain that lifts off the new page — only on
 * client-side navigations, never on first paint. The page itself is never
 * transformed or filtered, so fixed/pinned elements keep their containing block.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const prev = useRef<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (prev.current === null || prev.current === pathname) {
      prev.current = pathname;
      return;
    }
    prev.current = pathname;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 80);
    return () => window.clearTimeout(t);
  }, [pathname]);

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
