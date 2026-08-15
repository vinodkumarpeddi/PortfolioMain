"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

const KEY = "vk-intro-seen";

/**
 * Splash: the mark assembles — the two arms rise, then the keystone drops in and locks the arch,
 * which is the thing the whole site argues for. Shows once per session, never on reduced motion,
 * and never blocks first paint (it mounts after hydration; ~0.9s on phones, ~2.2s on desktop).
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
          <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(55%_55%_at_50%_45%,black,transparent)]" />
          <span aria-hidden className="pointer-events-none absolute h-[42vh] w-[42vh] rounded-full bg-accent/[0.07] blur-[120px]" />

          {/* the dragon rises, then its fire catches */}
          <div className="relative h-40 w-40 sm:h-48 sm:w-48">
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0.82, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src="/brand/dragon.png" alt="" aria-hidden width={512} height={512} priority className="h-full w-full object-contain" />
            </motion.div>
            {/* the fire's heat, blooming out of the muzzle */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-3 top-[26%] h-16 w-16 rounded-full bg-[#e8541c]/60 blur-2xl"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.95, 0.55], scale: [0.4, 1.25, 1] }}
              transition={{ duration: 1.1, delay: 0.55, ease: "easeOut" }}
            />
          </div>

          <motion.p
            className="relative mt-9 overflow-hidden text-[clamp(1.35rem,4vw,2.4rem)] font-semibold tracking-[-0.035em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: done ? 0 : 1 }}
            transition={{ duration: 0.4, delay: 0.95 }}
          >
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.75, delay: 0.98, ease: [0.16, 1, 0.3, 1] }}
            >
              {profile.name}
            </motion.span>
          </motion.p>
          <motion.p
            className="label relative mt-3 text-fg-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: done ? 0 : 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.16 }}
          >
            {profile.role} · {profile.company}
          </motion.p>

          <div className="relative mt-9 h-px w-40 overflow-hidden bg-line-2">
            <motion.span
              className="absolute inset-y-0 left-0 bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: done ? "100%" : "80%" }}
              transition={{ duration: done ? 0.25 : 1.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
