import { cn } from "@/lib/utils";

/* Small domain illustrations for the experience deck (design-only, no claims). */

function Frame({ children, className, caption }: { children: React.ReactNode; className?: string; caption: string }) {
  return (
    <div className={cn("relative h-full min-h-[13rem] overflow-hidden rounded-2xl border border-line-1 bg-[#0a0a0d] p-4", className)} aria-hidden>
      <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_70%_at_50%_30%,black,transparent)]" />
      <div className="relative">{children}</div>
      <p className="label absolute bottom-3 left-4 text-[9.5px] text-fg-3">{caption}</p>
    </div>
  );
}

export function UptimeCover() {
  const cells = Array.from({ length: 48 }, (_, i) => (i === 31 ? "warn" : i === 12 ? "dim" : "ok"));
  return (
    <Frame caption="illustration · uptime & incidents">
      <div className="flex items-center justify-between">
        <span className="label text-[10px] text-fg-2">Status</span>
        <span className="label flex items-center gap-1.5 text-[10px] text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          operational
        </span>
      </div>
      {["api", "checkout", "workers"].map((s, r) => (
        <div key={s} className="mt-3">
          <div className="flex justify-between font-mono text-[10px] text-fg-3">
            <span>{s}</span>
            <span>90 days</span>
          </div>
          <div className="mt-1.5 flex gap-[3px]">
            {cells.slice(r * 4, r * 4 + 40).map((c, i) => (
              <span key={i} className={cn("h-4 flex-1 rounded-[2px]", c === "ok" ? "bg-success/70" : c === "warn" ? "bg-warning" : "bg-fg-3/30")} />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-line-1 bg-bg-2/60 px-3 py-2 font-mono text-[10px] text-fg-2">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" /> incident acknowledged → on-call paged → resolved
      </div>
    </Frame>
  );
}

export function WorkflowCover() {
  const steps = ["Catalog request", "Approval", "Task", "Fulfilled"];
  return (
    <Frame caption="illustration · scoped app & flow">
      <div className="label text-[10px] text-fg-2">Flow Designer</div>
      <ol className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px]", i < 3 ? "border-accent/60 text-accent" : "border-line-2 text-fg-3")}>{i + 1}</span>
            <span className={cn("flex-1 rounded-lg border border-line-1 bg-bg-2/60 px-3 py-2 text-[12px]", i === 3 ? "text-fg-3" : "text-fg-1")}>{s}</span>
            {i === 1 && <span className="label rounded-full border border-success/40 px-2 py-1 text-[9px] text-success">approved</span>}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["ACL", "RBAC", "UI policy", "Script include"].map((t) => (
          <span key={t} className="label rounded-full border border-line-1 px-2 py-1 text-[9px] text-fg-3">{t}</span>
        ))}
      </div>
    </Frame>
  );
}

export function BrowserCover() {
  return (
    <Frame caption="illustration · auth & rest apis">
      <div className="rounded-xl border border-line-1 bg-bg-2/60">
        <div className="flex items-center gap-2 border-b border-line-1 px-3 py-2">
          <span className="flex gap-1"><span className="h-2 w-2 rounded-full bg-fg-3/40" /><span className="h-2 w-2 rounded-full bg-fg-3/40" /><span className="h-2 w-2 rounded-full bg-fg-3/40" /></span>
          <span className="ml-2 flex-1 rounded-md bg-fg-1/[0.05] px-2 py-1 font-mono text-[10px] text-fg-3">app.local/login</span>
        </div>
        <div className="p-3">
          <div className="h-7 rounded-md border border-line-2 bg-bg-1 px-2 font-mono text-[10px] leading-7 text-fg-3">email</div>
          <div className="mt-2 h-7 rounded-md border border-line-2 bg-bg-1 px-2 font-mono text-[10px] leading-7 text-fg-3">••••••••</div>
          <div className="mt-2 rounded-md bg-fg-1 py-1.5 text-center text-[11px] font-semibold text-accent-ink">Sign in</div>
        </div>
      </div>
      <div className="mt-3 space-y-1 font-mono text-[10px]">
        <p className="text-fg-2">POST /auth/login <span className="text-success">200</span> <span className="text-fg-3">· jwt issued</span></p>
        <p className="text-fg-2">GET /api/users <span className="text-success">200</span> <span className="text-fg-3">· bearer</span></p>
      </div>
    </Frame>
  );
}

export function ComposeCover() {
  const lines = ["api", "worker", "postgres", "redis", "rabbitmq", "dashboard"];
  return (
    <Frame caption="illustration · docker compose up">
      <p className="font-mono text-[11px] text-fg-1">$ docker compose up --build</p>
      <ul className="mt-3 space-y-1.5 font-mono text-[10.5px]">
        {lines.map((l, i) => (
          <li key={l} className="vis-fade flex items-center justify-between" style={{ animationDelay: `${i * 120}ms` }}>
            <span className="text-fg-2">{l}</span>
            <span className="text-success">✓ healthy</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10.5px] text-fg-3">GET /health → {"{"} db: up, rabbitmq: up {"}"}</p>
    </Frame>
  );
}

export function StudyCover() {
  const subjects = ["DSA", "OS", "DBMS", "Networks", "OOP", "SE"];
  return (
    <Frame caption="illustration · foundations">
      <div className="grid grid-cols-3 gap-2">
        {subjects.map((s, i) => (
          <span key={s} className={cn("rounded-lg border px-2 py-3 text-center font-mono text-[11px]", i === 0 ? "border-accent/50 bg-accent-soft text-accent" : "border-line-1 bg-bg-2/60 text-fg-2")}>{s}</span>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-line-1 bg-bg-2/60 p-3">
        <div className="flex items-baseline justify-between">
          <span className="label text-[10px] text-fg-3">LeetCode</span>
          <span className="font-mono text-[12px] text-fg-1">300+</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-fg-1/[0.07]"><span className="block h-full w-[78%] rounded-full bg-accent/80" /></div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="label text-[10px] text-fg-3">GeeksforGeeks</span>
          <span className="font-mono text-[12px] text-fg-1">100+</span>
        </div>
      </div>
    </Frame>
  );
}

export function CoverFor({ id }: { id: string }) {
  switch (id) {
    case "everuptime":
      return <UptimeCover />;
    case "servicenow":
      return <WorkflowCover />;
    case "technical-hub":
      return <BrowserCover />;
    case "systems":
      return <ComposeCover />;
    default:
      return <StudyCover />;
  }
}
