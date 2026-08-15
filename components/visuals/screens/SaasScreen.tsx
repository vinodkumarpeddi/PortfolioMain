import { AppShell, Kpi, NavItem, Pill } from "./ui";

const columns = [
  { title: "To do", cards: ["Billing migration plan", "Tenant export API"] },
  { title: "In progress", cards: ["Mobile onboarding", "Audit log viewer", "SSO for tenant-b"] },
  { title: "Done", cards: ["RBAC middleware", "Plan limits", "Seed & migrations"] },
];
const users = [
  { name: "Asha R.", role: "Tenant admin" },
  { name: "Dev P.", role: "User" },
  { name: "Mei L.", role: "User" },
  { name: "Ravi K.", role: "User" },
];

export function SaasScreen() {
  return (
    <AppShell
      title="Workspace"
      sidebar={
        <>
          <div className="mb-3 flex items-center justify-between rounded-lg border border-line-1 bg-bg-2/60 px-3 py-2">
            <span className="text-[12.5px]">tenant-a</span>
            <span className="label text-[9px] text-fg-3">switch</span>
          </div>
          <NavItem>Dashboard</NavItem>
          <NavItem active>Projects</NavItem>
          <NavItem>Tasks</NavItem>
          <NavItem>Users</NavItem>
          <NavItem>Plan</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium">Projects</span>
            <Pill tone="accent">tenant admin</Pill>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10.5px] text-fg-3">JWT ✓ · RBAC ✓ · TENANT ✓</span>
            <span className="rounded-lg bg-fg-1 px-3 py-1.5 text-[11px] font-semibold text-accent-ink">New project</span>
          </div>
        </>
      }
      aside={
        <>
          <p className="label text-[9.5px] text-fg-3">Users · 4 / 10</p>
          <ul className="mt-3 space-y-2">
            {users.map((u, i) => (
              <li key={u.name} className="vis-fade flex items-center justify-between rounded-xl border border-line-1 bg-bg-2/60 p-3" style={{ animationDelay: `${500 + i * 100}ms` }}>
                <span className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full bg-gradient-to-br from-fg-2 to-fg-3" />
                  <span className="text-[12px]">{u.name}</span>
                </span>
                <Pill tone={u.role === "User" ? "neutral" : "accent"}>{u.role}</Pill>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-line-1 bg-bg-2/60 p-3">
            <p className="label text-[9.5px] text-fg-3">Isolation check</p>
            <p className="mt-2 font-mono text-[10.5px] text-fg-2">GET /tenants/tenant-b/projects</p>
            <p className="font-mono text-[10.5px] text-error">→ 403 forbidden</p>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        <Kpi label="Projects · plan" value="3 / 5" delta="starter limits" delay={200} />
        <Kpi label="Open tasks" value="14" delta="across 3 projects" delay={280} />
        <Kpi label="Members" value="4 / 10" delta="tenant-a" delay={360} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {columns.map((c, ci) => (
          <div key={c.title} className="rounded-2xl border border-line-1 bg-bg-2/40 p-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12.5px] font-medium">{c.title}</span>
              <span className="label text-[9.5px] text-fg-3">{c.cards.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {c.cards.map((card, i) => (
                <div key={card} className="vis-fade rounded-xl border border-line-1 bg-[#0a0a0d] p-3" style={{ animationDelay: `${450 + ci * 120 + i * 90}ms` }}>
                  <p className="text-[12.5px] text-fg-1">{card}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="label text-[9px] text-fg-3">{ci === 2 ? "shipped" : `${3 - i} tasks`}</span>
                    <span className="h-4 w-4 rounded-full bg-gradient-to-br from-fg-2 to-fg-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
