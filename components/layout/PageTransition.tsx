"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { washFor } from "@/lib/brand";

/**
 * Route enter transition: a dark curtain lifts off the new page with a band of the destination
 * project's colour trailing its edge — only on client-side navigations, never on first paint.
 * The page itself is never transformed or filtered, so fixed/pinned elements keep their
 * containing block.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const prev = useRef<string | null>(null);
  const [show, setShow] = useState(false);
  const [color, setColor] = useState("#e9a23b");

  useEffect(() => {
    if (prev.current === null || prev.current === pathname) {
      prev.current = pathname;
      return;
    }
    prev.current = pathname;
    const slug = pathname.startsWith("/work/") ? pathname.split("/")[2] : undefined;
    setColor(washFor(slug));
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 80);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const lift = (delay: number) => ({ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.75, delay, ease: [0.76, 0, 0.24, 1] as const } });

  return (
    <>
      {children}
      {!reduced && (
        <AnimatePresence>
          {show && (
            <motion.div key="brand" aria-hidden className="pointer-events-none fixed inset-0 z-[94]" style={{ background: color }} initial={{ clipPath: "inset(0 0 0% 0)" }} exit={lift(0.1)} />
          )}
          {show && (
            <motion.div key="dark" aria-hidden className="pointer-events-none fixed inset-0 z-[95] bg-bg-1" initial={{ clipPath: "inset(0 0 0% 0)" }} exit={lift(0)} />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
