"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import type { Architecture } from "@/data/types";
import { SystemViz } from "./SystemViz";
import { createVizAmbient, createVizReveal } from "./animate";

/** A SystemViz that reveals once when scrolled into view and then runs ambient packets. */
export function VizInView({ architecture, id, title, desc, className, speed = 80 }: { architecture: Architecture; id: string; title?: string; desc?: string; className?: string; speed?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const reveal = createVizReveal(svg, architecture);
        let kill = () => {};
        const st = ScrollTrigger.create({
          trigger: svg,
          start: "top 80%",
          once: true,
          onEnter: () => {
            reveal.play();
            kill = createVizAmbient(svg, architecture, { speed });
          },
        });
        return () => {
          st.kill();
          reveal.kill();
          kill();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return <SystemViz ref={ref} architecture={architecture} id={id} title={title} desc={desc} className={className} />;
}
