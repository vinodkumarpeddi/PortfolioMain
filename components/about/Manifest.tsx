"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { profile } from "@/data/profile";

const lines: Array<[string, string | string[]]> = [
  ["name", profile.name],
  ["role", `${profile.role} @ ${profile.company}`],
  ["location", profile.location],
  ["focus", ["full-stack products", "backend systems", "distributed systems"]],
  ["stack", ["node", "typescript", "postgres", "redis", "rabbitmq", "react", "next", "docker"]],
  ["patterns", ["idempotency", "outbox", "queues", "rbac", "retries"]],
  ["learning", ["gitops & kubernetes", "smart-contract systems", "applied ml pipelines"]],
  ["principle", "design the failure path first"],
];

/** An engineering "manifest" — the about visual, typed in line by line. */
export function Manifest() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const rows = el.querySelectorAll(".mf-row");
        gsap.from(rows, {
          opacity: 0,
          x: -8,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
        gsap.to(el.querySelector(".mf-cursor"), { opacity: 0, repeat: -1, yoyo: true, duration: 0.55, ease: "steps(1)" });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="h-full rounded-3xl bg-bg-0/70" aria-label="Profile manifest">
      <div className="flex items-center justify-between border-b border-line-1 px-4 py-3">
        <span className="label text-fg-3">profile.manifest.yaml</span>
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-fg-3/40" />
          <span className="h-2 w-2 rounded-full bg-fg-3/40" />
          <span className="h-2 w-2 rounded-full bg-accent/70" />
        </span>
      </div>
      <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] leading-[1.7] text-fg-2 sm:p-5 sm:text-[13px]">
        {lines.map(([k, v]) => (
          <div key={k} className="mf-row flex gap-3">
            <span className="w-6 shrink-0 select-none text-right text-fg-3/60">{String(lines.findIndex(([kk]) => kk === k) + 1).padStart(2, "0")}</span>
            <span>
              <span className="text-accent">{k}</span>
              <span className="text-fg-3">: </span>
              {Array.isArray(v) ? (
                <span>
                  <span className="text-fg-3">[</span>
                  {v.map((item, i) => (
                    <span key={item}>
                      <span className="text-fg-1">{item}</span>
                      {i < v.length - 1 && <span className="text-fg-3">, </span>}
                    </span>
                  ))}
                  <span className="text-fg-3">]</span>
                </span>
              ) : (
                <span className="text-fg-1">&quot;{v}&quot;</span>
              )}
            </span>
          </div>
        ))}
        <div className="mf-row flex gap-3">
          <span className="w-6 shrink-0 text-right text-fg-3/60">{String(lines.length + 1).padStart(2, "0")}</span>
          <span className="mf-cursor inline-block h-[1.1em] w-[0.6em] translate-y-[3px] bg-accent" aria-hidden />
        </div>
      </pre>
    </div>
  );
}
