import { Avatar, Pill, Tabs, Window, themes } from "./ui";

const columns = [
  { title: "Backlog", cards: [{ t: "Tenant export API", tag: "backend", p: "P2", who: "Dev P." }, { t: "Billing migration plan", tag: "docs", p: "P3", who: "Asha R." }] },
  { title: "In progress", cards: [{ t: "Mobile onboarding flow", tag: "frontend", p: "P1", who: "Mei L." }, { t: "Audit log viewer", tag: "backend", p: "P2", who: "Ravi K." }, { t: "SSO for tenant-b", tag: "auth", p: "P1", who: "Asha R." }] },
  { title: "In review", cards: [{ t: "Plan limit banners", tag: "frontend", p: "P2", who: "Dev P." }] },
  { title: "Done", cards: [{ t: "RBAC middleware", tag: "backend", p: "P1", who: "Asha R." }, { t: "Tenant isolation guard", tag: "backend", p: "P1", who: "Ravi K." }, { t: "Seed & migrations on boot", tag: "infra", p: "P2", who: "Mei L." }] },
];
const tagColor: Record<string, string> = { backend: "#7c3aed", frontend: "#0ea5e9", docs: "#f59e0b", auth: "#ef4444", infra: "#10b981" };

export function SaasScreen() {
  return (
    <Window theme={themes.workspace} url="app.workspace.dev/tenant-a/projects/platform">
      {/* top bar */}
      <div className="flex h-12 items-center justify-between border-b border-line-1 bg-[var(--s-panel)] px-5">
        <div className="flex items-center gap-3 text-[12.5px]">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-ink">W</span>
          <span className="rounded-md border border-line-1 px-2 py-1 font-medium text-fg-1">tenant-a ▾</span>
          <span className="text-fg-3">/</span>
          <span className="text-fg-2">Projects</span>
          <span className="text-fg-3">/</span>
          <span className="font-medium text-fg-1">Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10.5px] text-fg-3">JWT ✓ · RBAC ✓ · TENANT ✓</span>
          <div className="flex -space-x-2">{["Asha R.", "Dev P.", "Mei L.", "Ravi K."].map((n) => <Avatar key={n} name={n} size={24} className="ring-2 ring-[var(--s-panel)]" />)}</div>
          <span className="rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-accent-ink">Invite</span>
        </div>
      </div>
      <div className="flex h-[calc(100%-3rem)]">
        {/* board */}
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-semibold tracking-tight">Platform</h3>
              <Pill tone="accent">tenant admin</Pill>
              <span className="text-[12px] text-fg-3">9 tasks · 3 members</span>
            </div>
            <Tabs items={["Board", "List", "Timeline", "Docs"]} active={0} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {columns.map((c, ci) => (
              <div key={c.title} className="rounded-2xl bg-fg-1/[0.03] p-2.5">
                <div className="flex items-center justify-between px-1.5 pb-2"><span className="text-[12px] font-semibold text-fg-1">{c.title}</span><span className="text-[11px] text-fg-3">{c.cards.length}</span></div>
                <div className="space-y-2">
                  {c.cards.map((card, i) => (
                    <div key={card.t} className="vis-fade rounded-xl border border-line-1 bg-bg-2 p-3 [box-shadow:0_1px_2px_rgba(0,0,0,0.05)]" style={{ animationDelay: `${400 + ci * 120 + i * 80}ms` }}>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md px-1.5 py-0.5 text-[9.5px] font-medium text-white" style={{ background: tagColor[card.tag] }}>{card.tag}</span>
                        <span className="text-[9.5px] text-fg-3">{card.p}</span>
                      </div>
                      <p className="mt-2 text-[12.5px] leading-snug text-fg-1">{card.t}</p>
                      <div className="mt-2.5 flex items-center justify-between"><span className="text-[10px] text-fg-3">TEN-{140 + ci * 10 + i}</span><Avatar name={card.who} size={20} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* detail drawer */}
        <aside className="w-[320px] shrink-0 overflow-hidden border-l border-line-1 bg-[var(--s-panel)] p-5">
          <p className="text-[10px] text-fg-3">TEN-151 · In progress</p>
          <h4 className="mt-1 text-[14px] font-semibold leading-snug">SSO for tenant-b</h4>
          <div className="mt-3 flex items-center gap-2"><Avatar name="Asha R." size={22} /><span className="text-[12px] text-fg-2">Asha R. · Tenant admin</span></div>
          <div className="mt-4 space-y-2 text-[11.5px]">
            <div className="flex justify-between"><span className="text-fg-3">Priority</span><span className="text-fg-1">P1</span></div>
            <div className="flex justify-between"><span className="text-fg-3">Due</span><span className="text-fg-1">Fri, 28 Jun</span></div>
            <div className="flex justify-between"><span className="text-fg-3">Plan</span><span className="text-fg-1">Starter · 3/5 projects</span></div>
          </div>
          <div className="mt-4 rounded-xl border border-line-1 bg-bg-2 p-3">
            <p className="text-[10px] text-fg-3">Isolation check</p>
            <p className="mt-1 font-mono text-[10.5px] text-fg-2">GET /tenants/tenant-b/projects</p>
            <p className="font-mono text-[10.5px] text-error">→ 403 forbidden</p>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-fg-3">Activity</p>
            <ul className="mt-2 space-y-2 text-[11px] text-fg-2">
              <li className="flex gap-2"><Avatar name="Ravi K." size={16} /> moved to In progress · 2h</li>
              <li className="flex gap-2"><Avatar name="Asha R." size={16} /> added subtask “OIDC callback” · 5h</li>
              <li className="flex gap-2"><Avatar name="Mei L." size={16} /> commented · yesterday</li>
            </ul>
          </div>
        </aside>
      </div>
    </Window>
  );
}
