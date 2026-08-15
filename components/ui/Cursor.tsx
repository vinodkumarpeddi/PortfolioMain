"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useIsFinePointer, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { spring } from "@/lib/motion";

type CursorState = { variant: "default" | "link" | "label" | "hidden" | "text"; label?: string };

const INTERACTIVE = "a, button, [role='button'], summary, [data-cursor]";
const TEXT_INPUT = "input, textarea, select, [contenteditable='true']";

export function Cursor() {
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, spring.cursor);
  const dotY = useSpring(y, spring.cursor);
  const ringX = useSpring(x, spring.cursorRing);
  const ringY = useSpring(y, spring.cursorRing);
  const [state, setState] = useState<CursorState>({ variant: "hidden" });
  const [pressed, setPressed] = useState(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("cursor-custom");
      return;
    }
    document.documentElement.classList.add("cursor-custom");

    const resolve = (target: EventTarget | null): CursorState => {
      if (!(target instanceof Element)) return { variant: "default" };
      if (target.closest(TEXT_INPUT)) return { variant: "text" };
      const labelled = target.closest<HTMLElement>("[data-cursor]");
      if (labelled?.dataset.cursor) return { variant: "label", label: labelled.dataset.cursor };
      if (target.closest(INTERACTIVE)) return { variant: "link" };
      return { variant: "default" };
    };

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const next = resolve(e.target);
      const cur = stateRef.current;
      if (cur.variant === "hidden" || cur.variant !== next.variant || cur.label !== next.label) setState(next);
    };
    const onLeave = () => setState({ variant: "hidden" });
    const onEnter = () => setState({ variant: "default" });
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
      document.documentElement.classList.remove("cursor-custom");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const hidden = state.variant === "hidden" || state.variant === "text";
  const isLabel = state.variant === "label";
  const isLink = state.variant === "link";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        className="absolute left-0 top-0 rounded-full bg-fg-1 mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: isLabel ? 0 : isLink ? 6 : 8,
          height: isLabel ? 0 : isLink ? 6 : 8,
          opacity: hidden ? 0 : 1,
          scale: pressed ? 0.7 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
      />
      <motion.div
        className="absolute left-0 top-0 rounded-full border border-fg-1/70 mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: isLink ? 40 : 28,
          height: isLink ? 40 : 28,
          opacity: hidden || isLabel ? 0 : isLink ? 0.9 : 0.35,
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.div
        className="absolute left-0 top-0"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      >
        <AnimatePresence>
          {isLabel && (
            <motion.span
              key={state.label}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: pressed ? 0.92 : 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={spring.snappy}
              className="label flex h-[72px] w-[72px] items-center justify-center rounded-full bg-fg-1 text-center leading-[1.15] text-accent-ink"
              style={{ padding: 6 }}
            >
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
