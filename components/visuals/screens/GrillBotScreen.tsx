import { AppShell, Avatar, Donut, NavItem, Pill, themes } from "./ui";

const questions = [
  { q: "Explain RESTful APIs and how you'd call them from React.", rating: 6, state: "done" },
  { q: "State vs props in React — when do you use each?", rating: 8, state: "done" },
  { q: "How would you handle authentication in a Next.js app?", rating: null, state: "live" },
  { q: "Describe a time you optimised a slow API.", rating: null, state: "next" },
  { q: "How do you structure a MongoDB schema for growth?", rating: null, state: "next" },
];

export function GrillBotScreen() {
  return (
    <AppShell
      theme={themes.grill}
      title="GrillBot"
      accentTitle="Pro"
      url="grillbot.vercel.app/interview/8f3c"
      logo={<span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-[12px] font-bold text-white">G</span>}
      sidebar={
        <>
          <NavItem>Dashboard</NavItem>
          <NavItem active>Mock interview</NavItem>
          <NavItem>Question bank</NavItem>
          <NavItem>Feedback history</NavItem>
          <NavItem>Upgrade</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <Avatar name="Vinod Kumar" size={26} />
            <span className="text-[14px] font-semibold tracking-tight">Full-stack developer · React, Node · 0–2 yrs</span>
            <Pill tone="accent">Gemini 1.5</Pill>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="error">● Recording</Pill>
            <span className="font-mono text-[11px] text-fg-3">Q 3 / 5 · 01:42</span>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-[1.35fr_1fr] gap-4">
        {/* video + question */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#140c26]">
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(192,38,211,0.35),transparent_70%)]" />
            <div className="absolute left-1/2 top-[40%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/10" />
            <div className="absolute left-1/2 top-[82%] h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-t-[60px] border border-white/25 bg-white/10" />
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[10px] text-white"><span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" /> LIVE · you</div>
            <div className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/40 px-2 py-1 font-mono text-[10px] text-white">1080p</div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {["mic", "camera", "share", "end"].map((b) => (
                <span key={b} className={`rounded-full px-3 py-1.5 font-mono text-[10px] ${b === "end" ? "bg-[#e11d48] text-white" : "border border-white/20 bg-black/40 text-white"}`}>{b}</span>
              ))}
            </div>
            <div className="absolute bottom-3 right-3 h-16 w-24 rounded-lg border border-white/20 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(124,58,237,0.5),#1a1030)]" />
          </div>
          <div className="rounded-2xl border border-line-1 bg-bg-2 p-5">
            <p className="text-[10px] uppercase tracking-wider text-fg-3">Question 3 · Authentication</p>
            <p className="mt-2 text-[17px] font-medium leading-snug text-fg-1">How would you handle authentication in a Next.js app?</p>
            <div className="mt-4 rounded-xl bg-bg-1 p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-3">Live transcript</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-2">I&apos;d use an OAuth provider for sign-in and issue a short-lived JWT, then verify it in middleware on protected routes and refresh it server-side… <span className="vis-cursor" /></p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-accent px-3 py-1.5 text-[11.5px] font-semibold text-white">Submit answer</span>
              <span className="rounded-lg border border-line-2 px-3 py-1.5 text-[11.5px] text-fg-2">Skip</span>
              <span className="ml-auto text-[11px] text-fg-3">Answers are scored by Gemini after submit</span>
            </div>
          </div>
        </div>
        {/* right: progress + feedback */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line-1 bg-bg-2 p-4">
            <div className="flex items-center gap-4">
              <Donut size={104} thickness={12} segments={[{ value: 72, color: "var(--color-accent)" }, { value: 28, color: "#e9d5ff" }]} label="7.2" sub="/ 10 so far" />
              <div className="text-[12px]">
                <p className="font-semibold text-fg-1">Session score</p>
                <p className="mt-1 text-fg-2">Strong on fundamentals; go deeper on trade-offs.</p>
                <div className="mt-2 flex gap-1.5"><Pill tone="success">clarity 8</Pill><Pill tone="warning">depth 6</Pill></div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-line-1 bg-bg-2 p-4">
            <p className="text-[13px] font-semibold">Questions</p>
            <ol className="mt-3 space-y-2">
              {questions.map((q, i) => (
                <li key={q.q} className={`vis-fade flex items-start gap-3 rounded-xl border p-3 ${q.state === "live" ? "border-accent/50 bg-accent/5" : "border-line-1"}`} style={{ animationDelay: `${450 + i * 90}ms` }}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${q.state === "done" ? "bg-[#16a34a] text-white" : q.state === "live" ? "bg-accent text-white" : "border border-line-2 text-fg-3"}`}>{q.state === "done" ? "✓" : i + 1}</span>
                  <span className="flex-1 text-[12px] leading-snug text-fg-1">{q.q}</span>
                  {q.rating !== null ? <span className={`font-mono text-[11px] ${q.rating >= 7 ? "text-[#16a34a]" : "text-[#d97706]"}`}>{q.rating}/10</span> : q.state === "live" ? <Pill tone="accent">now</Pill> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
