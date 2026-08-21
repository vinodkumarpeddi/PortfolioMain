"use client";

import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        anchors: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <Bridge />
      {children}
    </ReactLenis>
  );
}

/**
 * Drives Lenis from the GSAP ticker and ties it to `html.intro-lock`, the one scroll lock on the
 * site (splash, lightbox). A child of the provider, because ReactLenis only publishes the
 * instance after its own effect has run — read through a ref from the parent it is still
 * undefined on the first pass.
 *
 * The lock is handled here rather than with `autoToggle`, which restarts on a `transitionend`
 * for `overflow` that needs Lenis's own stylesheet; without it a lock that is on while Lenis
 * boots is never released and the page cannot be scrolled until the next load.
 */
function Bridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    // prioritize: the scroll position must be written before GSAP renders this frame's tweens
    gsap.ticker.add(update, false, true);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    const root = document.documentElement;
    /* written straight onto the few .v-skew elements: a custom property on <html> would
       invalidate computed style for the whole document on every scrolled frame */
    let leaners: HTMLElement[] = [];
    let leanersAt = 0;
    let vel = 0;
    const lean = ({ velocity }: { velocity: number }) => {
      const next = Math.max(-1, Math.min(1, velocity / 90));
      if (Math.abs(next - vel) < 0.01) return;
      vel = next;
      const now = performance.now();
      if (now - leanersAt > 3000) {
        leaners = Array.from(document.querySelectorAll<HTMLElement>(".v-skew"));
        leanersAt = now;
      }
      const t = `skewY(${(vel * -2.4).toFixed(2)}deg)`;
      for (const el of leaners) el.style.transform = t;
    };
    lenis.on("scroll", lean);
    const sync = () => {
      if (root.classList.contains("intro-lock")) lenis.stop();
      else if (lenis.isStopped) {
        lenis.start();
        ScrollTrigger.refresh();
      }
    };
    sync();
    const locks = new MutationObserver(sync);
    locks.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      locks.disconnect();
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.off("scroll", lean);
      for (const el of leaners) el.style.removeProperty("transform");
    };
  }, [lenis]);

  return null;
}
