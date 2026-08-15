"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/ui/Section";
import { ArrowUpRight, GitHub, LinkedIn, XLogo, Mail } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { HeroState } from "@/components/three/HeroObject";

const rows = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, Icon: Mail, cursor: "Contact" },
  { label: "GitHub", value: profile.socials[0].handle, href: profile.socials[0].href, Icon: GitHub, cursor: "GitHub ↗" },
  { label: "LinkedIn", value: profile.socials[1].handle, href: profile.socials[1].href, Icon: LinkedIn, cursor: "Open ↗" },
  { label: "X", value: profile.socials[2].handle, href: profile.socials[2].href, Icon: XLogo, cursor: "Open ↗" },
];

export function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const coreState = useRef<HeroState>({ spread: 0.3, opacity: 1 });

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
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: q(".ct-head")[0], start: "top 95%", end: "top 35%", scrub: 0.8 },
          },
        );
        gsap.fromTo(
          coreState.current,
          { spread: 1 },
          { spread: 0.15, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom bottom", scrub: 1 } },
        );
        gsap.fromTo(
          q(".ct-glow"),
          { scale: 1.6, opacity: 0.9 },
          { scale: 0.6, opacity: 0.25, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom bottom", scrub: 1 } },
        );
        gsap.from(q(".ct-row"), {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: q(".ct-rows")[0], start: "top 85%", once: true },
        });
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
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52vw] opacity-80 lg:block motion-reduce:hidden" aria-hidden>
        <HeroCanvas stateRef={coreState} ambient className="absolute inset-0" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--bg-current)] to-transparent" />
      </div>
      <div className="gutter relative mx-auto max-w-[100rem] pb-24 pt-[var(--spacing-section)]">
        <SectionLabel index="07">Connect</SectionLabel>

        <h2 id="contact-title" className="ct-head text-display mt-10 uppercase text-fg-1">
          <span className="ct-line block">Let&apos;s build</span>
          <span className="ct-line block text-fg-2">something</span>
          <span className="ct-line block">
            that lasts<span className="text-accent">.</span>
          </span>
        </h2>

        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="max-w-[40ch] text-lead text-fg-2">
              Currently a software engineer at {profile.company}. Always up for a conversation about systems, products, and the
              hard parts in between.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic strength={7}>
                <button
                  type="button"
                  onClick={copy}
                  data-cursor={copied ? "Copied" : "Copy"}
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-fg-1 pl-5 pr-4 text-sm font-medium text-accent-ink transition-colors hover:bg-white active:scale-[0.97]"
                  aria-live="polite"
                >
                  <span>{copied ? "Copied to clipboard" : profile.email}</span>
                  <span className={cn("grid h-4 w-4 place-items-center transition-transform duration-[var(--duration-base)]", copied && "scale-110")} aria-hidden>
                    {copied ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="11" height="11" rx="2" />
                        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                      </svg>
                    )}
                  </span>
                </button>
              </Magnetic>
              <Magnetic strength={7}>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-sm font-medium text-fg-1 transition-colors hover:border-fg-1/60"
                  data-cursor="Resume ↗"
                >
                  Resume
                  <ArrowUpRight className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
            </div>
          </div>

          <ul className="ct-rows col-span-12 border-t border-line-1 lg:col-span-7 lg:col-start-6" aria-label="Contact links">
            {rows.map(({ label, value, href, Icon, cursor }) => (
              <li key={label} className="ct-row border-b border-line-1">
                <a
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  data-cursor={cursor}
                  className="group flex items-center gap-5 py-5 transition-colors sm:py-6"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-1 text-fg-2 transition-colors group-hover:border-line-2 group-hover:text-fg-1">
                    <Icon width={16} height={16} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="label text-fg-3">{label}</span>
                    <span className="text-h3 text-fg-1 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                      {value}
                    </span>
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
