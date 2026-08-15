"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

const KEY = "vk-intro-seen";
const FLIGHT = 5200; // the dragon arrives, breathes, takes the V and locks
const HOLD = 400; // the finished crest holds before handing over
const EMBERS = [-16, -7, 4, 12, 20, -22, 9, 16];

/* Survives React's development double-effect: the first pass claims the session and starts the
   clock, the second re-arms against the time already elapsed instead of bailing out. */
let startedAt: number | null = null;

/**
 * Cinematic splash: the dragon comes out of the dark, banks past the camera, breathes,
 * dives onto the V and locks as the crest — then hands over to the page beneath it.
 *
 * Every beat is a CSS animation on transform/opacity/clip-path/filter, so the sequence runs on the
 * compositor and React renders exactly twice (start, end). Shows once per session; reduced motion
 * gets the finished crest with a 300ms fade instead.
 */
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

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
    const total = reduced ? 700 : FLIGHT + HOLD;
    const left = total - (Date.now() - startedAt);
    if (left <= 0) return;

    document.documentElement.classList.add("intro-lock");
    const t0 = window.setTimeout(() => setShow(true), 0);
    const t1 = window.setTimeout(() => setLeaving(true), left);
    const t2 = window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove("intro-lock");
    }, left + 600);
    return () => {
      [t0, t1, t2].forEach(window.clearTimeout);
      document.documentElement.classList.remove("intro-lock");
    };
  }, [reduced]);

  if (!show) return null;
  const d = (ms: number) => `${ms}ms`;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[110] grid place-items-center overflow-hidden bg-[#050505] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
      style={{ opacity: leaving ? 0 : 1, transform: leaving ? "scale(0.96)" : "scale(1)" }}
    >
      {/* background haze — the only thing that says "space" without drawing a world */}
      <span
        className="cine-haze pointer-events-none absolute h-[120vmin] w-[120vmin] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(233,162,59,.10), rgba(5,5,5,0) 62%)",
          animation: `cine-haze ${d(FLIGHT)} cubic-bezier(.16,1,.3,1) both`,
        }}
      />
      {/* the flash of the close pass */}
      <span
        className="cine-flash pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 45% at 62% 34%, rgba(232,84,28,.30), transparent 70%)",
          animation: `cine-flash ${d(FLIGHT)} linear both`,
        }}
      />

      {/* camera */}
      <div
        className="cine-camera relative grid place-items-center"
        style={{ animation: `cine-camera ${d(FLIGHT)} cubic-bezier(.16,1,.3,1) both` }}
      >
        {/* flight path */}
        <div
          className="cine-flight relative h-[min(78vw,30rem)] w-[min(78vw,30rem)] sm:h-[min(60vw,34rem)] sm:w-[min(60vw,34rem)] lg:h-[42rem] lg:w-[42rem]"
          style={{ animation: `cine-flight ${d(FLIGHT)} cubic-bezier(.33,.02,.2,1) both` }}
        >
          {/* speed blur, gone before the lock */}
          <div className="cine-blur h-full w-full" style={{ animation: `cine-blur ${d(FLIGHT)} linear both` }}>
            {/* wings, held folded through the flight */}
            <div
              className="cine-wings h-full w-full origin-center"
              style={{ animation: `cine-wings ${d(FLIGHT)} cubic-bezier(.2,.9,.25,1) both` }}
            >
              {/* the crest resolves bottom-up, so the V is the last thing to arrive */}
              <div
                className="cine-reveal relative h-full w-full"
                style={{ animation: `cine-reveal ${d(FLIGHT)} cubic-bezier(.16,1,.3,1) both` }}
              >
                <Image
                  src="/brand/dragon.png"
                  alt=""
                  width={1024}
                  height={1024}
                  priority
                  className="h-full w-full select-none object-contain"
                />
                {/* fire, revealed out of the muzzle and then kept alive */}
                <div
                  className="cine-fire absolute inset-0"
                  style={{ animation: `cine-fire-in ${d(FLIGHT)} cubic-bezier(.16,1,.3,1) both, cine-fire-live 2.4s ${d(FLIGHT)} ease-in-out infinite` }}
                >
                  <Image src="/brand/dragon.png" alt="" width={1024} height={1024} className="h-full w-full select-none object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* the eye: first light in the dark, then a living glow */}
          <span
            className="cine-eye pointer-events-none absolute h-10 w-10 rounded-full bg-[#e9a23b] blur-md"
            style={{
              left: "58%",
              top: "17%",
              animation: `cine-eye-spark 900ms ease-out both, cine-eye-live 2.6s 3.4s ease-in-out infinite`,
            }}
          />
          {/* the fire throwing light back on the muzzle */}
          <span
            className="cine-heat pointer-events-none absolute h-[38%] w-[38%] rounded-full blur-2xl"
            style={{
              left: "52%",
              top: "8%",
              background: "radial-gradient(circle, rgba(255,224,138,.55), rgba(232,84,28,.35) 45%, transparent 70%)",
              animation: `cine-heat ${d(FLIGHT)} ease-out both`,
            }}
          />
          {/* the glow that says the V has landed */}
          <span
            className="cine-v-glow pointer-events-none absolute h-[26%] w-[26%] rounded-full blur-2xl"
            style={{
              left: "37%",
              top: "52%",
              background: "radial-gradient(circle, rgba(233,162,59,.5), transparent 70%)",
              animation: `cine-v-glow ${d(FLIGHT)} ease-out both`,
            }}
          />
          {/* embers escaping the final breath */}
          {EMBERS.map((x, i) => (
            <span
              key={i}
              className="cine-ember pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-[#ffe08a]"
              style={
                {
                  left: `${66 + (i % 4) * 4}%`,
                  top: `${24 + (i % 3) * 5}%`,
                  "--ex": `${x}px`,
                  animation: `cine-ember ${1400 + i * 90}ms ${4150 + i * 70}ms ease-out both`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      <p
        className="cine-fade-in absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] label text-fg-3"
        style={{ animation: `cine-simple 600ms ${reduced ? 0 : 4600}ms ease-out both` }}
      >
        {profile.name} · {profile.role}
      </p>
    </div>
  );
}
