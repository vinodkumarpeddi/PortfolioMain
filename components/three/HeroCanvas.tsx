"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { HeroState } from "./HeroObject";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const HeroObject = dynamic(() => import("./HeroObject"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Lazily mounts the WebGL scene, renders only while on screen, fades in when ready. */
export function HeroCanvas({ stateRef, className, ambient }: { stateRef: MutableRefObject<HeroState>; className?: string; ambient?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [ok, setOk] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const id = window.requestAnimationFrame(() => {
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      setOk(hasWebGL() && !saveData);
    });
    return () => window.cancelAnimationFrame(id);
  }, [reduced]);

  useEffect(() => {
    if (!ok || !ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(ref.current);
    const t = window.setTimeout(() => setReady(true), 600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [ok]);

  if (reduced || !ok) return null;

  return (
    <div ref={ref} className={cn("transition-opacity duration-[1600ms] ease-[var(--ease-standard)]", ready ? "opacity-100" : "opacity-0", className)}>
      <HeroObject stateRef={stateRef} active={visible} ambient={ambient} />
    </div>
  );
}
