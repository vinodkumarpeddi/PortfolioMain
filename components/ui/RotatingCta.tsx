"use client";

import { Magnetic } from "./Magnetic";
import { ArrowUpRight } from "./Icons";
import { cn } from "@/lib/utils";

/* The text ring is laid on a path of radius 78 in a 200-unit viewBox; at ~11.5px with
   0.28em tracking a glyph occupies roughly 10 units, so only ~47 characters fit before
   the repetitions collide. */
const RING_CAPACITY = 47;

/** Circular magnetic CTA with rotating text ring — the ending's centrepiece. */
export function RotatingCta({ href, label, ring, className, cursor, onClick, badge }: { href: string; label: string; ring: string; className?: string; cursor?: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; badge?: string }) {
  const unit = `${ring} · `;
  const reps = Math.max(1, Math.floor(RING_CAPACITY / unit.length));
  const text = unit.repeat(reps);
  return (
    <Magnetic strength={14} radius={40} className={className}>
      <a
        href={href}
        data-cursor={cursor}
        aria-label={label}
        onClick={onClick}
        className="group relative grid h-48 w-48 place-items-center rounded-full border border-line-2 bg-bg-2/40 backdrop-blur-md transition-[colors,transform] duration-[var(--duration-slow)] hover:border-fg-1/50 active:scale-95 sm:h-52 sm:w-52"
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full [animation:spin-slow_18s_linear_infinite] group-hover:[animation-duration:6s] motion-reduce:animate-none" aria-hidden>
          <defs>
            <path id="cta-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text className="fill-fg-2 font-mono text-[11.5px] uppercase tracking-[0.28em]">
            <textPath href="#cta-ring" startOffset="0" spacing="auto">
              {text}
            </textPath>
          </text>
        </svg>
        <span className={cn("relative grid h-20 w-20 place-items-center rounded-full bg-fg-1 text-2xl text-accent-ink transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-110", badge && "bg-success text-bg-0")}>
          {badge ? <span className="label text-[10px] tracking-[0.18em]">{badge}</span> : <ArrowUpRight className="transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
        </span>
      </a>
    </Magnetic>
  );
}
