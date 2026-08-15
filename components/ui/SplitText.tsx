"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText as GSplit, useGSAP, MOTION_OK } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  className?: string;
  /** split granularity of the animated pieces */
  by?: "lines" | "words" | "chars";
  /** animate immediately on mount instead of on viewport entry */
  immediate?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  id?: string;
};

export function SplitText({
  as: Tag = "span",
  children,
  className,
  by = "lines",
  immediate = false,
  delay = 0,
  stagger,
  duration = 1.1,
  start = "top 88%",
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const type = by === "chars" ? "lines,words,chars" : by === "words" ? "lines,words" : "lines";
        const split = GSplit.create(el, {
          type,
          mask: "lines",
          autoSplit: true,
          linesClass: "split-line",
          onSplit: (self) => {
            const targets = by === "chars" ? self.chars : by === "words" ? self.words : self.lines;
            return gsap.from(targets, {
              yPercent: 110,
              rotate: by === "lines" ? 0 : 0.001,
              duration,
              ease: "expo.out",
              delay,
              stagger: stagger ?? (by === "chars" ? 0.02 : by === "words" ? 0.045 : 0.09),
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            });
          },
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  const Comp = Tag as "span";
  return (
    <Comp ref={ref as React.RefObject<HTMLSpanElement>} id={id} className={cn("inline-block", className)}>
      {children}
    </Comp>
  );
}
