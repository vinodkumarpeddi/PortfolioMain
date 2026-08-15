"use client";

import { Magnetic } from "./Magnetic";
import { ArrowUpRight } from "./Icons";
import { cn } from "@/lib/utils";

/** Circular magnetic CTA with rotating text ring — the ending's centrepiece. */
export function RotatingCta({ href, label, ring, className, cursor }: { href: string; label: string; ring: string; className?: string; cursor?: string }) {
  const text = `${ring} · ${ring} · `;
  return (
    <Magnetic strength={14} radius={40} className={className}>
      <a
        href={href}
        data-cursor={cursor}
        aria-label={label}
        className="group relative grid h-44 w-44 place-items-center rounded-full border border-line-2 bg-bg-2/40 backdrop-blur-md transition-colors duration-[var(--duration-slow)] hover:border-fg-1/50 sm:h-52 sm:w-52"
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full [animation:spin-slow_18s_linear_infinite] group-hover:[animation-duration:6s] motion-reduce:animate-none" aria-hidden>
          <defs>
            <path id="cta-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text className="fill-fg-2 font-mono text-[11.5px] uppercase tracking-[0.28em]">
            <textPath href="#cta-ring" startOffset="0">
              {text}
            </textPath>
          </text>
        </svg>
        <span className={cn("relative grid h-16 w-16 place-items-center rounded-full bg-fg-1 text-2xl text-accent-ink transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-110 sm:h-20 sm:w-20")}>
          <ArrowUpRight className="transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </a>
    </Magnetic>
  );
}
