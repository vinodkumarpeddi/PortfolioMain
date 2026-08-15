import { Suspense } from "react";
import { SectionLabel } from "@/components/ui/Section";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Manifest } from "./Manifest";
import { GitHubPanel } from "./GitHubPanel";
import { Notes } from "./Notes";
import { certifications, education } from "@/data/experience";
import { profile } from "@/data/profile";
import { ArrowUpRight } from "@/components/ui/Icons";

const columns = [
  {
    title: "Interests",
    items: ["Distributed systems", "Payments infrastructure", "Event-driven architecture", "Real-time systems", "Developer tooling"],
  },
  {
    title: "Current focus",
    items: ["Reliability and observability at EverUptime", "Production-shaped backend patterns", "Typed, well-documented services"],
  },
  {
    title: "Learning",
    items: ["GitOps and Kubernetes delivery", "Smart-contract systems", "Applied ML pipelines"],
  },
  {
    title: "How I work",
    items: ["Design the failure path first", "One command from clone to running", "The README is part of the system"],
  },
];

export function AboutSection() {
  return (
    <section id="about" data-section="about" className="relative" aria-labelledby="about-title">
      <div className="gutter mx-auto max-w-[100rem] py-[var(--spacing-section)]">
        <Reveal>
          <SectionLabel index="06">About</SectionLabel>
        </Reveal>
        <h2 id="about-title" className="text-h1 mt-6 max-w-[22ch] text-balance text-fg-1">
          <SplitText by="words">I care about the parts of software you only notice when they break.</SplitText>
        </h2>
        <Reveal delay={0.15} className="mt-6 max-w-[60ch]">
          <p className="text-lead text-fg-2">
            Queues, ledgers, permissions, retries. I like making them boring — and then making the product on top of them feel
            effortless. Full-stack by habit, backend by preference, systems by curiosity.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Reveal amount={0.2}>
              <Manifest />
            </Reveal>
          </div>
          <RevealGroup className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-7 lg:pl-8">
            {columns.map((c) => (
              <RevealItem key={c.title}>
                <p className="label text-fg-3">{c.title}</p>
                <ul className="mt-4 space-y-2 border-t border-line-1 pt-4 text-[15px] text-fg-1">
                  {c.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <Reveal amount={0.2}>
              <Suspense fallback={<div className="h-[26rem] rounded-2xl border border-line-1 bg-bg-2/50" />}>
                <GitHubPanel />
              </Suspense>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:pl-8">
            <RevealGroup>
              <RevealItem>
                <p className="label text-fg-3">Education</p>
                <ul className="mt-4 divide-y divide-line-1 border-t border-line-1">
                  {education.map((e) => (
                    <li key={e.org} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                      <span>
                        <span className="block text-[15px] text-fg-1">{e.org}</span>
                        <span className="text-sm text-fg-2">{e.program}</span>
                      </span>
                      <span className="label text-fg-3">
                        {e.period} · {e.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
              <RevealItem className="mt-10">
                <p className="label text-fg-3">Certifications</p>
                <ul className="mt-4 grid grid-cols-1 gap-x-6 border-t border-line-1 sm:grid-cols-2">
                  {certifications.map((c) => (
                    <li key={c.issuer} className="border-b border-line-1 py-3">
                      <span className="block text-sm font-medium text-fg-1">{c.issuer}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-fg-2">{c.items.join(" · ")}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
              <RevealItem className="mt-10">
                <p className="label text-fg-3">Problem solving</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.codingProfiles.map((c) => (
                    <li key={c.label}>
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="label inline-flex items-center gap-1.5 rounded-full border border-line-1 px-3 py-2 text-fg-2 transition-colors hover:border-line-2 hover:text-fg-1">
                        {c.label}
                        {c.note && <span className="text-fg-3">· {c.note}</span>}
                        <ArrowUpRight />
                      </a>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            </RevealGroup>
          </div>
        </div>

        <Notes />
      </div>
    </section>
  );
}
