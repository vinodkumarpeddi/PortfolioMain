"use client";

import { useRef } from "react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { GlassShape, HeroState } from "@/components/three/HeroObject";
import { cn } from "@/lib/utils";

/** A framed 3D glass object used as a project visual. */
export function GlassVisual({ shape, className, label }: { shape: GlassShape; className?: string; label?: string }) {
  const state = useRef<HeroState>({ spread: 0.15, opacity: 1 });
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden rounded-[22px] border border-line-1 bg-bg-1", className)} role="img" aria-label={label}>
      <div aria-hidden className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[70%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.09] blur-[90px]" />
      <HeroCanvas stateRef={state} ambient shape={shape} terrain={false} className="absolute inset-0" />
    </div>
  );
}
