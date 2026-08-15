"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CaseStudyToc({ items }: { items: { id: string; label: string; index: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
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

  return (
    <nav className="lg:sticky lg:top-28" aria-label="On this page">
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
