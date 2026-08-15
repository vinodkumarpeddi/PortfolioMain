import { Heatmap, Kpi, LineChart, Pill, Tabs, Window, themes } from "./ui";

const events = ["OrderCreated #1055 · customer 91 · ₹2,340", "ProductCreated #1054 · Monitor Arm", "OrderCreated #1053 · customer 14 · ₹599", "OrderCreated #1052 · customer 62 · ₹12,500", "ProductUpdated #1051 · USB-C Hub · price", "OrderCreated #1050 · customer 7 · ₹1,299", "OrderCreated #1049 · customer 33 · ₹8,000", "OrderCancelled #1048 · customer 21"];

export function AnalyticsScreen() {
  return (
    <Window theme={themes.observability} url="analytics.internal:8081/overview">
      {/* top bar */}
      <div className="flex h-12 items-center justify-between border-b border-line-1 bg-[var(--s-panel)] px-5">
        <div className="flex items-center gap-4">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-ink">Q</span>
          <span className="text-[13.5px] font-semibold tracking-tight">Commerce analytics</span>
          <Tabs items={["Overview", "Products", "Orders", "Customers", "Pipeline"]} active={0} />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-line-1 px-2.5 py-1 font-mono text-[10.5px] text-fg-2">Last 24h ▾</span>
          <span className="rounded-md border border-line-1 px-2.5 py-1 font-mono text-[10.5px] text-fg-2">UTC+5:30</span>
          <Pill tone="success">read model · fresh</Pill>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 p-5">
        {/* metrics */}
        <div className="col-span-12 grid grid-cols-5 gap-3">
          <Kpi label="Orders" value="1,088" delta="+8.1% vs yesterday" tone="success" delay={200} spark={[30, 42, 38, 55, 52, 66, 70, 78, 84, 92]} />
          <Kpi label="Revenue" value="₹1.61 Cr" delta="+11.4%" tone="success" delay={260} spark={[40, 44, 42, 50, 56, 60, 66, 70, 76, 80]} />
          <Kpi label="Avg order" value="₹1,486" delta="-2.1%" tone="warning" delay={320} spark={[70, 66, 68, 62, 64, 60, 58, 60, 56, 55]} />
          <Kpi label="Event lag" value="120 ms" delta="outbox → read db" delay={380} spark={[30, 28, 32, 26, 24, 26, 22, 20, 22, 20]} />
          <Kpi label="Consumers" value="3 / 3" delta="idempotent · 0 dlq" tone="success" delay={440} />
        </div>

        {/* big chart */}
        <div className="col-span-8 rounded-2xl border border-line-1 bg-bg-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold">Orders vs revenue</p>
              <p className="text-[11px] text-fg-3">materialized view · refreshed every event</p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-fg-3">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-accent" /> orders</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-[#a78bfa]" /> revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-fg-3/60" /> yesterday</span>
            </div>
          </div>
          <LineChart className="mt-3" height={190} grid={5} series={[{ values: [10, 14, 12, 20, 26, 40, 58, 66, 62, 70, 76, 68, 74, 82, 90, 84], color: "var(--color-accent)", area: true }, { values: [8, 10, 12, 16, 22, 30, 44, 52, 50, 60, 66, 60, 70, 76, 80, 78], color: "#a78bfa" }, { values: [12, 12, 14, 18, 22, 32, 40, 48, 50, 54, 58, 56, 60, 62, 64, 66], color: "#5b6b8c", dashed: true }]} />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-fg-3"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>now</span></div>
        </div>

        {/* heatmap */}
        <div className="col-span-4 rounded-2xl border border-line-1 bg-bg-2 p-4">
          <p className="text-[13px] font-semibold">Orders by hour</p>
          <p className="text-[11px] text-fg-3">last 7 days · IST</p>
          <div className="mt-3 flex gap-2">
            <div className="flex flex-col justify-between py-0.5 font-mono text-[9px] text-fg-3"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div>
            <Heatmap rows={7} cols={24} seed={11} className="flex-1" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] text-fg-3"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
          <div className="mt-4 rounded-xl border border-line-1 bg-bg-1 p-3">
            <div className="flex items-center justify-between font-mono text-[10.5px]"><span className="text-fg-3">peak</span><span className="text-fg-1">Fri 19:00 · 214 orders</span></div>
          </div>
        </div>

        {/* stream + top products */}
        <div className="col-span-5 rounded-2xl border border-line-1 bg-bg-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">Event stream</p>
            <span className="label flex items-center gap-1.5 text-[9.5px] text-fg-3"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> rabbitmq · live</span>
          </div>
          <div className="relative mt-3 h-[150px] overflow-hidden rounded-lg bg-bg-1 p-2 font-mono text-[10.5px] [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
            <div className="[animation:vis-scroll-y_14s_linear_infinite] motion-reduce:animate-none">
              {[...events, ...events].map((e, i) => (
                <div key={i} className="flex gap-3 py-1 text-fg-2"><span className="text-fg-3">{String(12 - (i % 12)).padStart(2, "0")}:4{i % 10}</span><span className={e.startsWith("Order") ? "text-fg-1" : "text-accent"}>{e}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-7 rounded-2xl border border-line-1 bg-bg-2 px-4 pb-1 pt-4">
          <p className="text-[13px] font-semibold">Top products · read model</p>
          <div className="mt-2">
            {[
              ["Wireless Mouse", "Electronics", 1284, "₹38,483", 92],
              ["Mechanical Keyboard", "Electronics", 842, "₹71,570", 70],
              ["USB-C Hub", "Accessories", 611, "₹24,428", 52],
              ["Monitor Arm", "Furniture", 302, "₹27,178", 34],
            ].map((r, i) => (
              <div key={String(r[0])} className="vis-fade grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1.4fr] items-center gap-3 border-t border-line-1 py-2.5 text-[12px]" style={{ animationDelay: `${600 + i * 90}ms` }}>
                <span className="text-fg-1">{r[0]}</span>
                <span className="text-fg-3">{r[1]}</span>
                <span className="tabular-nums text-fg-2">{Number(r[2]).toLocaleString()} sold</span>
                <span className="tabular-nums text-fg-1">{r[3]}</span>
                <span className="h-1.5 rounded-full bg-fg-1/[0.08]"><span className="vis-bar block h-full origin-left rounded-full bg-accent" style={{ width: `${r[4]}%`, animationName: "vis-type" }} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}
