"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { profile } from "@/data/profile";

const KEY = "vk-intro-seen";
const START_WAIT = 2000; // how long the clip gets to start before we stop waiting for it
const STILL_HOLD = 1200; // how long the static crest sits when it stands in
const HARD_CAP = 5000; // nothing hides the page for longer than this, whatever happens
const FADE = 600;

/**
 * Splash: the crest spreads its wings, breathes, locks, and hands over to the page beneath it.
 *
 * The markup is server-rendered and the clip carries `autoplay`, so the overlay is painted in
 * the first frame and the dragon is already moving before this component hydrates — the page
 * underneath is never on screen first. Which state a load is in was decided before the body was
 * parsed, by the boot script in the layout, and is carried on <html>; this component reads that
 * class rather than sessionStorage so it agrees with what was already painted.
 *
 * Timing follows the clip rather than a fixed schedule — a wall-clock timer will happily run its
 * full length over a video that never started, which shows a frozen first frame and then clears.
 * So the sequence ends on `ended`, and anything that cannot start within START_WAIT hands over
 * to the static crest instead.
 */
export function Preloader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const playing = useRef(false);
  const stalled = useRef(false);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setLeaving(true);
    timers.current.push(
      window.setTimeout(() => {
        setGone(true);
        const root = document.documentElement;
        root.classList.remove("intro-lock");
        root.classList.add("intro-done");
      }, FADE),
    );
  }, []);

  /* the clip is out — reduced motion, or it never started: drop it so it stops pulling bytes,
     show the crest, hold, hand over. More than one route leads here, so it runs once. */
  const stall = useCallback(() => {
    if (stalled.current) return;
    stalled.current = true;
    const v = video.current;
    if (v?.src) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    document.documentElement.classList.add("intro-still");
    timers.current.push(window.setTimeout(dismiss, STILL_HOLD));
  }, [dismiss]);

  useEffect(() => {
    const root = document.documentElement;
    const v = video.current;

    /* Already played this session. CSS took the overlay off screen before the first paint, so
       this only has to tidy up: stop the clip and drop the markup on the next tick. */
    if (root.classList.contains("intro-done")) {
      v?.removeAttribute("src");
      v?.load();
      const id = window.setTimeout(() => setGone(true), 0);
      return () => window.clearTimeout(id);
    }

    root.classList.add("intro-lock");
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode — just play it */
    }

    const t = timers.current;
    const begin = () => {
      if (root.classList.contains("intro-still")) {
        stall();
        return;
      }
      /* autoplay may have run the whole clip already if hydration was slow enough */
      if (v?.ended) {
        dismiss();
        return;
      }
      if (v && !v.paused && v.currentTime > 0) playing.current = true;
      else v?.play().catch(stall);
      t.push(window.setTimeout(() => !playing.current && stall(), START_WAIT));
      t.push(window.setTimeout(dismiss, HARD_CAP));
    };

    /* Opened in a background tab, the clip cannot decode and the whole intro would burn down
       before anyone looked at it. Hold it until the tab is actually on screen. */
    if (!document.hidden) begin();
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      /* autoplay does not wait for the gate: the clip will have run a little, and been suspended,
         before anyone looked at the tab. Rewind so the entrance is not clipped. */
      if (v && !v.ended) v.currentTime = 0;
      begin();
    };
    if (document.hidden) document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      t.forEach(window.clearTimeout);
      timers.current = [];
      root.classList.remove("intro-lock");
    };
  }, [dismiss, stall]);

  useEffect(() => {
    if (gone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gone, dismiss]);

  if (gone) return null;

  return (
    <div className="splash" data-leaving={leaving || undefined} onClick={dismiss}>
      <video
        ref={video}
        aria-hidden
        className="splash-clip"
        src="/brand/intro.mp4"
        poster="/brand/intro-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => {
          playing.current = true;
        }}
        onEnded={dismiss}
        onError={stall}
      />

      <Image
        src="/brand/dragon.png"
        alt=""
        aria-hidden
        width={1024}
        height={1024}
        sizes="(min-width: 640px) 26rem, 74vw"
        className="splash-still"
      />

      <p aria-hidden className="splash-word absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] label text-fg-3">
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
