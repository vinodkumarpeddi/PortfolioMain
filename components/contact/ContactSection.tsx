"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/ui/Section";
import { ArrowUpRight, GitHub, LinkedIn, XLogo, Mail } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { RotatingCta } from "@/components/ui/RotatingCta";
import { ContactForm } from "./ContactForm";
import { Marquee } from "@/components/ui/Marquee";
import { LocalTime } from "@/components/ui/LocalTime";
import { KineticText } from "@/components/ui/KineticText";
import { CurvedDivider } from "@/components/ui/CurvedDivider";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import type { HeroState } from "@/components/three/HeroObject";
import { cn } from "@/lib/utils";

const socials = [
  { label: "GitHub", value: profile.socials[0].handle, href: profile.socials[0].href, Icon: GitHub, cursor: "GitHub ↗" },
  { label: "LinkedIn", value: profile.socials[1].handle, href: profile.socials[1].href, Icon: LinkedIn, cursor: "Open ↗" },
  { label: "X", value: profile.socials[2].handle, href: profile.socials[2].href, Icon: XLogo, cursor: "Open ↗" },
];

const ticker = ["Distributed systems", "Payments infrastructure", "Event-driven services", "Multi-tenant platforms", "Real-time products", "Full-stack engineering", "Reliability & observability"];

export function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
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
        gsap.fromTo(q(".ct-glow"), { scale: 1.5, opacity: 0.9 }, { scale: 0.7, opacity: 0.3, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom bottom", scrub: 1 } });
        gsap.fromTo(coreState.current, { spread: 1 }, { spread: 0.15, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom bottom", scrub: 1 } });
        gsap.from(q(".ct-cta"), { scale: 0.6, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: q(".ct-cta")[0], start: "top 85%", once: true } });
        gsap.from(q(".ct-card"), { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: q(".ct-card")[0], start: "top 85%", once: true } });
        gsap.from(q(".ct-col > *"), { y: 16, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: q(".ct-card")[0], start: "top 80%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const mailHref = `mailto:${profile.email}?subject=${encodeURIComponent("Hello Vinod")}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent("Hello Vinod")}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = mailHref;
    }
  };
  const openForm = () => {
    setFormOpen(true);
    window.setTimeout(() => {
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelector<HTMLInputElement>("#contact-form input")?.focus({ preventScroll: true });
    }, 250);
  };
  const onCta = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openForm();
  };

  return (
    <section id="contact" ref={ref} data-section="contact" className="relative overflow-hidden" aria-labelledby="contact-title">
      <div aria-hidden className="ct-glow pointer-events-none absolute left-1/2 top-[38%] h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-[150px]" />
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(60%_50%_at_50%_30%,black,transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] opacity-80 [mask-image:radial-gradient(60%_60%_at_50%_45%,black,transparent_85%)] motion-reduce:hidden" aria-hidden>
        <HeroCanvas stateRef={coreState} variant="backdrop" className="absolute inset-0" />
      </div>
      <CurvedDivider className="relative h-24 w-full" />

      <div className="gutter relative mx-auto max-w-[100rem] pt-[calc(var(--spacing-section)*0.5)]">
        <SectionLabel index="07">Connect</SectionLabel>

        <div className="mt-8 grid grid-cols-12 items-end gap-x-6 gap-y-8 sm:mt-10 sm:gap-y-10">
          <h2 id="contact-title" className="ct-head text-display-safe col-span-12 uppercase text-fg-1 lg:col-span-9">
            <span className="ct-line block"><KineticText text="Let's build" /></span>
            <span className="ct-line block text-fg-2"><KineticText text="something" /></span>
            <span className="ct-line block"><KineticText text="that lasts." accentLast /></span>
          </h2>
          <div
            className="ct-cta col-span-12 flex justify-center lg:col-span-3 lg:justify-end"
            onPointerEnter={() => { coreState.current.energy = 1; }}
            onPointerLeave={() => { coreState.current.energy = 0; }}
          >
            <RotatingCta href="#contact-form" onClick={onCta} badge={formOpen ? "Open" : undefined} label="Write to Vinod" ring="Write to me — Let's talk" cursor="Write" />
          </div>
        </div>

        {/* structured contact card */}
        <div className="ct-card relative mt-10 overflow-hidden sm:mt-16 rounded-[28px] border border-line-1 bg-bg-2/50 backdrop-blur-xl [box-shadow:var(--shadow-soft)]">
          <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.10] blur-[90px]" />
          <div className="relative grid grid-cols-1 divide-y divide-line-1 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            {/* email */}
            <div className="ct-col p-6 sm:p-8 lg:col-span-5 lg:p-10">
              <p className="label text-fg-3">Email</p>
              <button type="button" onClick={copy} data-cursor={copied ? "Copied" : "Copy"} className="group mt-4 block max-w-full text-left transition-transform active:scale-[0.98]" aria-label={`Copy email address ${profile.email}`}>
                <span className="relative block break-all text-[clamp(1.15rem,1.7vw,1.75rem)] font-semibold leading-tight tracking-[-0.02em] text-fg-1">
                  {profile.email}
                  <span aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent transition-transform duration-[var(--duration-slow)] ease-[var(--ease-in-out)] group-hover:scale-x-100" />
                </span>
                <span className={cn("label mt-3 inline-flex h-11 items-center gap-2 rounded-full border px-4 transition-colors", copied ? "border-success/50 bg-success/10 text-success" : "border-line-2 text-fg-3 group-hover:text-fg-1")}>
                  {copied ? "Copied to clipboard" : "Click to copy"}
                </span>
              </button>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic strength={7}>
                  <button type="button" onClick={openForm} className="group inline-flex h-11 items-center gap-2 rounded-full bg-fg-1 pl-5 pr-4 text-sm font-medium text-accent-ink transition-colors hover:bg-white" data-cursor="Write">
                    Write a message <Mail width={16} height={16} />
                  </button>
                </Magnetic>
                <Magnetic strength={7}>
                  <a href={mailHref} className="group inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-sm font-medium text-fg-1 transition-colors hover:border-fg-1/60" data-cursor="Mail app">
                    Mail app
                  </a>
                </Magnetic>
                <Magnetic strength={7}>
                  <a href={gmailHref} target="_blank" rel="noopener noreferrer" className="group inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-sm font-medium text-fg-1 transition-colors hover:border-fg-1/60" data-cursor="Gmail ↗">
                    Gmail <ArrowUpRight className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Magnetic>
                <Magnetic strength={7}>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-sm font-medium text-fg-1 transition-colors hover:border-fg-1/60" data-cursor="Resume ↗">
                    Resume <ArrowUpRight className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Magnetic>
              </div>
            </div>
            {/* now / time */}
            <div className="ct-col p-6 sm:p-8 lg:col-span-3 lg:p-10">
              <p className="label text-fg-3">Local time</p>
              <p className="mt-3 flex items-baseline gap-2"><LocalTime className="text-h2 tabular-nums text-fg-1" /><span className="label text-fg-3">IST</span></p>
              <p className="mt-1 text-sm text-fg-2">{profile.location}</p>
              <p className="label mt-8 text-fg-3">Currently</p>
              <p className="mt-3 flex items-center gap-2 text-[15px] text-fg-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                {profile.role} at {profile.company}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg-2">Always up for a conversation about systems, products, and the hard parts in between.</p>
            </div>
            {/* socials */}
            <div className="ct-col p-6 sm:p-8 lg:col-span-4 lg:p-10">
              <p className="label text-fg-3">Elsewhere</p>
              <ul className="mt-3 divide-y divide-line-1">
                {socials.map(({ label, value, href, Icon, cursor }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor={cursor} className="group -mx-2 flex min-h-14 items-center gap-4 rounded-2xl px-2 py-4 transition-colors active:bg-fg-1/[0.05]">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-1 text-fg-2 transition-colors group-hover:border-line-2 group-hover:text-fg-1"><Icon width={16} height={16} /></span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="label text-fg-3">{label}</span>
                        <span className="truncate text-[15px] text-fg-1 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:translate-x-1">{value}</span>
                      </span>
                      <ArrowUpRight className="text-lg text-fg-3 transition-[transform,color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ContactForm id="contact-form" open={formOpen} onClose={() => setFormOpen(false)} />
        </div>
      </div>

      {/* ticker */}
      <div className="relative mt-16 border-y border-line-1 py-5">
        <Marquee items={ticker.map((t) => <span key={t} className="text-h3 whitespace-nowrap text-fg-2">{t}</span>)} />
      </div>
      <div className="h-10" />
    </section>
  );
}
