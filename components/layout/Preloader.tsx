"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

const KEY = "vk-intro-seen";

/**
 * Branded intro: name + role + a progress line, then the curtain lifts.
 * Shows once per session, never on reduced motion, and never blocks first paint
 * (it mounts after hydration and lasts ~1.4s).
 */
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    const t0 = window.setTimeout(() => {
      setShow(true);
      document.documentElement.classList.add("intro-lock");
    }, 0);
    const brief = window.matchMedia("(max-width: 1023px)").matches;
    const t1 = window.setTimeout(() => setDone(true), brief ? 500 : 1500);
    const t2 = window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove("intro-lock");
    }, brief ? 900 : 2200);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.documentElement.classList.remove("intro-lock");
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-bg-0 text-fg-1"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          animate={done ? { clipPath: "inset(0 0 100% 0)" } : { clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
          <motion.p
            className="label relative text-fg-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: done ? 0 : 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {profile.role} · {profile.company}
          </motion.p>
          <motion.p
            className="relative mt-4 text-[clamp(1.6rem,4vw,3rem)] font-semibold tracking-[-0.03em]"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: done ? 0 : 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {profile.name}
          </motion.p>
          <div className="relative mt-8 h-px w-40 overflow-hidden bg-line-2">
            <motion.span
              className="absolute inset-y-0 left-0 bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: done ? "100%" : "78%" }}
              transition={{ duration: done ? 0.25 : 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
