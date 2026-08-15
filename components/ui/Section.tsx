import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionLabel({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("label flex items-center gap-3 text-fg-3", className)}>
      {index && <span className="text-accent">{index}</span>}
      {index && <span className="h-px w-6 bg-line-2" aria-hidden />}
      <span>{children}</span>
    </div>
  );
}

export function SectionHeading({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return <Tag className={cn("text-h1 text-balance text-fg-1", className)}>{children}</Tag>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("label text-fg-3", className)}>{children}</p>;
}
