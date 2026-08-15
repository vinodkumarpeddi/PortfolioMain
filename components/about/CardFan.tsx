"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useIsFinePointer } from "@/lib/hooks/use-media-query";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FanCard = { id: string; label: string; title: string; body: ReactNode; accent?: boolean };

/**
 * A hand of glass cards. Desktop: stacked and slightly rotated; hover fans them
 * out, click brings one to the front. Mobile: a horizontal snap row.
 */
export function CardFan({ cards }: { cards: FanCard[] }) {
  const [front, setFront] = useState(cards.length - 1);
  const [hover, setHover] = useState(false);
  const fine = useIsFinePointer();
  const n = cards.length;

  return (
    <>
      {/* desktop fan */}
      <div
        className="relative hidden h-[34rem] lg:block"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        role="group"
        aria-label="Profile cards"
      >
        {cards.map((c, i) => {
          const order = i === front ? n : i; // front card on top
          const rel = i - (n - 1) / 2;
          const spread = hover ? 1 : 0.35;
          const rot = rel * 6 * spread;
          const x = rel * 150 * spread;
          const y = Math.abs(rel) * 14 * spread + (i === front ? -14 : 0);
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setFront(i)}
              onFocus={() => setFront(i)}
              animate={{ x, y, rotate: rot, scale: i === front ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.7 }}
              style={{ zIndex: order, transformOrigin: "50% 120%" }}
              className={cn(
                "absolute left-1/2 top-4 h-[26rem] w-[19rem] -translate-x-1/2 cursor-pointer rounded-[26px] border bg-[#101013]/95 p-6 text-left backdrop-blur-xl [box-shadow:0_1px_0_rgba(255,255,255,0.06)_inset,0_40px_90px_-30px_rgba(0,0,0,0.9)] outline-none transition-[border-color] duration-[var(--duration-slow)] focus-visible:ring-2 focus-visible:ring-accent",
                i === front ? "border-accent/35" : "border-line-1",
              )}
              aria-pressed={i === front}
              aria-label={`${c.label}: ${c.title}`}
            >
              <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-accent/[0.10] blur-3xl" />
              <span className="label relative flex items-center justify-between text-fg-3">
                <span>{c.label}</span>
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="relative mt-4 block text-h3 text-fg-1">{c.title}</span>
              <span className="relative mt-4 block text-sm leading-relaxed text-fg-2">{c.body}</span>
            </motion.button>
          );
        })}
        {!fine && null}
      </div>

      {/* mobile row */}
      <div className="-mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--spacing-gutter)] pb-2 no-scrollbar lg:hidden" role="list" aria-label="Profile cards">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            role="listitem"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: ease.outExpo, delay: i * 0.05 }}
            className="relative w-[78vw] max-w-[22rem] shrink-0 snap-center overflow-hidden rounded-[26px] border border-line-1 bg-[#101013]/95 p-6"
          >
            <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-accent/[0.10] blur-3xl" />
            <span className="label relative flex items-center justify-between text-fg-3">
              <span>{c.label}</span>
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
            </span>
            <span className="relative mt-4 block text-h3 text-fg-1">{c.title}</span>
            <span className="relative mt-4 block text-sm leading-relaxed text-fg-2">{c.body}</span>
          </motion.div>
        ))}
      </div>
    </>
  );
}
