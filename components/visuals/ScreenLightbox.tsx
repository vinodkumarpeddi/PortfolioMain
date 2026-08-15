"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ease } from "@/lib/motion";

/**
 * Phone-only: tap a product screen to open it full-screen at a readable size and pan across it.
 * The frame keeps its 1200×750 design; the sheet scrolls horizontally.
 */
export function ScreenLightbox({ title, trigger = "floating", children }: { title: string; trigger?: "floating" | "inline"; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("intro-lock");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("intro-lock");
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          trigger === "inline"
            ? "label inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-4 text-[11px] text-fg-1 transition-transform active:scale-95 lg:hidden"
            : "label absolute bottom-3 right-3 z-10 inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-black/60 px-4 text-[11px] text-white backdrop-blur-md transition-transform active:scale-95 lg:hidden"
        }
        aria-label={`Open ${title} full screen`}
      >
        <span aria-hidden>⤢</span> Expand
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="lb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                className="fixed inset-0 z-[120] flex flex-col bg-bg-0/95 backdrop-blur-xl"
                role="dialog"
                aria-modal="true"
                aria-label={`${title} — full screen`}
              >
                <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
                  <p className="label min-w-0 truncate text-fg-2">{title} · swipe to pan</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="label inline-flex h-11 shrink-0 items-center rounded-full border border-line-2 px-4 text-fg-1 transition-transform active:scale-95"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
                <motion.div
                  initial={{ scale: 0.96, y: 12 }}
                  animate={{ scale: 1, y: 0, transition: { duration: 0.6, ease: ease.outExpo } }}
                  className="no-scrollbar flex-1 overflow-x-auto overflow-y-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                >
                  <div style={{ width: "max(100%, calc((100svh - 7rem) * 1.6))" }}>{children}</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
