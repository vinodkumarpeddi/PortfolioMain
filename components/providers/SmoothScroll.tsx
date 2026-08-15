"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => ref.current?.lenis?.raf(time * 1000);
    // prioritize: the scroll position must be written before GSAP renders this frame's tweens
    gsap.ticker.add(update, false, true);
    gsap.ticker.lagSmoothing(0);
    const lenis = ref.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);
    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={ref}
      options={{
        autoRaf: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        anchors: true,
        autoToggle: true,
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
