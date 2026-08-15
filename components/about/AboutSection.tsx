import { Suspense } from "react";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { Manifest } from "./Manifest";
import { GitHubPanel } from "./GitHubPanel";
import { Notes } from "./Notes";
import { CardFan, type FanCard } from "./CardFan";
import { certifications, education } from "@/data/experience";
import { profile } from "@/data/profile";
import { technologies } from "@/data/technology";
import { ArrowUpRight } from "@/components/ui/Icons";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { LocalTime } from "@/components/ui/LocalTime";
import { Marquee } from "@/components/ui/Marquee";

const services = [
  {
    title: "Backend & distributed systems",
    body: "Payments, event pipelines, tenant-scoped platforms. Idempotency keys, outbox tables, durable queues, RBAC — the patterns that keep a system correct when a message arrives twice or a process dies mid-write. Node.js, TypeScript, PostgreSQL, Redis, RabbitMQ.",
  },
  {
    title: "Full-stack products",
    body: "React and Next.js on top of those systems: checkouts, dashboards, admin tools, a mobile companion. Fast first paint, keyboard-friendly, honest loading states — the product should feel lighter than the machinery underneath it.",
  },
  {
    title: "Reliability & platform",
    body: "Containerised, documented, observable. Health checks, structured logs, one command from clone to running, and on-call workflows that keep incidents short — the same discipline I bring to uptime monitoring at EverUptime.",
  },
];

const cards: FanCard[] = [
  {
    id: "now",
    label: "Now",
    title: `${profile.role} at ${profile.company}`,
    body: (
      <>
        Reliability and observability, day to day. Before that: full-stack and ServiceNow internships, and a run of production-shaped systems on GitHub.
        <a href={profile.companyUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1 text-fg-1"><span className="link-underline">About the company</span> <ArrowUpRight /></a>
      </>
    ),
  },
  {
    id: "education",
    label: "Education",
    title: education[0].org,
    body: (
      <ul className="space-y-3">
        {education.map((e) => (
          <li key={e.org}>
            <span className="block text-fg-1">{e.program}</span>
            <span className="label mt-1 block text-fg-3">{e.org.split(",")[0]} · {e.period} · {e.note}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "certs",
    label: "Certifications",
    title: "ServiceNow CSA · CAD · Micro",
    body: (
      <ul className="space-y-1.5">
        {certifications.slice(1).map((c) => (
          <li key={c.issuer}>
            <span className="text-fg-1">{c.issuer}</span> <span className="text-fg-3">· {c.items.join(" · ")}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "dsa",
    label: "Problem solving",
    title: "300+ LeetCode · 100+ GfG",
    body: (
      <span className="flex flex-wrap gap-2">
        {profile.codingProfiles.map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="label inline-flex min-h-11 items-center gap-1 rounded-full border border-line-1 px-3.5 text-fg-2 transition-colors hover:border-line-2 hover:text-fg-1">{c.label} <ArrowUpRight /></a>
        ))}
      </span>
    ),
  },
  {
    id: "principles",
    label: "How I work",
    title: "Design the failure path first.",
    body: (
      <ul className="space-y-1.5">
        <li>One command from clone to running.</li>
        <li>The README is part of the system.</li>
        <li>Make it boring underneath, effortless on top.</li>
      </ul>
    ),
  },
];

const stackA = technologies.filter((t) => ["frontend", "backend"].includes(t.branch)).map((t) => t.name);
const stackB = technologies.filter((t) => ["data", "infrastructure", "systems"].includes(t.branch)).map((t) => t.name);

export function AboutSection() {
  return (
    <section id="about" data-section="about" className="relative" aria-labelledby="about-title">
      <div className="gutter relative mx-auto max-w-[100rem] py-[var(--spacing-section)]">
        <SectionNumeral>06</SectionNumeral>
        <Reveal>
          <SectionLabel index="06">About</SectionLabel>
        </Reveal>

        <div className="mt-6 grid grid-cols-12 gap-x-4 gap-y-12 lg:gap-x-8">
          {/* statement + readouts */}
          <div className="col-span-12 lg:col-span-6">
            <h2 id="about-title" className="text-h1 max-w-[14ch] text-balance text-fg-1">
              <SplitText by="words">Boring underneath. Effortless on top.</SplitText>
            </h2>
            <Reveal delay={0.15} className="mt-8 max-w-[54ch] space-y-5">
              <p className="text-lead text-fg-2">
                Most of what I build lives below the surface — the ledger that has to balance, the queue that has to drain, the permission check that has to hold.
                I&apos;ve spent the last few years learning exactly how those pieces fail: duplicate messages, half-finished writes, retries that double-charge.
                So I design the failure path first, write it down, and put a product on top that never has to think about it.
              </p>
              <p className="text-[15px] leading-relaxed text-fg-2">
                Today I&apos;m a Software Engineer at{" "}
                <a href={profile.companyUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-fg-1">EverUptime</a>, working on incident management and uptime monitoring —
                software whose entire job is to notice when other software breaks. Before that: a ServiceNow internship, a full-stack internship at Technical Hub, and a run of
                production-shaped systems on GitHub — a payment orchestrator, an event-driven analytics pipeline, a multi-tenant SaaS platform.
              </p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8 divide-y divide-line-1 border-t border-line-1 sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-6 sm:divide-y-0 sm:pt-6">
              <div className="flex items-baseline justify-between gap-4 py-3.5 sm:block sm:py-0">
                <p className="label shrink-0 text-fg-3">Local time</p>
                <p className="flex items-baseline gap-1.5 sm:mt-2 sm:gap-2"><LocalTime className="text-[17px] font-medium tabular-nums text-fg-1 sm:text-h3" /><span className="label text-fg-3">IST</span></p>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5 sm:block sm:py-0">
                <p className="label shrink-0 text-fg-3">Based in</p>
                <p className="text-right text-[17px] font-medium text-fg-1 sm:mt-2 sm:text-left sm:text-h3">{profile.location}</p>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5 sm:block sm:py-0">
                <p className="label shrink-0 text-fg-3">Now</p>
                <p className="flex items-center gap-2 text-[17px] font-medium text-fg-1 sm:mt-2 sm:text-h3">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  {profile.company}
                </p>
              </div>
            </Reveal>
          </div>

          {/* card fan */}
          <div className="col-span-12 lg:col-span-6">
            <Reveal amount={0.2}>
              <p className="label mb-4 flex items-center justify-between text-fg-3 lg:justify-end">
                <span className="hidden lg:inline">Hover to fan · click to flip forward</span>
                <span className="lg:hidden">Tap a card to expand</span>
              </p>
              <CardFan cards={cards} />
            </Reveal>
          </div>
        </div>

        {/* stack marquee */}
        <Reveal className="mt-20 border-y border-line-1 py-5" amount={0.3}>
          <Marquee items={stackA.map((s) => <span key={s} className="text-h3 whitespace-nowrap text-fg-1">{s}</span>)} />
          <Marquee className="mt-3 [&_.marquee-track]:[animation-direction:reverse]" items={stackB.map((s) => <span key={s} className="text-h3 whitespace-nowrap text-fg-2">{s}</span>)} />
        </Reveal>

        {/* manifest + github */}
        <div className="mt-16 grid grid-cols-12 gap-x-4 gap-y-8 lg:gap-x-8">
          <Reveal className="col-span-12 lg:col-span-6" amount={0.2}>
            <div className="h-full overflow-hidden rounded-3xl border border-line-1 bg-bg-2/40 [box-shadow:var(--shadow-soft)]">
              <Manifest />
            </div>
          </Reveal>
          <Reveal className="col-span-12 lg:col-span-6" amount={0.2}>
            <div className="h-full overflow-hidden rounded-3xl border border-line-1 bg-bg-2/40 [box-shadow:var(--shadow-soft)]">
              <Suspense fallback={<div className="h-[26rem]" />}>
                <GitHubPanel />
              </Suspense>
            </div>
          </Reveal>
        </div>

        {/* what I do — numbered rows */}
        <div className="mt-24" aria-labelledby="services-title">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-fg-3">What I do</p>
              <h3 id="services-title" className="text-h2 mt-3 max-w-[22ch] text-fg-1">Three kinds of work I keep coming back to.</h3>
            </div>
          </Reveal>
          <ol className="mt-8 border-t border-line-1">
            {services.map((s, i) => (
              <li key={s.title} className="group border-b border-line-1 transition-colors duration-[var(--duration-base)] hover:bg-fg-1/[0.02] active:bg-fg-1/[0.04]">
                <div className="grid grid-cols-12 items-baseline gap-x-6 py-7 sm:py-9">
                  <span className="label col-span-12 text-accent sm:col-span-1">0{i + 1}</span>
                  <h4 className="text-h2 col-span-12 mt-2 text-fg-1 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:translate-x-2 sm:col-span-6 sm:mt-0">{s.title}</h4>
                  <p className="col-span-12 mt-3 max-w-[48ch] text-[15px] leading-relaxed text-fg-2 sm:col-span-5 sm:col-start-8 sm:mt-0">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Notes />
      </div>
    </section>
  );
}
