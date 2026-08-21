"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { HeroState, HeroVariant, OrbitConfig } from "./HeroObject";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const HeroObject = dynamic(() => import("./HeroObject"), { ssr: false });
const VoxelScene = dynamic(() => import("./VoxelScene"), { ssr: false });
const FlowScene = dynamic(() => import("./FlowScene"), { ssr: false });
const RibbonScene = dynamic(() => import("./RibbonScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Lazily mounts the WebGL scene, renders only while on screen, fades in when ready. */
export function HeroCanvas({ stateRef, className, ambient, variant, orbit, paused, scene = "planet" }: { stateRef: MutableRefObject<HeroState>; className?: string; ambient?: boolean; variant?: HeroVariant; orbit?: OrbitConfig; paused?: boolean; scene?: "planet" | "voxel" | "flow" | "ribbon" }) {
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
    /* half a viewport of lead: the first frame compiles the shaders, and that is better spent
       while the scene is still below the fold than on the frame it first shows */
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0, rootMargin: "50% 0px" });
    io.observe(ref.current);
    const t = window.setTimeout(() => setReady(true), 600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [ok]);

  if (reduced || !ok) return null;

  /* on screen is not the same as worth drawing: callers that fade the canvas out while it is
     still in the viewport pass `paused` so the frameloop stops with it */
  const live = visible && !paused;

  return (
    <div ref={ref} className={cn("transition-opacity duration-[1600ms] ease-[var(--ease-standard)]", ready ? "opacity-100" : "opacity-0", className)}>
      {scene === "voxel" ? (
        <VoxelScene stateRef={stateRef} active={live} />
      ) : scene === "flow" ? (
        <FlowScene stateRef={stateRef} active={live} />
      ) : scene === "ribbon" ? (
        <RibbonScene stateRef={stateRef} active={live} />
      ) : (
        <HeroObject stateRef={stateRef} active={live} variant={variant ?? (ambient ? "ambient" : "hero")} orbit={orbit} />
      )}
    </div>
  );
}
