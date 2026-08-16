"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

const KEY = "vk-intro-seen";
const RUNTIME = 6700; // the clip runs 6.58s; the rest is the hand-over
const FADE = 600;
const EDGE =
  "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)," +
  "linear-gradient(to bottom, transparent, #000 5%, #000 95%, transparent)";

/* Survives React's development double-effect: the first pass claims the session and starts the
   clock, the second re-arms against the time already elapsed instead of bailing out. */
let startedAt: number | null = null;

/**
 * Splash: the dragon comes out of the dark, breathes, takes the V and locks as the crest,
 * then hands over to the page beneath it.
 *
 * The sequence is a rendered clip rather than CSS, so it costs one <video> and React renders
 * three times (start, leave, end). Black is composited out with `screen`, which is why the clip
 * ships on a pure #000 field. Plays once per session, is skippable, and falls back to the static
 * crest whenever the video cannot or should not run.
 */
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [stalled, setStalled] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setLeaving(true);
    timers.current.push(
      window.setTimeout(() => {
        setShow(false);
        document.documentElement.classList.remove("intro-lock");
      }, FADE),
    );
  }, []);

  useEffect(() => {
    if (startedAt === null) {
      try {
        if (sessionStorage.getItem(KEY)) return;
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* private mode — just play it */
      }
      startedAt = Date.now();
    }
    const total = reduced ? 900 : RUNTIME;
    const left = total - (Date.now() - startedAt);
    if (left <= 0) return;

    document.documentElement.classList.add("intro-lock");
    const t = timers.current;
    t.push(window.setTimeout(() => setShow(true), 0));
    t.push(window.setTimeout(() => setLeaving(true), left));
    t.push(
      window.setTimeout(() => {
        setShow(false);
        document.documentElement.classList.remove("intro-lock");
      }, left + FADE),
    );
    return () => {
      t.forEach(window.clearTimeout);
      timers.current = [];
      document.documentElement.classList.remove("intro-lock");
    };
  }, [reduced]);

  /* Autoplay can still be refused; when it is, show the crest instead of a black hole. */
  useEffect(() => {
    if (!show || reduced) return;
    video.current?.play().catch(() => setStalled(true));
  }, [show, reduced]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  if (!show) return null;
  const still = reduced || stalled;

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center overflow-hidden bg-[#050505] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
      style={{ opacity: leaving ? 0 : 1, transform: leaving ? "scale(0.96)" : "scale(1)" }}
      onClick={dismiss}
    >
      {still ? (
        <Image
          src="/brand/dragon.png"
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          priority
          className="h-auto w-[min(74vw,26rem)] select-none"
          style={{ animation: `cine-simple 500ms ease-out both` }}
        />
      ) : (
        <video
          ref={video}
          aria-hidden
          src="/brand/intro.mp4"
          poster="/brand/intro-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={dismiss}
          onError={() => setStalled(true)}
          className="h-auto w-[min(148vw,64rem)] max-w-none select-none"
          style={{
            mixBlendMode: "screen",
            /* the close pass is wider than the rendered frame, so the wings run off it — feather
               the border and they dissolve into the dark instead of ending on a straight cut */
            maskImage: EDGE,
            WebkitMaskImage: EDGE,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
      )}

      <p
        aria-hidden
        className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] label text-fg-3"
        style={{ animation: `cine-simple 600ms ${still ? 200 : 5400}ms ease-out both` }}
      >
        {profile.name} · {profile.role}
      </p>

      <button
        type="button"
        onClick={dismiss}
        className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] min-h-11 min-w-11 px-3 label text-fg-3 transition-colors hover:text-fg-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9a23b]"
      >
        Skip
      </button>
    </div>
  );
}
