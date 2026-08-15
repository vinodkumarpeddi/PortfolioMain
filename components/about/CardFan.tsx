"use client";

import { useRef, useState, type ReactNode } from "react";
import { useDeckFocus } from "@/lib/hooks/use-deck-focus";
import { motion } from "motion/react";
import { useIsFinePointer } from "@/lib/hooks/use-media-query";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FanCard = { id: string; label: string; title: string; body: ReactNode; accent?: boolean };

/**
 * A hand of glass cards. Desktop: stacked and slightly rotated; hover fans them
 * out, click brings one to the front. Mobile: a horizontal snap deck with
 * progress dots, edge peek and tap-to-expand.
 */
export function CardFan({ cards }: { cards: FanCard[] }) {
  const [front, setFront] = useState(cards.length - 1);
  const [hover, setHover] = useState(false);
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const row = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();
  useDeckFocus(row);
  const n = cards.length;

  const onRowScroll = () => {
    const el = row.current;
    if (!el) return;
    const step = el.scrollWidth / n;
    setCurrent(Math.min(n - 1, Math.max(0, Math.round((el.scrollLeft + step / 2) / step - 0.5))));
  };
  const goTo = (i: number) => {
    const el = row.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

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

      {/* mobile deck */}
      <div
        ref={row}
        onScroll={onRowScroll}
        className="-mx-[var(--spacing-gutter)] flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-[var(--spacing-gutter)] pb-2 no-scrollbar lg:hidden"
        role="group"
        aria-label="Profile cards"
      >
        {cards.map((c, i) => {
          const open = expanded === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setExpanded(open ? null : c.id)}
              aria-expanded={open}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: ease.outExpo, delay: i * 0.05 }}
              className={cn(
                "deck-focus relative flex w-[80vw] max-w-[22rem] shrink-0 snap-center flex-col overflow-hidden rounded-[26px] border bg-[#101013]/95 p-6 text-left transition-[border-color] active:opacity-80",
                current === i ? "border-accent/35" : "border-line-1",
              )}
            >
              <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-accent/[0.10] blur-3xl" />
              <span className="label relative flex items-center justify-between text-fg-3">
                <span>{c.label}</span>
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="relative mt-4 block text-h3 text-fg-1">{c.title}</span>
              <span className={cn("relative mt-4 block text-sm leading-relaxed text-fg-2", !open && "line-clamp-4")}>{c.body}</span>
              <span className="label relative mt-auto block pt-4 text-fg-3">{open ? "Tap to collapse" : "Tap to expand"}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 lg:hidden">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${c.label}`}
            aria-current={current === i ? "true" : undefined}
            className="grid h-6 w-6 place-items-center"
          >
            <span className={cn("block h-1.5 rounded-full transition-all duration-[var(--duration-base)]", current === i ? "w-5 bg-accent" : "w-1.5 bg-fg-3/40")} />
          </button>
        ))}
      </div>
    </>
  );
}
