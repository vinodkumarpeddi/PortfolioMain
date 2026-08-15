import { AppShell, NavItem, Pill } from "./ui";

const transcript = [
  { q: "Explain your understanding of RESTful APIs and how you would interact with them from a React application.", rating: 6 },
  { q: "What are the key differences between state and props in React, and when would you use each?", rating: 8 },
  { q: "How would you handle authentication in a Next.js app?", rating: 7 },
];

export function GrillBotScreen() {
  return (
    <AppShell
      title="GrillBot"
      accentTitle="AI interviewer"
      url="grillbot.vercel.app · interview"
      sidebar={
        <>
          <NavItem>Dashboard</NavItem>
          <NavItem active>Interview</NavItem>
          <NavItem>Questions</NavItem>
          <NavItem>Feedback</NavItem>
          <NavItem>Upgrade</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium">Full stack developer · React · 0–2 yrs</span>
            <Pill tone="accent">gemini</Pill>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="success">recording</Pill>
            <span className="font-mono text-[11px] text-fg-3">Q 2 / 5</span>
          </div>
        </>
      }
      aside={
        <>
          <p className="label text-[9.5px] text-fg-3">Feedback</p>
          <div className="mt-3 rounded-xl border border-line-1 bg-bg-2/60 p-3">
            <p className="label text-[9.5px] text-fg-3">Overall rating</p>
            <p className="mt-1 text-[26px] font-semibold tracking-tight">7.2<span className="text-[14px] text-fg-3">/10</span></p>
            <div className="mt-2 flex gap-1">
              {[1, 1, 1, 1, 1, 1, 1, 0.2, 0.2, 0.2].map((o, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-accent" style={{ opacity: o }} />
              ))}
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {transcript.map((t, i) => (
              <li key={i} className="vis-fade rounded-xl border border-line-1 bg-bg-2/60 p-3" style={{ animationDelay: `${500 + i * 120}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="label text-[9.5px] text-fg-3">Question {i + 1}</span>
                  <span className={`font-mono text-[11px] ${t.rating >= 7 ? "text-success" : "text-warning"}`}>{t.rating}/10</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-fg-2">{t.q}</p>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-5">
          <p className="label text-[9.5px] text-fg-3">Question 2</p>
          <p className="mt-3 text-[18px] font-medium leading-snug text-fg-1">{transcript[1].q}</p>
          <div className="mt-5 rounded-xl border border-line-1 bg-[#0a0a0d] p-4">
            <p className="label text-[9.5px] text-fg-3">Your answer · transcribing</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-fg-2">
              Props are read-only inputs passed from a parent; state is owned by the component and changes over time. I use props for configuration and state for things the component itself controls, like a form value or an open/closed toggle…
              <span className="vis-cursor ml-1" />
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-lg bg-fg-1 px-3 py-1.5 text-[11px] font-semibold text-accent-ink">Submit answer</span>
            <span className="rounded-lg border border-line-2 px-3 py-1.5 text-[11px] text-fg-2">Skip</span>
            <span className="ml-auto font-mono text-[10.5px] text-fg-3">01:42</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-1 bg-[#0a0a0d]">
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(233,162,59,0.16),transparent_70%)]" />
            <div className="absolute left-1/2 top-[38%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-2 bg-fg-1/[0.06]" />
            <div className="absolute left-1/2 top-[74%] h-16 w-28 -translate-x-1/2 -translate-y-1/2 rounded-t-[40px] border border-line-2 bg-fg-1/[0.05]" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-bg-1/80 px-2 py-1 font-mono text-[9.5px] text-fg-2"><span className="h-1.5 w-1.5 rounded-full bg-error" /> REC</div>
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <span className="rounded-md border border-line-2 bg-bg-1/80 px-2 py-1 font-mono text-[9.5px] text-fg-2">cam on</span>
              <span className="rounded-md border border-line-2 bg-bg-1/80 px-2 py-1 font-mono text-[9.5px] text-fg-2">mic on</span>
            </div>
          </div>
          <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
            <p className="label text-[9.5px] text-fg-3">Session</p>
            <ul className="mt-2 space-y-1.5 font-mono text-[10.5px] text-fg-2">
              <li>role · full stack developer</li>
              <li>stack · react, node, mongodb</li>
              <li>questions · generated by Gemini</li>
              <li>auth · OAuth + JWT</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
