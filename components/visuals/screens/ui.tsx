import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Shared building blocks for the product screens (design width 1200px). */

export function AppShell({ title, sidebar, header, children, aside, accentTitle }: { title: string; sidebar: ReactNode; header?: ReactNode; children: ReactNode; aside?: ReactNode; accentTitle?: string }) {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-[22px] border border-line-1 bg-[#0c0c0f] text-fg-1 [box-shadow:var(--shadow-soft)]">
      {/* sidebar */}
      <aside className="flex w-[228px] shrink-0 flex-col border-r border-line-1 bg-[#0a0a0d] p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[12px] font-bold text-accent-ink">{title[0]}</span>
          <span className="text-[14px] font-semibold tracking-tight">{title}</span>
          {accentTitle && <span className="ml-auto label rounded-full border border-success/40 px-2 py-1 text-[9px] text-success">{accentTitle}</span>}
        </div>
        <div className="mt-6 flex flex-col gap-1">{sidebar}</div>
        <div className="mt-auto rounded-xl border border-line-1 bg-bg-2/60 p-3">
          <p className="label text-[9.5px] text-fg-3">Demo workspace</p>
          <p className="mt-1 text-[12px] text-fg-2">Sample data · not live</p>
        </div>
      </aside>
      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line-1 px-6">{header}</header>
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-hidden p-6">{children}</main>
          {aside && <aside className="w-[300px] shrink-0 overflow-hidden border-l border-line-1 bg-[#0a0a0d] p-5">{aside}</aside>}
        </div>
      </div>
    </div>
  );
}

export function NavItem({ children, active, icon }: { children: ReactNode; active?: boolean; icon?: ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]", active ? "bg-fg-1/[0.07] text-fg-1" : "text-fg-2")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "bg-fg-3/60")} />
      {icon}
      {children}
    </div>
  );
}

export function Kpi({ label, value, delta, tone = "neutral", delay = 0 }: { label: string; value: string; delta?: string; tone?: "neutral" | "success" | "warning"; delay?: number }) {
  return (
    <div className="vis-fade rounded-2xl border border-line-1 bg-bg-2/60 p-4" style={{ animationDelay: `${delay}ms` }}>
      <p className="label text-[9.5px] text-fg-3">{label}</p>
      <p className="mt-2 text-[24px] font-semibold tracking-tight tabular-nums">{value}</p>
      {delta && <p className={cn("mt-1 font-mono text-[11px]", tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-fg-3")}>{delta}</p>}
    </div>
  );
}

export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "error" | "accent"; className?: string }) {
  const tones = {
    neutral: "border-line-2 text-fg-2",
    success: "border-success/40 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-warning",
    error: "border-error/40 bg-error/10 text-error",
    accent: "border-accent/50 bg-accent-soft text-accent",
  };
  return <span className={cn("label inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9.5px]", tones[tone], className)}>{children}</span>;
}

/** Smooth area chart drawn from values (0..100). */
export function AreaChart({ values, height = 150, className }: { values: number[]; height?: number; className?: string }) {
  const w = 100;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, 100 - v] as const);
  const path = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("w-full", className)} style={{ height }} aria-hidden>
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9a23b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e9a23b" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(241,239,233,0.06)" strokeWidth="0.4" />
      ))}
      <path d={`${path} L100 100 L0 100 Z`} fill="url(#area-fill)" className="vis-fade" style={{ animationDelay: "600ms" }} />
      <path d={path} fill="none" stroke="#e9a23b" strokeWidth="1.1" vectorEffect="non-scaling-stroke" pathLength={1} className="vis-draw" />
    </svg>
  );
}

export function Bars({ values, accent, className, height = 120 }: { values: number[]; accent?: number; className?: string; height?: number }) {
  return (
    <div className={cn("flex w-full items-end gap-2", className)} style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <span key={i} className={cn("vis-bar w-full rounded-[3px]", i === accent ? "bg-accent" : "bg-fg-1/[0.14]")} style={{ height: `${v}%`, animationDelay: `${300 + i * 60}ms` }} />
      ))}
    </div>
  );
}

export function Row({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={cn("vis-fade grid items-center gap-3 border-t border-line-1 py-3 text-[12.5px]", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
