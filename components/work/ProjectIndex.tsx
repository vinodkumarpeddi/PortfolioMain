"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { indexProjects } from "@/data/projects";
import { ArrowDown, ArrowUpRight, GitHub } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { useIsFinePointer } from "@/lib/hooks/use-media-query";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Trace-viewer style list. Pointer: hovering a row dims its siblings and expands its
 * summary, clicking opens the source. Touch: the first tap expands, the link inside opens it.
 */
export function ProjectIndex() {
  const [active, setActive] = useState<number | null>(null);
  const finePointer = useIsFinePointer();

  return (
    <div className="gutter mx-auto max-w-[100rem] py-[calc(var(--spacing-section)*0.6)]">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-fg-3">More systems</p>
          <h3 className="text-h2 mt-3 text-fg-1">Smaller, sharper problems.</h3>
        </div>
        <p className="max-w-[44ch] text-sm leading-relaxed text-fg-2">
          Focused services and products, each documented and runnable.{" "}
          <span className="hidden lg:inline">Hover a row for what it does; open for the source.</span>
          <span className="lg:hidden">Tap a row for what it does, then open the source.</span>
        </p>
      </Reveal>

      <ul className="mt-10 border-t border-line-1" onMouseLeave={() => finePointer && setActive(null)}>
        {indexProjects.map((p, i) => {
          const dim = active !== null && active !== i;
          const open = active === i;
          return (
            <li key={p.title} className="border-b border-line-1">
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="GitHub ↗"
                aria-expanded={finePointer ? undefined : open}
                onMouseEnter={() => finePointer && setActive(i)}
                onFocus={() => finePointer && setActive(i)}
                onBlur={() => finePointer && setActive(null)}
                onClick={(e) => {
                  if (finePointer) return;
                  e.preventDefault();
                  setActive(open ? null : i);
                }}
                className={cn(
                  "group grid grid-cols-12 items-baseline gap-x-4 py-5 transition-[opacity,background-color,transform] duration-[var(--duration-base)] max-lg:active:scale-[0.995] max-lg:active:bg-fg-1/[0.03] sm:py-6",
                  dim && "lg:opacity-40",
                )}
              >
                <span className="label col-span-2 text-fg-3 sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-9 flex flex-col gap-1 sm:col-span-5">
                  <span className="text-h3 text-fg-1">{p.title}</span>
                  <span className="label text-fg-3">{p.kind}</span>
                </span>
                <span className="col-span-1 flex justify-end self-center sm:hidden" aria-hidden>
                  <ArrowDown className={cn("text-fg-3 transition-transform duration-[var(--duration-base)]", open && "-rotate-180 text-accent")} />
                </span>
                <span className="label col-span-10 col-start-3 mt-3 flex flex-wrap gap-x-3 gap-y-1 text-fg-3 sm:col-span-5 sm:col-start-7 sm:mt-0">
                  {p.technologies.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
                <span className="col-span-1 hidden justify-end text-fg-3 transition-colors group-hover:text-fg-1 sm:flex">
                  <ArrowUpRight className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.span
                      key="summary"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: ease.outExpo }}
                      className="col-span-12 col-start-1 overflow-hidden sm:col-span-10 sm:col-start-2"
                    >
                      <span className="block max-w-[70ch] pt-3 text-sm leading-relaxed text-fg-2">
                        {p.summary}
                        {p.live && (
                          <>
                            {" "}
                            <span className="text-fg-1">Live at {new URL(p.live).host}.</span>
                          </>
                        )}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </a>
              <AnimatePresence initial={false}>
                {open && !finePointer && (
                  <motion.div
                    key="actions"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: ease.outExpo }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 pb-5 pl-[16.6667%]">
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="label inline-flex h-11 items-center gap-1.5 rounded-full border border-line-2 px-4 text-fg-1 transition-transform active:scale-95"
                      >
                        <GitHub /> Source
                      </a>
                      {p.live && (
                        <a
                          href={p.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="label inline-flex h-11 items-center gap-1.5 rounded-full bg-fg-1 px-4 text-accent-ink transition-transform active:scale-95"
                        >
                          Live <ArrowUpRight />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      <p className="label mt-6 flex items-center gap-2 text-fg-3">
        <GitHub /> 70+ public repositories on GitHub
      </p>
    </div>
  );
}
