"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CaseStudyToc({ items, variant = "list" }: { items: { id: string; label: string; index: string }[]; variant?: "list" | "rail" }) {
  const [active, setActive] = useState(items[0]?.id);
  const rail = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const recentre = () => {
    const r = rail.current;
    if (!r) return;
    requestAnimationFrame(() => {
      const el = r.querySelector<HTMLElement>('[data-on="true"]');
      if (el) r.scrollTo({ left: el.offsetLeft - (r.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
    });
  };

  if (variant === "rail") {
    return (
      <nav className="sticky top-[4.25rem] z-30 -mx-[var(--spacing-gutter)] mb-6 lg:hidden" aria-label="On this page">
        <ol ref={rail} className="no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain bg-bg-0/85 px-[var(--spacing-gutter)] py-2 backdrop-blur-md">
          {items.map((i) => {
            const on = active === i.id;
            return (
              <li key={i.id} className="shrink-0" data-on={on ? "true" : "false"}>
                <a href={`#${i.id}`} onClick={recentre} className={cn("label inline-flex h-11 items-center gap-2 rounded-full border px-3.5 transition-[colors,transform] active:scale-95", on ? "border-accent/60 bg-accent-soft text-fg-1" : "border-line-1 text-fg-3")}>
                  <span className="text-accent">{i.index}</span>
                  {i.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
  return (
    <nav className="hidden lg:sticky lg:top-28 lg:block" aria-label="On this page">
      <p className="label text-fg-3">Contents</p>
      <ol className="mt-4 space-y-1 border-l border-line-1">
        {items.map((i) => {
          const on = active === i.id;
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                className={cn(
                  "-ml-px flex items-center gap-3 border-l py-1.5 pl-4 text-sm transition-colors duration-[var(--duration-base)]",
                  on ? "border-accent text-fg-1" : "border-transparent text-fg-3 hover:text-fg-1",
                )}
              >
                <span className="label w-5 text-fg-3">{i.index}</span>
                {i.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
