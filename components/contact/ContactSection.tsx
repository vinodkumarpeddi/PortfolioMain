"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/ui/Section";
import { ArrowUpRight, GitHub, LinkedIn, XLogo, Mail } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { RotatingCta } from "@/components/ui/RotatingCta";
import { Marquee } from "@/components/ui/Marquee";
import { LocalTime } from "@/components/ui/LocalTime";
import { KineticText } from "@/components/ui/KineticText";
import { CurvedDivider } from "@/components/ui/CurvedDivider";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { HeroState } from "@/components/three/HeroObject";
import { cn } from "@/lib/utils";

const rows = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, Icon: Mail, cursor: "Contact" },
  { label: "GitHub", value: profile.socials[0].handle, href: profile.socials[0].href, Icon: GitHub, cursor: "GitHub ↗" },
  { label: "LinkedIn", value: profile.socials[1].handle, href: profile.socials[1].href, Icon: LinkedIn, cursor: "Open ↗" },
  { label: "X", value: profile.socials[2].handle, href: profile.socials[2].href, Icon: XLogo, cursor: "Open ↗" },
];

const ticker = ["Distributed systems", "Payments infrastructure", "Event-driven services", "Multi-tenant platforms", "Real-time products", "Full-stack engineering", "Reliability & observability"];

export function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const coreState = useRef<HeroState>({ spread: 0.3, opacity: 1, energy: 0 });

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          q(".ct-line"),
          { yPercent: 40, opacity: 0, scale: 0.9, transformOrigin: "0% 100%" },
          { yPercent: 0, opacity: 1, scale: 1, ease: "none", stagger: 0.12, scrollTrigger: { trigger: q(".ct-head")[0], start: "top 95%", end: "top 35%", scrub: 0.8 } },
        );
        gsap.fromTo(coreState.current, { spread: 1 }, { spread: 0.15, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom bottom", scrub: 1 } });
        gsap.fromTo(q(".ct-glow"), { scale: 1.6, opacity: 0.9 }, { scale: 0.6, opacity: 0.25, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom bottom", scrub: 1 } });
        gsap.from(q(".ct-cta"), { scale: 0.6, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: q(".ct-cta")[0], start: "top 85%", once: true } });
        gsap.from(q(".ct-row"), { y: 24, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: q(".ct-rows")[0], start: "top 85%", once: true } });
        gsap.from(q(".ct-tile"), { y: 20, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: q(".ct-tiles")[0], start: "top 88%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" ref={ref} data-section="contact" className="relative overflow-hidden" aria-labelledby="contact-title">
      <div aria-hidden className="ct-glow pointer-events-none absolute left-1/2 top-[30%] h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] opacity-70 [mask-image:radial-gradient(60%_60%_at_50%_45%,black,transparent_85%)] motion-reduce:hidden" aria-hidden>
        <HeroCanvas stateRef={coreState} variant="backdrop" className="absolute inset-0" />
      </div>

      <CurvedDivider className="relative h-24 w-full" />
      <div className="gutter relative mx-auto max-w-[100rem] pt-[calc(var(--spacing-section)*0.6)]">
        <SectionLabel index="07">Connect</SectionLabel>

        <div className="mt-10 grid grid-cols-12 items-end gap-x-6 gap-y-10">
          <h2 id="contact-title" className="ct-head text-display-safe col-span-12 uppercase text-fg-1 lg:col-span-9">
            <span className="ct-line block"><KineticText text="Let's build" /></span>
            <span className="ct-line block text-fg-2"><KineticText text="something" /></span>
            <span className="ct-line block"><KineticText text="that lasts." accentLast /></span>
          </h2>
          <div
            className="ct-cta col-span-12 flex lg:col-span-3 lg:justify-end"
            onPointerEnter={() => { coreState.current.energy = 1; }}
            onPointerLeave={() => { coreState.current.energy = 0; }}
          >
            <RotatingCta href={`mailto:${profile.email}`} label="Email Vinod" ring="Email me — Let's talk" cursor="Contact" />
          </div>
        </div>
      </div>

      <div className="gutter relative mx-auto mt-12 max-w-[100rem]">
        <button
          type="button"
          onClick={copy}
          data-cursor={copied ? "Copied" : "Copy"}
          className="group relative inline-flex max-w-full items-center gap-4 text-left"
          aria-label={`Copy email address ${profile.email}`}
        >
          <span className="text-h2 relative truncate text-fg-1 sm:text-h1">
            {profile.email}
            <span aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent transition-transform duration-[var(--duration-slow)] ease-[var(--ease-in-out)] group-hover:scale-x-100" />
          </span>
          <span className={cn("label hidden shrink-0 rounded-full border px-3 py-2 transition-colors sm:inline-flex", copied ? "border-success/50 text-success" : "border-line-2 text-fg-3 group-hover:text-fg-1")}>{copied ? "Copied" : "Click to copy"}</span>
        </button>
      </div>

      {/* ticker */}
      <div className="relative mt-16 border-y border-line-1 py-5">
        <Marquee items={ticker.map((t) => <span key={t} className="text-h3 whitespace-nowrap text-fg-2">{t}</span>)} />
      </div>

      <div className="gutter relative mx-auto max-w-[100rem] pb-24 pt-14">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          {/* left: tiles */}
          <div className="ct-tiles col-span-12 grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Tile label="Local time" className="ct-tile">
              <p className="mt-2 flex items-baseline gap-2">
                <LocalTime className="text-h2 tabular-nums text-fg-1" />
                <span className="label text-fg-3">IST · UTC+5:30</span>
              </p>
              <p className="mt-2 text-sm text-fg-2">{profile.location}</p>
            </Tile>
            <Tile label="Currently" className="ct-tile">
              <p className="mt-2 text-h3 text-fg-1">Software Engineer at {profile.company}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg-2">Always up for a conversation about systems, products, and the hard parts in between.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Magnetic strength={7}>
                  <button
                    type="button"
                    onClick={copy}
                    data-cursor={copied ? "Copied" : "Copy"}
                    className="group inline-flex h-10 items-center gap-2 rounded-full bg-fg-1 pl-4 pr-3 text-[13px] font-medium text-accent-ink transition-colors hover:bg-white active:scale-[0.97]"
                    aria-live="polite"
                  >
                    <span>{copied ? "Copied to clipboard" : "Copy email"}</span>
                    <span className={cn("grid h-4 w-4 place-items-center transition-transform duration-[var(--duration-base)]", copied && "scale-110")} aria-hidden>
                      {copied ? (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
                      )}
                    </span>
                  </button>
                </Magnetic>
                <Magnetic strength={7}>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-[13px] font-medium text-fg-1 transition-colors hover:border-fg-1/60" data-cursor="Resume ↗">
                    Resume <ArrowUpRight className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Magnetic>
              </div>
            </Tile>
          </div>

          {/* right: rows */}
          <ul className="ct-rows col-span-12 border-t border-line-1 lg:col-span-7" aria-label="Contact links">
            {rows.map(({ label, value, href, Icon, cursor }) => (
              <li key={label} className="ct-row border-b border-line-1">
                <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"} data-cursor={cursor} className="group flex items-center gap-5 py-5 transition-colors sm:py-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-1 text-fg-2 transition-colors group-hover:border-line-2 group-hover:text-fg-1">
                    <Icon width={16} height={16} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="label text-fg-3">{label}</span>
                    <span className="truncate text-h3 text-fg-1 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:translate-x-1">{value}</span>
                  </span>
                  <ArrowUpRight className="text-xl text-fg-3 transition-[transform,color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg-1" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line-1 bg-bg-2/50 p-5 backdrop-blur-md [box-shadow:var(--shadow-soft)]", className)}>
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/[0.08] blur-3xl" />
      <p className="label text-fg-3">{label}</p>
      {children}
    </div>
  );
}
