"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

const KEY = "vk-intro-seen";
const RUNTIME = 6600; // the clip runs 6.58s
const START_WAIT = 2600; // how long the clip gets to start before we stop waiting for it
const STILL_HOLD = 1200; // how long the static crest sits when it stands in
const HARD_CAP = 11000; // nothing hides the page for longer than this, whatever happens
const FADE = 600;
const EDGE =
  "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)," +
  "linear-gradient(to bottom, transparent, #000 5%, #000 95%, transparent)";

/* Survives React's development double-effect: the first pass claims the session, the second
   sees the claim and carries on instead of bailing out. */
let claimed = false;

/**
 * Splash: the dragon comes out of the dark, breathes, takes the V and locks as the crest,
 * then hands over to the page beneath it.
 *
 * Timing follows the clip rather than a fixed schedule — a wall-clock timer will happily run
 * its full length over a video that never started, which shows a frozen first frame and then
 * clears. So the sequence ends on `ended`, the zoom is tied to `playing`, and anything that
 * cannot start within START_WAIT hands over to the static crest instead.
 */
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [live, setLive] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const playing = useRef(false);
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
    if (!claimed) {
      try {
        if (sessionStorage.getItem(KEY)) return;
      } catch {
        /* private mode — just play it */
      }
    }

    const t = timers.current;
    const begin = () => {
      if (!claimed) {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* private mode — just play it */
        }
        claimed = true;
      }
      document.documentElement.classList.add("intro-lock");
      t.push(window.setTimeout(() => setShow(true), 0));
      t.push(window.setTimeout(() => !playing.current && setStalled(true), START_WAIT));
      t.push(window.setTimeout(dismiss, HARD_CAP));
    };

    /* Opened in a background tab, the clip cannot decode and the whole intro would burn down
       before anyone looked at it. Hold it until the tab is actually on screen. */
    if (!document.hidden) begin();
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      begin();
    };
    if (document.hidden) document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      t.forEach(window.clearTimeout);
      timers.current = [];
      document.documentElement.classList.remove("intro-lock");
    };
  }, [dismiss]);

  /* `preload` is only a hint and the media load loses to the rest of the page often enough to
     matter, so ask for the bytes outright. */
  useEffect(() => {
    if (!show || reduced || stalled) return;
    const v = video.current;
    if (!v) return;
    v.load();
    v.play().catch(() => setStalled(true));
  }, [show, reduced, stalled]);

  const still = reduced || stalled;

  useEffect(() => {
    if (!show || !still) return;
    const id = window.setTimeout(dismiss, STILL_HOLD);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [show, still, dismiss]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  if (!show) return null;

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
          muted
          playsInline
          preload="auto"
          onPlaying={() => {
            playing.current = true;
            setLive(true);
          }}
          onEnded={dismiss}
          onError={() => setStalled(true)}
          className="intro-clip h-auto w-[min(148vw,86rem)] max-w-none select-none"
          style={{
            mixBlendMode: "screen",
            /* the close pass is drawn wider than the rendered frame, so the clip is held large
               enough to cover the viewport while the dragon flies and only eases down to fit
               once the crest locks — the wings leave the screen instead of the frame */
            animation: `intro-frame ${RUNTIME}ms cubic-bezier(.16,1,.3,1) both`,
            animationPlayState: live ? "running" : "paused",
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
