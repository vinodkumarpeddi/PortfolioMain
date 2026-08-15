import { AppShell, AreaChart, Kpi, NavItem, Pill, Row } from "./ui";

const txns = [
  { id: "pay_9f3a1c", amount: "₹500.00", method: "UPI", customer: "demo_1", status: "processed" },
  { id: "pay_71bd0e", amount: "₹1,250.00", method: "Card ··4242", customer: "demo_2", status: "processed" },
  { id: "pay_c02e88", amount: "₹500.00", method: "UPI", customer: "demo_3", status: "pending" },
  { id: "pay_4a17f9", amount: "₹2,000.00", method: "Card ··1881", customer: "demo_4", status: "refunded" },
  { id: "pay_e5d3b2", amount: "₹750.00", method: "UPI", customer: "demo_5", status: "processed" },
  { id: "pay_0b7c31", amount: "₹500.00", method: "Card ··0005", customer: "demo_6", status: "failed" },
] as const;
const tone = { processed: "success", pending: "warning", refunded: "neutral", failed: "error" } as const;

export function PaymentScreen() {
  return (
    <AppShell
      title="Orchestrator"
      accentTitle="live"
      url="dashboard.localhost:3000 · merchant"
      sidebar={
        <>
          <NavItem active>Overview</NavItem>
          <NavItem>Payments</NavItem>
          <NavItem>Refunds</NavItem>
          <NavItem>Webhooks</NavItem>
          <NavItem>API keys</NavItem>
          <NavItem>Checkout</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium">Merchant dashboard</span>
            <Pill tone="accent">test mode</Pill>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-line-1 px-3 py-1.5 font-mono text-[11px] text-fg-2">key_test_abc123</span>
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-[#7a4a10]" />
          </div>
        </>
      }
      aside={
        <>
          <p className="label text-[9.5px] text-fg-3">Webhook deliveries</p>
          <ul className="mt-3 space-y-2">
            {[
              { ev: "payment.processed", code: "200", ok: true, attempt: "1/5" },
              { ev: "payment.processed", code: "503", ok: false, attempt: "2/5 · retry 4s" },
              { ev: "refund.created", code: "200", ok: true, attempt: "1/5" },
              { ev: "payment.failed", code: "200", ok: true, attempt: "3/5" },
            ].map((w, i) => (
              <li key={i} className="vis-fade rounded-xl border border-line-1 bg-bg-2/60 p-3" style={{ animationDelay: `${500 + i * 120}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-fg-1">{w.ev}</span>
                  <span className={w.ok ? "font-mono text-[11px] text-success" : "font-mono text-[11px] text-error"}>{w.code}</span>
                </div>
                <p className="label mt-1.5 text-[9.5px] text-fg-3">attempt {w.attempt}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-line-1 bg-bg-2/60 p-3">
            <div className="flex items-center justify-between">
              <span className="label text-[9.5px] text-fg-3">Queue</span>
              <span className="label text-[9.5px] text-success">healthy</span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-fg-2">redis · bullmq · 3 workers</p>
            <div className="mt-2 flex gap-1">
              {[1, 1, 1, 0.5, 0.2].map((o, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-accent" style={{ opacity: o }} />
              ))}
            </div>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Volume · 24h" value="₹48,250" delta="+12.4% vs yesterday" tone="success" delay={200} spark={[20, 35, 30, 48, 44, 60, 58, 72, 80, 88]} />
        <Kpi label="Success rate" value="98.2%" delta="idempotent retries" delay={280} spark={[90, 92, 91, 95, 94, 96, 97, 96, 98, 98]} />
        <Kpi label="Pending" value="3" delta="in queue" tone="warning" delay={360} />
        <Kpi label="Refunds" value="₹2,000" delta="ledger reconciled" delay={440} />
      </div>
      <div className="mt-4 grid grid-cols-[1.6fr_1fr] gap-4">
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Settled volume</span>
            <span className="label text-[9.5px] text-fg-3">last 14 days</span>
          </div>
          <AreaChart values={[22, 30, 26, 38, 42, 40, 55, 50, 62, 58, 70, 66, 82, 90]} height={130} className="mt-3" />
        </div>
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
          <span className="text-[13px] font-medium">Hosted checkout</span>
          <div className="mt-3 rounded-xl border border-line-1 bg-[#0a0a0d] p-3">
            <p className="text-[18px] font-semibold">₹500.00</p>
            <p className="label mt-0.5 text-[9.5px] text-fg-3">order · demo_1</p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-fg-1/[0.05] p-1">
              <span className="label rounded-md bg-fg-1 py-1 text-center text-[9.5px] text-accent-ink">UPI</span>
              <span className="label py-1 text-center text-[9.5px] text-fg-3">Card</span>
            </div>
            <div className="mt-2 rounded-lg bg-accent py-1.5 text-center text-[11px] font-semibold text-accent-ink">Pay ₹500.00</div>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-line-1 bg-bg-2/40 px-4 pb-1 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium">Recent payments</span>
          <span className="label text-[9.5px] text-fg-3">orders · payments · refunds</span>
        </div>
        <div className="mt-2">
          {txns.map((t, i) => (
            <Row key={t.id} className="grid-cols-[1.4fr_1fr_1.2fr_1fr_auto]" delay={500 + i * 90}>
              <span className="font-mono text-fg-2">{t.id}</span>
              <span className="tabular-nums text-fg-1">{t.amount}</span>
              <span className="text-fg-3">{t.method}</span>
              <span className="font-mono text-fg-3">{t.customer}</span>
              {t.status === "pending" ? (
                <span className="relative inline-flex justify-end">
                  <Pill tone="warning" className="[animation:vis-status-a_5s_infinite]">pending</Pill>
                  <Pill tone="success" className="absolute right-0 top-0 [animation:vis-status-b_5s_infinite]">processed</Pill>
                </span>
              ) : (
                <span className="inline-flex justify-end"><Pill tone={tone[t.status]}>{t.status}</Pill></span>
              )}
            </Row>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
