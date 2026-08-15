import { ScaledFrame } from "@/components/visuals/ScaledFrame";
import { Avatar, Bars, Donut, Kpi, LineChart, Pill, Tabs, Window, themes } from "@/components/visuals/screens/ui";

/* Themed mini-product covers for the experience cards (design 1000×440). */

function Cover({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative max-h-[200px] overflow-hidden rounded-2xl sm:max-h-none">
      <div className="w-[165%] sm:w-full">
        <ScaledFrame width={1000} height={440} className="rounded-2xl" label={label}>
          {children}
        </ScaledFrame>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#101013] sm:hidden" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#101013]/90 sm:hidden" />
    </div>
  );
}

export function UptimeCover() {
  const services = [
    { n: "API", up: "99.98%" },
    { n: "Checkout", up: "99.95%" },
    { n: "Workers", up: "100%" },
    { n: "Webhooks", up: "99.90%" },
  ];
  return (
    <Cover label="Illustration: uptime and incident console">
      <Window theme={themes.observability} url="status.acme.dev · on-call console" className="rounded-none border-0">
        <div className="grid h-full grid-cols-[1.4fr_1fr] gap-4 p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-semibold">All systems operational</span>
                <Pill tone="success">● live</Pill>
              </div>
              <span className="font-mono text-[10.5px] text-fg-3">last 90 days</span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {services.map((s, i) => (
                <li key={s.n} className="vis-fade" style={{ animationDelay: `${300 + i * 90}ms` }}>
                  <div className="flex justify-between text-[12px]"><span className="text-fg-1">{s.n}</span><span className="font-mono text-success">{s.up}</span></div>
                  <div className="mt-1 flex gap-[3px]">
                    {Array.from({ length: 60 }, (_, k) => (
                      <span key={k} className={`h-5 flex-1 rounded-[2px] ${(k * 7 + i * 13) % 41 === 0 ? "bg-warning" : (k + i) % 53 === 0 ? "bg-error/80" : "bg-success/70"}`} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-line-1 bg-bg-2 p-3">
              <p className="label text-[9.5px] text-fg-3">Active incident</p>
              <p className="mt-1 text-[12.5px] font-medium text-fg-1">Elevated latency · checkout · sev-2</p>
              <div className="mt-2 flex items-center gap-2"><Avatar name="Vinod Kumar" size={20} /><span className="text-[11px] text-fg-2">acknowledged · on-call paged</span></div>
              <div className="mt-2 flex gap-1.5">{["detected", "acknowledged", "mitigating", "resolved"].map((s, i) => <span key={s} className={`label rounded-full px-2 py-1 text-[9px] ${i < 3 ? "bg-accent/15 text-accent" : "border border-line-1 text-fg-3"}`}>{s}</span>)}</div>
            </div>
            <div className="rounded-xl border border-line-1 bg-bg-2 p-3">
              <p className="label text-[9.5px] text-fg-3">Response time · p95</p>
              <LineChart height={70} grid={2} series={[{ values: [30, 32, 28, 40, 72, 68, 44, 36, 34, 30], color: "var(--color-accent)", area: true }]} />
            </div>
          </div>
        </div>
      </Window>
    </Cover>
  );
}

export function WorkflowCover() {
  const steps = ["Catalog request", "Manager approval", "Create task", "Notify requester"];
  return (
    <Cover label="Illustration: workflow builder on a service management platform">
      <Window theme={themes.now} url="instance.service-now.com/$flow-designer" className="rounded-none border-0">
        <div className="flex h-full">
          <aside className="w-[200px] shrink-0 p-4 [background:var(--s-sidebar)] [color:#fff]">
            <p className="text-[12px] font-semibold">App Engine Studio</p>
            <ul className="mt-3 space-y-1.5 text-[11.5px] text-white/75">
              <li className="rounded-md bg-white/10 px-2 py-1.5 text-white">Flow Designer</li>
              <li className="px-2 py-1.5">Tables & schema</li>
              <li className="px-2 py-1.5">Record producers</li>
              <li className="px-2 py-1.5">UI policies</li>
              <li className="px-2 py-1.5">Access control (ACL)</li>
            </ul>
          </aside>
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="text-[14px] font-semibold">Laptop request · flow</span><Pill tone="success">published</Pill></div>
              <Tabs items={["Design", "Test", "Executions"]} active={0} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="vis-fade w-[150px] rounded-xl border border-line-1 bg-bg-2 p-3 [box-shadow:0_1px_2px_rgba(0,0,0,0.05)]" style={{ animationDelay: `${300 + i * 120}ms` }}>
                    <p className="label text-[9px] text-fg-3">{i === 0 ? "Trigger" : "Action"}</p>
                    <p className="mt-1 text-[12px] font-medium text-fg-1">{s}</p>
                    {i === 1 && <p className="mt-1 text-[10px] text-success">approved · 2m</p>}
                  </div>
                  {i < steps.length - 1 && <span className="text-fg-3">→</span>}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-line-1 bg-bg-2 p-3"><p className="label text-[9px] text-fg-3">Record producer</p><p className="mt-1 text-[12px] text-fg-1">Request a laptop · 6 variables</p></div>
              <div className="rounded-xl border border-line-1 bg-bg-2 p-3"><p className="label text-[9px] text-fg-3">ACL</p><p className="mt-1 text-[12px] text-fg-1">read · write by role: itil, admin</p></div>
              <div className="rounded-xl border border-line-1 bg-bg-2 p-3"><p className="label text-[9px] text-fg-3">Executions today</p><p className="mt-1 text-[12px] text-fg-1">128 · avg 4m to resolve</p></div>
            </div>
          </div>
        </div>
      </Window>
    </Cover>
  );
}

export function BrowserCover() {
  return (
    <Cover label="Illustration: authenticated dashboard with REST APIs">
      <Window theme={themes.stripe} url="app.techhub.local/dashboard" className="rounded-none border-0">
        <div className="grid h-full grid-cols-[1.3fr_1fr] gap-4 p-5">
          <div>
            <div className="flex items-center justify-between"><span className="text-[15px] font-semibold">Users</span><span className="rounded-md bg-accent px-3 py-1.5 text-[11px] font-semibold text-accent-ink">+ Invite</span></div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Kpi label="Users" value="1,204" delta="+38 this week" tone="success" delay={200} />
              <Kpi label="Sessions" value="8,913" delta="jwt · 24h" delay={260} />
              <Kpi label="API p95" value="142 ms" delta="REST · /api/*" tone="success" delay={320} />
            </div>
            <ul className="mt-3 divide-y divide-line-1 rounded-xl border border-line-1 bg-bg-2">
              {["Aarav Mehta", "Priya Nair", "Rohan Iyer", "Sneha Kulkarni"].map((n, i) => (
                <li key={n} className="vis-fade flex items-center gap-3 px-3 py-2 text-[12px]" style={{ animationDelay: `${400 + i * 80}ms` }}>
                  <Avatar name={n} size={22} /><span className="flex-1 text-fg-1">{n}</span><span className="font-mono text-[10px] text-fg-3">{["admin", "editor", "viewer", "viewer"][i]}</span><Pill tone="success">active</Pill>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-line-1 bg-bg-2 p-4 [box-shadow:0_10px_30px_-12px_rgba(0,0,0,0.15)]">
              <p className="text-[13px] font-semibold">Sign in</p>
              <div className="mt-3 h-8 rounded-md border border-line-2 bg-bg-1 px-2 text-[11px] leading-8 text-fg-3">you@company.com</div>
              <div className="mt-2 h-8 rounded-md border border-line-2 bg-bg-1 px-2 text-[11px] leading-8 text-fg-3">••••••••</div>
              <div className="mt-2 rounded-md bg-accent py-1.5 text-center text-[11px] font-semibold text-accent-ink">Continue</div>
              <div className="mt-2 rounded-md border border-line-2 py-1.5 text-center text-[11px] text-fg-2">Continue with Google</div>
            </div>
            <div className="rounded-xl border border-line-1 bg-bg-2 p-3 font-mono text-[10.5px]">
              <p className="text-fg-2">POST /auth/login <span className="text-success">200</span> · jwt issued</p>
              <p className="text-fg-2">GET /api/users?page=1 <span className="text-success">200</span> · 24 ms</p>
              <p className="text-fg-3">Authorization: Bearer eyJhbGciOi…</p>
            </div>
          </div>
        </div>
      </Window>
    </Cover>
  );
}

export function ComposeCover() {
  const services = ["api", "worker", "postgres", "redis", "rabbitmq", "dashboard", "checkout", "consumer"];
  return (
    <Cover label="Illustration: local systems booting with docker compose">
      <Window theme={themes.terminal} url="~/systems · docker compose up" className="rounded-none border-0">
        <div className="grid h-full grid-cols-[1.2fr_1fr] gap-4 p-5 font-mono">
          <div className="rounded-xl border border-line-1 bg-bg-2 p-4 text-[11.5px] leading-[1.9]">
            <p className="text-fg-1">$ docker compose up --build</p>
            {services.map((s, i) => (
              <p key={s} className="vis-fade text-fg-2" style={{ animationDelay: `${300 + i * 110}ms` }}>
                <span className="text-fg-3">[+]</span> Container {s} <span className="text-success">Healthy</span>
              </p>
            ))}
            <p className="vis-fade text-fg-2" style={{ animationDelay: "1300ms" }}>api | listening on :8000 · rabbitmq up · db up</p>
            <p className="vis-fade text-accent" style={{ animationDelay: "1450ms" }}>worker | consuming order_placement · prefetch 10</p>
            <p className="vis-fade text-fg-1" style={{ animationDelay: "1600ms" }}>$ curl localhost:8080/health → {"{"} status: healthy {"}"} <span className="vis-cursor" /></p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {services.map((s, i) => (
              <div key={s} className="vis-fade rounded-xl border border-line-1 bg-bg-2 p-3" style={{ animationDelay: `${500 + i * 90}ms` }}>
                <div className="flex items-center justify-between"><span className="text-[12px] text-fg-1">{s}</span><span className="h-1.5 w-1.5 rounded-full bg-success" /></div>
                <p className="mt-1 text-[10px] text-fg-3">{["node · :8000", "node · consumer", "pg 15", "redis 7", "3.12-mgmt", "vite · :3000", "static · :3001", "amqplib"][i]}</p>
                <div className="mt-2 h-4"><Bars values={[40, 60, 45, 70, 55, 80, 65, 75].map((v, k) => (v + i * 7 + k * 3) % 100)} height={16} /></div>
              </div>
            ))}
          </div>
        </div>
      </Window>
    </Cover>
  );
}

export function StudyCover() {
  return (
    <Cover label="Illustration: student portal with grades and practice stats">
      <Window theme={themes.campus} url="portal.aditya.edu.in/student" className="rounded-none border-0">
        <div className="grid h-full grid-cols-[1fr_1fr_1fr] gap-4 p-5">
          <div className="rounded-xl border border-line-1 bg-bg-2 p-4">
            <div className="flex items-center gap-3"><Avatar name="Vinod Kumar" size={34} /><div><p className="text-[13px] font-semibold text-fg-1">B.Tech · Information Technology</p><p className="text-[11px] text-fg-3">2022 — 2026 · Surampalem</p></div></div>
            <div className="mt-4 flex items-center gap-4">
              <Donut size={92} thickness={11} segments={[{ value: 84, color: "var(--color-accent)" }, { value: 16, color: "#e5e7eb" }]} label="8.4" sub="CGPA" />
              <ul className="space-y-1 text-[11px] text-fg-2"><li>Semesters · 8</li><li>Core · DSA, OS, DBMS, CN</li><li>Electives · Cloud, IoT</li></ul>
            </div>
          </div>
          <div className="rounded-xl border border-line-1 bg-bg-2 p-4">
            <p className="text-[13px] font-semibold text-fg-1">Problem solving</p>
            <div className="mt-3 space-y-3">
              {[["LeetCode", 300, 82], ["GeeksforGeeks", 100, 55], ["CodeChef", 40, 30]].map(([n, v, w], i) => (
                <div key={String(n)} className="vis-fade" style={{ animationDelay: `${300 + i * 100}ms` }}>
                  <div className="flex justify-between text-[11.5px]"><span className="text-fg-1">{n}</span><span className="font-mono text-fg-3">{v}+</span></div>
                  <div className="mt-1 h-2 rounded-full bg-fg-1/[0.07]"><span className="vis-bar block h-full origin-left rounded-full bg-accent" style={{ width: `${w}%`, animationName: "vis-type" }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line-1 bg-bg-2 p-4">
            <p className="text-[13px] font-semibold text-fg-1">Certifications</p>
            <ul className="mt-3 space-y-2 text-[11.5px]">
              {["ServiceNow CSA · CAD", "Cisco · JS Essentials 1 & 2", "Pearson IT Specialist", "NPTEL · Cloud Computing"].map((c, i) => (
                <li key={c} className="vis-fade flex items-center justify-between rounded-lg border border-line-1 px-2.5 py-2" style={{ animationDelay: `${400 + i * 90}ms` }}><span className="text-fg-1">{c}</span><Pill tone="success">verified</Pill></li>
              ))}
            </ul>
          </div>
        </div>
      </Window>
    </Cover>
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
