import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Shared building blocks for the product screens (design width 1200px). */

/**
 * A screen theme overrides the portfolio's design tokens inside the app shell,
 * so each product reads as its own brand (light or dark) rather than the portfolio.
 */
export type ScreenTheme = {
  bg: string; // page background
  panel: string; // sidebar / chrome / inset panels
  surface: string; // cards
  text: string;
  muted: string;
  faint: string;
  line: string;
  lineStrong: string;
  primary: string;
  primaryInk: string;
  primarySoft: string;
  success: string;
  warning: string;
  danger: string;
  sidebarGradient?: string;
};

export const themes = {
  stripe: { bg: "#f6f7fb", panel: "#ffffff", surface: "#ffffff", text: "#0f172a", muted: "#475569", faint: "#94a3b8", line: "rgba(15,23,42,0.08)", lineStrong: "rgba(15,23,42,0.16)", primary: "#635bff", primaryInk: "#ffffff", primarySoft: "rgba(99,91,255,0.10)", success: "#16a34a", warning: "#d97706", danger: "#dc2626" },
  observability: { bg: "#0b1220", panel: "#0e172a", surface: "#111c33", text: "#e6edf7", muted: "#93a4c3", faint: "#5b6b8c", line: "rgba(148,163,184,0.12)", lineStrong: "rgba(148,163,184,0.24)", primary: "#22d3ee", primaryInk: "#052e3a", primarySoft: "rgba(34,211,238,0.14)", success: "#34d399", warning: "#fbbf24", danger: "#f87171" },
  campus: { bg: "#f3f4f8", panel: "#ffffff", surface: "#ffffff", text: "#111827", muted: "#4b5563", faint: "#9ca3af", line: "rgba(17,24,39,0.08)", lineStrong: "rgba(17,24,39,0.16)", primary: "#2563eb", primaryInk: "#ffffff", primarySoft: "rgba(37,99,235,0.10)", success: "#16a34a", warning: "#f59e0b", danger: "#dc2626", sidebarGradient: "linear-gradient(180deg,#4c1d95 0%,#3b1a8a 100%)" },
  workspace: { bg: "#fafafa", panel: "#ffffff", surface: "#ffffff", text: "#18181b", muted: "#52525b", faint: "#a1a1aa", line: "rgba(24,24,27,0.08)", lineStrong: "rgba(24,24,27,0.16)", primary: "#7c3aed", primaryInk: "#ffffff", primarySoft: "rgba(124,58,237,0.10)", success: "#059669", warning: "#d97706", danger: "#dc2626" },
  grill: { bg: "#fbf7ff", panel: "#ffffff", surface: "#ffffff", text: "#1f1235", muted: "#5b4b7a", faint: "#a394bf", line: "rgba(31,18,53,0.08)", lineStrong: "rgba(31,18,53,0.16)", primary: "#7c3aed", primaryInk: "#ffffff", primarySoft: "rgba(124,58,237,0.12)", success: "#16a34a", warning: "#f59e0b", danger: "#e11d48", sidebarGradient: "linear-gradient(160deg,#6d28d9 0%,#c026d3 60%,#ec4899 100%)" },
} satisfies Record<string, ScreenTheme>;

function themeVars(t: ScreenTheme): CSSProperties {
  return {
    "--color-bg-0": t.panel,
    "--color-bg-1": t.bg,
    "--color-bg-2": t.surface,
    "--color-bg-3": t.surface,
    "--color-fg-1": t.text,
    "--color-fg-2": t.muted,
    "--color-fg-3": t.faint,
    "--color-line-1": t.line,
    "--color-line-2": t.lineStrong,
    "--color-accent": t.primary,
    "--color-accent-ink": t.primaryInk,
    "--color-accent-soft": t.primarySoft,
    "--color-success": t.success,
    "--color-warning": t.warning,
    "--color-error": t.danger,
    "--s-panel": t.panel,
    "--s-sidebar": t.sidebarGradient ?? t.panel,
    "--s-sidebar-text": t.sidebarGradient ? "#ffffff" : t.text,
    "--s-sidebar-muted": t.sidebarGradient ? "rgba(255,255,255,0.72)" : t.muted,
    "--s-sidebar-line": t.sidebarGradient ? "rgba(255,255,255,0.14)" : t.line,
    colorScheme: "light",
  } as CSSProperties;
}

export function AppShell({ title, sidebar, header, children, aside, accentTitle, url, theme, logo }: { title: string; sidebar: ReactNode; header?: ReactNode; children: ReactNode; aside?: ReactNode; accentTitle?: string; url?: string; theme: ScreenTheme; logo?: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-line-1 bg-bg-1 text-fg-1 antialiased [box-shadow:0_30px_80px_-30px_rgba(0,0,0,0.6)]" style={themeVars(theme)}>
      {/* browser chrome */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-line-1 bg-[var(--s-panel)] px-4">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="mx-auto flex h-7 w-[46%] items-center justify-center rounded-md border border-line-1 bg-fg-1/[0.04] font-mono text-[11px] text-fg-2">
          {url ?? "localhost:3000"}
        </span>
        <span className="w-12" />
      </div>
      <div className="relative flex min-h-0 flex-1">

      {/* sidebar */}
      <aside className="flex w-[228px] shrink-0 flex-col p-5 [background:var(--s-sidebar)] [border-right:1px_solid_var(--s-sidebar-line)] [color:var(--s-sidebar-text)]">
        <div className="flex items-center gap-2.5">
          {logo ?? <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[12px] font-bold text-accent-ink">{title[0]}</span>}
          <span className="text-[14px] font-semibold tracking-tight">{title}</span>
          {accentTitle && <span className="ml-auto label rounded-full border px-2 py-1 text-[9px] [border-color:var(--s-sidebar-line)] [color:var(--s-sidebar-muted)]">{accentTitle}</span>}
        </div>
        <div className="mt-6 flex flex-col gap-1">{sidebar}</div>
        <div className="mt-auto rounded-xl p-3 [background:rgba(127,127,127,0.10)] [border:1px_solid_var(--s-sidebar-line)]">
          <p className="label text-[9.5px] [color:var(--s-sidebar-muted)]">Demo workspace</p>
          <p className="mt-1 text-[12px] [color:var(--s-sidebar-text)]">Sample data · not live</p>
        </div>
      </aside>
      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line-1 px-6">{header}</header>
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-hidden p-6">{children}</main>
          {aside && <aside className="w-[300px] shrink-0 overflow-hidden border-l border-line-1 bg-[var(--s-panel)] p-5">{aside}</aside>}
        </div>
      </div>
      </div>
    </div>
  );
}

/** Tiny sparkline for KPI tiles. */
export function Spark({ values, className, up = true }: { values: number[]; className?: string; up?: boolean }) {
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - v}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-8 w-full", className)} aria-hidden>
      <polyline points={pts} fill="none" stroke={up ? "var(--color-success)" : "var(--color-warning)"} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function NavItem({ children, active, icon }: { children: ReactNode; active?: boolean; icon?: ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]", active ? "[background:rgba(127,127,127,0.14)] [color:var(--s-sidebar-text)]" : "[color:var(--s-sidebar-muted)]")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "opacity-60 [background:currentColor]")} />
      {icon}
      {children}
    </div>
  );
}

export function Kpi({ label, value, delta, tone = "neutral", delay = 0, spark }: { label: string; value: string; delta?: string; tone?: "neutral" | "success" | "warning"; delay?: number; spark?: number[] }) {
  return (
    <div className="vis-fade relative overflow-hidden rounded-2xl border border-line-1 bg-bg-2 p-4 [box-shadow:0_1px_2px_rgba(0,0,0,0.04)]" style={{ animationDelay: `${delay}ms` }}>
      <p className="label text-[9.5px] text-fg-3">{label}</p>
      <p className="mt-2 text-[24px] font-semibold tracking-tight tabular-nums">{value}</p>
      {delta && <p className={cn("mt-1 font-mono text-[11px]", tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-fg-3")}>{delta}</p>}
      {spark && <Spark values={spark} up={tone !== "warning"} className="mt-2 opacity-70" />}
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
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(241,239,233,0.06)" strokeWidth="0.4" />
      ))}
      <path d={`${path} L100 100 L0 100 Z`} fill="url(#area-fill)" className="vis-fade" style={{ animationDelay: "600ms" }} />
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" pathLength={1} className="vis-draw" />
    </svg>
  );
}

export function Bars({ values, accent, className, height = 120 }: { values: number[]; accent?: number; className?: string; height?: number }) {
  return (
    <div className={cn("flex w-full items-end gap-2", className)} style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <span key={i} className={cn("vis-bar w-full rounded-[3px]", i === accent ? "bg-accent" : "bg-fg-1/[0.12]")} style={{ height: `${v}%`, animationDelay: `${300 + i * 60}ms` }} />
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
