"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { CoreState } from "./SystemCore";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const SystemCore = dynamic(() => import("./SystemCore"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Lazily mounts the WebGL scene when supported, keeps it rendering only while
 * on screen, and fades it in once the first frame is ready.
 */
export function CoreCanvas({ stateRef, className, compact }: { stateRef: MutableRefObject<CoreState>; className?: string; compact?: boolean }) {
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
    const t = window.setTimeout(() => setReady(true), 500);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [ok]);

  if (reduced || !ok) return null;

  return (
    <div ref={ref} className={cn("transition-opacity duration-[1400ms] ease-[var(--ease-standard)]", ready ? "opacity-100" : "opacity-0", className)}>
      <SystemCore stateRef={stateRef} active={visible} compact={compact} />
    </div>
  );
}
