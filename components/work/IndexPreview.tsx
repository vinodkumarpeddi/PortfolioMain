"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { indexProjects } from "@/data/projects";
import { Pill, Window, themes } from "@/components/visuals/screens/ui";
import { ease } from "@/lib/motion";

/**
 * The card that follows the pointer over the project index: a small product window in the
 * project's own palette, carried on a spring so it trails the hand and leans into the
 * direction it is moving. Pointer devices only; the rows themselves expand on touch.
 */
const palettes = [themes.terminal, themes.observability, themes.stripe, themes.workspace, themes.now, themes.grill, themes.campus, themes.observability];

export function IndexPreview({ index, pointer }: { index: number | null; pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const x = useMotionValue(pointer.current.x);
  const y = useMotionValue(pointer.current.y);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const lastX = useRef(pointer.current.x);
  const vx = useMotionValue(0);
  const tilt = useSpring(useTransform(vx, [-40, 40], [-8, 8]), { stiffness: 200, damping: 24 });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = pointer.current;
      x.set(p.x);
      y.set(p.y);
      vx.set(p.x - lastX.current);
      lastX.current = p.x;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer, x, y, vx]);

  const p = index === null ? null : indexProjects[index];
  const theme = palettes[(index ?? 0) % palettes.length];

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[65] hidden lg:block" style={{ x: sx, y: sy }}>
      <motion.div style={{ rotate: tilt, x: 48, y: -150 }} className="origin-left">
        <AnimatePresence mode="popLayout">
          {p && (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, scale: 0.86, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.22 } }}
              transition={{ duration: 0.5, ease: ease.outExpo }}
              className="h-[15rem] w-[24rem]"
            >
              <Window theme={theme} url={new URL(p.github).pathname.slice(1).split("/")[1]?.slice(0, 34) ?? "repo"}>
                <div className="flex h-full flex-col p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-fg-3">{p.kind}</span>
                    <Pill tone="success">documented</Pill>
                  </div>
                  <p className="mt-3 text-[20px] font-semibold leading-[1.1] tracking-[-0.02em] text-fg-1">{p.title}</p>
                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-fg-2">{p.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    {p.technologies.slice(0, 5).map((t) => (
                      <span key={t} className="rounded-md border border-line-1 bg-fg-1/[0.04] px-2 py-1 font-mono text-[10.5px] text-fg-2">{t}</span>
                    ))}
                  </div>
                </div>
              </Window>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
