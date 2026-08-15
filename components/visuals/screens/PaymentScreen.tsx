import { AppShell, Avatar, Donut, Kpi, LineChart, NavItem, Pill, Row, Tabs, themes } from "./ui";

const payments = [
  { id: "pay_3Nq8kL2eZ", customer: "Aarav Mehta", email: "aarav@northwind.in", amount: "₹4,999.00", method: "UPI · aarav@okaxis", status: "succeeded", when: "2 min ago" },
  { id: "pay_3Nq8hV9pQ", customer: "Priya Nair", email: "priya.n@lumen.co", amount: "₹12,500.00", method: "Visa ··4242", status: "succeeded", when: "9 min ago" },
  { id: "pay_3Nq8fA1tW", customer: "Rohan Iyer", email: "rohan@quill.app", amount: "₹1,299.00", method: "UPI · rohan@ybl", status: "processing", when: "14 min ago" },
  { id: "pay_3Nq8dR7cM", customer: "Sneha Kulkarni", email: "sneha@ferrous.io", amount: "₹8,000.00", method: "Mastercard ··1881", status: "refunded", when: "31 min ago" },
  { id: "pay_3Nq8bZ4nK", customer: "Karan Bose", email: "karan@aster.dev", amount: "₹599.00", method: "UPI · karan@paytm", status: "failed", when: "42 min ago" },
  { id: "pay_3Nq89X0sD", customer: "Meera Pillai", email: "meera@holo.studio", amount: "₹22,000.00", method: "Visa ··0005", status: "succeeded", when: "1 hr ago" },
] as const;
const tone = { succeeded: "success", processing: "warning", refunded: "neutral", failed: "error" } as const;

export function PaymentScreen() {
  return (
    <AppShell
      theme={themes.stripe}
      title="Orchestrator"
      accentTitle="Test mode"
      url="dashboard.orchestrator.dev/payments"
      sidebar={
        <>
          <NavItem>Home</NavItem>
          <NavItem active>Payments</NavItem>
          <NavItem>Customers</NavItem>
          <NavItem>Refunds</NavItem>
          <NavItem>Webhooks</NavItem>
          <NavItem>Developers</NavItem>
          <NavItem>Settings</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold tracking-tight">Payments</span>
            <Tabs items={["Overview", "All payments", "Disputes", "Payouts"]} active={0} />
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-line-1 bg-bg-2 px-3 py-1.5 text-[12px] text-fg-2">Last 7 days ▾</span>
            <span className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-accent-ink">+ Create payment</span>
            <Avatar name="Vinod Kumar" size={28} />
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Gross volume" value="₹4,82,510" delta="+18.2% vs last week" tone="success" delay={200} spark={[24, 30, 28, 44, 42, 58, 60, 74, 72, 88]} />
        <Kpi label="Successful payments" value="1,284" delta="98.4% success rate" tone="success" delay={280} spark={[60, 62, 61, 66, 70, 72, 75, 78, 80, 84]} />
        <Kpi label="Refunds" value="₹31,000" delta="12 refunds · ledger reconciled" delay={360} />
        <Kpi label="Webhook deliveries" value="99.1%" delta="4 retried · 0 dead" tone="success" delay={440} spark={[90, 94, 92, 97, 96, 98, 99, 99, 99, 99]} />
      </div>

      <div className="mt-4 grid grid-cols-[1.7fr_1fr] gap-4">
        <div className="rounded-2xl border border-line-1 bg-bg-2 p-4 [box-shadow:0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold">Gross volume</p>
              <p className="text-[11px] text-fg-3">₹4,82,510 · vs ₹4,08,220 previous period</p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-fg-3">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-accent" /> this week</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-fg-3/50" /> previous</span>
            </div>
          </div>
          <LineChart className="mt-3" height={150} series={[{ values: [22, 30, 26, 38, 42, 40, 55, 50, 62, 58, 70, 66, 82, 90], color: "var(--color-accent)", area: true }, { values: [20, 24, 28, 30, 34, 36, 40, 44, 46, 50, 52, 55, 58, 60], color: "#94a3b8", dashed: true }]} />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-fg-3"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </div>
        <div className="rounded-2xl border border-line-1 bg-bg-2 p-4 [box-shadow:0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[13px] font-semibold">Payment methods</p>
          <div className="mt-3 flex items-center gap-5">
            <Donut size={124} thickness={16} segments={[{ value: 58, color: "var(--color-accent)" }, { value: 31, color: "#22c55e" }, { value: 11, color: "#94a3b8" }]} label="1,284" sub="payments" />
            <ul className="space-y-2 text-[12px]">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> UPI <span className="ml-auto pl-4 font-mono text-fg-3">58%</span></li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Cards <span className="ml-auto pl-4 font-mono text-fg-3">31%</span></li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#94a3b8]" /> Net banking <span className="ml-auto pl-4 font-mono text-fg-3">11%</span></li>
            </ul>
          </div>
          <div className="mt-4 rounded-xl border border-line-1 bg-bg-1 p-3">
            <p className="label text-[9.5px] text-fg-3">Queue · redis / bullmq</p>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px]"><span className="text-fg-2">waiting 3 · active 2</span><span className="text-success">3 workers</span></div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line-1 bg-bg-2 px-4 pb-1 pt-4 [box-shadow:0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold">Recent payments</p>
          <div className="flex gap-2 text-[11px]">
            <span className="rounded-md border border-line-1 px-2 py-1 text-fg-2">Filter</span>
            <span className="rounded-md border border-line-1 px-2 py-1 text-fg-2">Export</span>
          </div>
        </div>
        <div className="mt-2">
          {payments.map((p, i) => (
            <Row key={p.id} className="grid-cols-[1.6fr_1.1fr_1.5fr_auto_0.9fr]" delay={500 + i * 80}>
              <span className="flex items-center gap-2.5">
                <Avatar name={p.customer} size={26} />
                <span className="flex flex-col leading-tight"><span className="text-fg-1">{p.customer}</span><span className="text-[10.5px] text-fg-3">{p.email}</span></span>
              </span>
              <span className="font-medium tabular-nums text-fg-1">{p.amount}</span>
              <span className="text-fg-2">{p.method}</span>
              <Pill tone={tone[p.status]}>{p.status}</Pill>
              <span className="text-right text-fg-3">{p.when}</span>
            </Row>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
