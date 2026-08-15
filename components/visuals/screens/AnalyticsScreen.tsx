import { AppShell, Bars, Kpi, NavItem, Pill, Row } from "./ui";

const events = ["OrderCreated", "ProductCreated", "OrderCreated", "OrderCreated", "ProductUpdated", "OrderCreated", "OrderCreated", "ProductCreated"];
const products = [
  { name: "Wireless Mouse", cat: "Electronics", sold: 1284, rev: "$38,483" },
  { name: "Mechanical Keyboard", cat: "Electronics", sold: 842, rev: "$71,570" },
  { name: "USB-C Hub", cat: "Accessories", sold: 611, rev: "$24,428" },
  { name: "Monitor Arm", cat: "Furniture", sold: 302, rev: "$27,178" },
];

export function AnalyticsScreen() {
  return (
    <AppShell
      title="Analytics"
      accentTitle="read model"
      sidebar={
        <>
          <NavItem active>Overview</NavItem>
          <NavItem>Products</NavItem>
          <NavItem>Orders</NavItem>
          <NavItem>Customers</NavItem>
          <NavItem>Event stream</NavItem>
          <NavItem>Outbox</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium">Query service</span>
            <span className="font-mono text-[11px] text-fg-3">:8081</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="success">materialized views · fresh</Pill>
            <Pill>lag 120ms</Pill>
          </div>
        </>
      }
      aside={
        <>
          <div className="flex items-center justify-between">
            <p className="label text-[9.5px] text-fg-3">Event stream</p>
            <span className="label text-[9.5px] text-fg-2">rabbitmq</span>
          </div>
          <div className="relative mt-3 h-[300px] overflow-hidden rounded-xl border border-line-1 bg-bg-2/60 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
            <div className="[animation:vis-scroll-y_10s_linear_infinite] motion-reduce:animate-none">
              {[...events, ...events].map((e, i) => (
                <div key={i} className="flex items-center justify-between border-b border-line-1 px-3 py-2.5">
                  <span className="font-mono text-[11px] text-fg-1">{e}</span>
                  <span className="font-mono text-[10px] text-fg-3">#{1042 + i}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-line-1 bg-bg-2/60 p-3">
            <div className="flex items-center justify-between">
              <span className="label text-[9.5px] text-fg-3">Outbox relay</span>
              <span className="label text-[9.5px] text-success">draining</span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-fg-2">pending 2 · published 1,088</p>
            <p className="mt-1 font-mono text-[11px] text-fg-3">dead-letter 0</p>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Orders today" value="1,088" delta="+8.1%" tone="success" delay={200} />
        <Kpi label="Units sold" value="3,039" delta="across 4 products" delay={280} />
        <Kpi label="Revenue" value="$161,659" delta="write model → read model" delay={360} />
        <Kpi label="Consumers" value="3" delta="idempotent" delay={440} />
      </div>
      <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Product sales · Wireless Mouse</span>
            <span className="font-mono text-[10px] text-fg-3">GET /api/analytics/products/1/sales</span>
          </div>
          <Bars values={[25, 40, 32, 55, 48, 70, 62, 84, 76, 100, 88, 94]} accent={9} className="mt-4" height={140} />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-fg-3">
            <span>W1</span>
            <span>W12</span>
          </div>
        </div>
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
          <span className="text-[13px] font-medium">Write vs read</span>
          <div className="mt-4 space-y-3">
            {[
              { k: "Command service :8080", v: "POST /api/orders · 201", w: 100 },
              { k: "Outbox → RabbitMQ", v: "at-least-once", w: 86 },
              { k: "Consumer → read DB", v: "processed_events", w: 74 },
            ].map((r, i) => (
              <div key={r.k} className="vis-fade" style={{ animationDelay: `${500 + i * 120}ms` }}>
                <div className="flex justify-between text-[12px]">
                  <span className="text-fg-1">{r.k}</span>
                  <span className="font-mono text-[10px] text-fg-3">{r.v}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-fg-1/[0.07]">
                  <span className="vis-bar block h-full origin-left rounded-full bg-accent/80" style={{ width: `${r.w}%`, animationName: "vis-type" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-line-1 bg-bg-2/40 px-4 pb-1 pt-4">
        <span className="text-[13px] font-medium">Top products · materialized view</span>
        <div className="mt-2">
          {products.map((p, i) => (
            <Row key={p.name} className="grid-cols-[1.6fr_1fr_1fr_1fr]" delay={600 + i * 90}>
              <span className="text-fg-1">{p.name}</span>
              <span className="text-fg-3">{p.cat}</span>
              <span className="tabular-nums text-fg-2">{p.sold.toLocaleString()} sold</span>
              <span className="text-right tabular-nums text-fg-1">{p.rev}</span>
            </Row>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
