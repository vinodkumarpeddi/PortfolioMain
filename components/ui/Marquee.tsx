import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Infinite horizontal ticker (pure CSS, pauses on hover, respects reduced motion). */
export function Marquee({ items, className, separator = "·" }: { items: ReactNode[]; className?: string; separator?: ReactNode }) {
  const row = [...items, ...items];
  return (
    <div className={cn("marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)} aria-hidden>
      <div className="marquee-track">
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-8 pr-8">
            <span>{it}</span>
            <span className="text-accent">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
