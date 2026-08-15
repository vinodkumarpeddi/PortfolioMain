import { Suspense } from "react";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { BentoTile as Tile } from "./BentoTile";
import { Manifest } from "./Manifest";
import { GitHubPanel } from "./GitHubPanel";
import { Notes } from "./Notes";
import { certifications, education } from "@/data/experience";
import { profile } from "@/data/profile";
import { technologies } from "@/data/technology";
import { ArrowUpRight } from "@/components/ui/Icons";
import { SectionNumeral } from "@/components/ui/SectionNumeral";
import { LocalTime } from "@/components/ui/LocalTime";
import { Marquee } from "@/components/ui/Marquee";

const services = [
  { title: "Backend systems", body: "APIs, queues, workers and data models built to stay correct under retries, failures and load — payments, event pipelines, tenant-scoped platforms." },
  { title: "Full-stack products", body: "React and Next.js front ends on top of those systems: dashboards, checkouts, admin tools, mobile companions — fast, accessible, considered." },
  { title: "Platform & reliability", body: "Containerised, documented, observable: health checks, structured logs, one command from clone to running, and workflows that keep incidents short." },
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
        <h2 id="about-title" className="text-h1 relative mt-6 max-w-[22ch] text-balance text-fg-1">
          <SplitText by="words">I care about the parts of software you only notice when they break.</SplitText>
        </h2>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
          {/* statement */}
          <Tile span="sm:col-span-2 lg:col-span-2 lg:row-span-2" className="flex flex-col justify-between">
            <p className="text-lead text-fg-1">
              Queues, ledgers, permissions, retries. I like making them boring — and then making the product on top of them feel
              effortless. Full-stack by habit, backend by preference, systems by curiosity.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line-1 pt-6">
              <div>
                <p className="label text-fg-3">Interests</p>
                <ul className="mt-3 space-y-1.5 text-[15px] text-fg-1">
                  <li>Distributed systems</li>
                  <li>Payments infrastructure</li>
                  <li>Event-driven architecture</li>
                  <li>Real-time products</li>
                </ul>
              </div>
              <div>
                <p className="label text-fg-3">How I work</p>
                <ul className="mt-3 space-y-1.5 text-[15px] text-fg-1">
                  <li>Design the failure path first</li>
                  <li>One command from clone to running</li>
                  <li>The README is part of the system</li>
                </ul>
              </div>
            </div>
          </Tile>

          {/* local time */}
          <Tile label="Local time">
            <p className="mt-3 flex items-baseline gap-2">
              <LocalTime className="text-h2 tabular-nums text-fg-1" />
            </p>
            <p className="label mt-2 text-fg-3">IST · UTC+5:30</p>
            <p className="mt-4 text-[15px] text-fg-2">{profile.location}</p>
            <span aria-hidden className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full border border-line-2 opacity-60" />
            <span aria-hidden className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full border border-dashed border-accent/40 [animation:spin-slow_20s_linear_infinite] motion-reduce:animate-none" />
          </Tile>

          {/* now */}
          <Tile label="Now">
            <p className="mt-3 text-h3 text-fg-1">{profile.role}</p>
            <p className="mt-1 text-[15px] text-fg-2">at {profile.company}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-fg-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Reliability &amp; observability
            </p>
            <a href={profile.companyUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-fg-2 transition-colors hover:text-fg-1">
              <span className="link-underline">About the company</span> <ArrowUpRight />
            </a>
          </Tile>

          {/* stack marquee */}
          <Tile span="sm:col-span-2 lg:col-span-2" className="!px-0">
            <p className="label px-6 text-fg-3">Stack</p>
            <div className="mt-4 space-y-3 px-0">
              <Marquee className="px-6" items={stackA.map((s) => <span key={s} className="text-h3 whitespace-nowrap text-fg-1">{s}</span>)} />
              <Marquee className="px-6 [&_.marquee-track]:[animation-direction:reverse]" items={stackB.map((s) => <span key={s} className="text-h3 whitespace-nowrap text-fg-2">{s}</span>)} />
            </div>
            <p className="label mt-4 px-6 text-fg-3">{technologies.length} technologies · tied to real systems in the map above</p>
          </Tile>

          {/* manifest */}
          <Tile span="sm:col-span-2 lg:col-span-2 lg:row-span-2" className="!p-0">
            <Manifest />
          </Tile>

          {/* github */}
          <Tile span="sm:col-span-2 lg:col-span-2 lg:row-span-2" className="!p-0">
            <Suspense fallback={<div className="h-[26rem]" />}>
              <GitHubPanel />
            </Suspense>
          </Tile>

          {/* credentials */}
          <Tile label="Credentials" span="sm:col-span-2 lg:col-span-4">
            <div className="mt-4 grid gap-8 lg:grid-cols-3">
              <div>
                <p className="label text-fg-3">Education</p>
                <ul className="mt-3 divide-y divide-line-1">
                  {education.map((e) => (
                    <li key={e.org} className="py-3 first:pt-0 last:pb-0">
                      <span className="block text-[15px] text-fg-1">{e.org}</span>
                      <span className="text-sm text-fg-2">{e.program}</span>
                      <span className="label mt-1 block text-fg-3">{e.period} · {e.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label text-fg-3">Certifications</p>
                <ul className="mt-3 divide-y divide-line-1">
                  {certifications.map((c) => (
                    <li key={c.issuer} className="py-2.5 first:pt-0 last:pb-0">
                      <span className="block text-sm font-medium text-fg-1">{c.issuer}</span>
                      <span className="block text-[13px] leading-relaxed text-fg-2">{c.items.join(" · ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label text-fg-3">Problem solving</p>
                <p className="mt-3 text-[15px] text-fg-1">300+ problems on LeetCode, 100+ on GeeksforGeeks.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.codingProfiles.map((c) => (
                    <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="label inline-flex items-center gap-1.5 rounded-full border border-line-1 px-3 py-2 text-fg-2 transition-colors hover:border-line-2 hover:text-fg-1">
                      {c.label} <ArrowUpRight />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Tile>
        </RevealGroup>

        {/* what I do — numbered rows */}
        <div className="mt-24" aria-labelledby="services-title">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-fg-3">What I do</p>
              <h3 id="services-title" className="text-h2 mt-3 text-fg-1">Three kinds of work I keep coming back to.</h3>
            </div>
          </Reveal>
          <ol className="mt-8 border-t border-line-1">
            {services.map((s, i) => (
              <li key={s.title} className="group border-b border-line-1 transition-colors duration-[var(--duration-base)] hover:bg-fg-1/[0.02]">
                <div className="grid grid-cols-12 items-baseline gap-x-6 py-7 sm:py-9">
                  <span className="label col-span-2 text-accent sm:col-span-1">0{i + 1}</span>
                  <h4 className="text-h2 col-span-10 text-fg-1 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:translate-x-2 sm:col-span-6">{s.title}</h4>
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
