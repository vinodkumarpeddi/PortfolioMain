import { AppShell, Kpi, NavItem, Pill, Row } from "./ui";

const rooms = ["A-101", "A-102", "B-201", "B-202", "C-301", "C-302"];
const seats = Array.from({ length: 6 * 10 }, (_, i) => (i % 13 === 0 ? "absent" : i % 7 === 0 ? "flag" : i % 4 === 0 ? "free" : "seated"));

export function ExamScreen() {
  return (
    <AppShell
      title="ExamSeat"
      accentTitle="admin"
      url="exam-seating-management.vercel.app · admin"
      sidebar={
        <>
          <NavItem active>Dashboard</NavItem>
          <NavItem>Exam schedules</NavItem>
          <NavItem>Rooms & blocks</NavItem>
          <NavItem>Allocate seats</NavItem>
          <NavItem>Allocate faculty</NavItem>
          <NavItem>Attendance</NavItem>
          <NavItem>Send mails</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium">Data Mining · CS · Sem 4</span>
            <Pill tone="warning">ongoing</Pill>
          </div>
          <div className="flex items-center gap-2">
            <Pill>25 Jun · FN</Pill>
            <span className="rounded-lg bg-fg-1 px-3 py-1.5 text-[11px] font-semibold text-accent-ink">Smart allocate</span>
          </div>
        </>
      }
      aside={
        <>
          <p className="label text-[9.5px] text-fg-3">Faculty allocation</p>
          <ul className="mt-3 space-y-2">
            {[
              { n: "Dr. Casey Garcia", room: "D201", role: "Invigilator" },
              { n: "Prof. Anil Rao", room: "A-101", role: "Invigilator" },
              { n: "K. Meena", room: "B-202", role: "Lab tech" },
              { n: "S. Farhan", room: "C-301", role: "Invigilator" },
            ].map((f, i) => (
              <li key={f.n} className="vis-fade flex items-center justify-between rounded-xl border border-line-1 bg-bg-2/60 p-3" style={{ animationDelay: `${500 + i * 100}ms` }}>
                <span>
                  <span className="block text-[12px] text-fg-1">{f.n}</span>
                  <span className="label text-[9px] text-fg-3">{f.role}</span>
                </span>
                <span className="font-mono text-[11px] text-fg-2">{f.room}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-line-1 bg-bg-2/60 p-3">
            <div className="flex items-center justify-between">
              <span className="label text-[9.5px] text-fg-3">Notifications</span>
              <span className="label text-[9.5px] text-success">sent</span>
            </div>
            <p className="mt-2 font-mono text-[10.5px] text-fg-2">absentees · 3 emails</p>
            <p className="font-mono text-[10.5px] text-fg-2">malpractice · 1 email · ServiceNow INC opened</p>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Rooms" value="21" delta="6 blocks" delay={200} />
        <Kpi label="Students" value="345" delta="bulk import · validated" delay={280} />
        <Kpi label="Attendance" value="96%" delta="live from faculty app" tone="success" delay={360} spark={[70, 74, 80, 86, 90, 92, 95, 96]} />
        <Kpi label="Upcoming" value="4" delta="this week" delay={440} />
      </div>
      <div className="mt-4 grid grid-cols-[1.5fr_1fr] gap-4">
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Seat allocation · A-101</span>
            <div className="flex items-center gap-3 font-mono text-[10px] text-fg-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-accent/80" /> seated</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-error/70" /> absent</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-warning" /> flag</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-10 gap-2">
            {seats.map((s, i) => (
              <span
                key={i}
                className={`vis-fade aspect-square rounded-[5px] ${s === "seated" ? "bg-accent/70" : s === "absent" ? "bg-error/60" : s === "flag" ? "bg-warning" : "border border-line-2"}`}
                style={{ animationDelay: `${300 + i * 12}ms` }}
              />
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] text-fg-3">60 seats · 48 seated · 3 absent · 1 flagged · 8 free</p>
        </div>
        <div className="rounded-2xl border border-line-1 bg-bg-2/40 p-4">
          <span className="text-[13px] font-medium">Rooms today</span>
          <ul className="mt-3 space-y-2">
            {rooms.map((r, i) => (
              <li key={r} className="vis-fade flex items-center justify-between rounded-lg border border-line-1 px-3 py-2 text-[12px]" style={{ animationDelay: `${450 + i * 80}ms` }}>
                <span className="font-mono text-fg-1">{r}</span>
                <span className="text-fg-3">{[60, 60, 40, 40, 30, 30][i]} seats</span>
                <Pill tone={i < 2 ? "warning" : "success"}>{i < 2 ? "ongoing" : "ready"}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-line-1 bg-bg-2/40 px-4 pb-1 pt-4">
        <span className="text-[13px] font-medium">Recent exam schedules</span>
        <div className="mt-2">
          {[
            ["25 Jun · FN", "Data Mining", "CS", "4", "ongoing"],
            ["25 Jun · AN", "Operating Systems", "IT", "4", "upcoming"],
            ["26 Jun · FN", "DBMS", "IT", "3", "upcoming"],
            ["24 Jun · FN", "Computer Networks", "CS", "5", "completed"],
          ].map((r, i) => (
            <Row key={r[1]} className="grid-cols-[1fr_1.4fr_0.6fr_0.6fr_auto]" delay={600 + i * 90}>
              <span className="font-mono text-fg-3">{r[0]}</span>
              <span className="text-fg-1">{r[1]}</span>
              <span className="text-fg-3">{r[2]}</span>
              <span className="text-fg-3">Sem {r[3]}</span>
              <span className="inline-flex justify-end"><Pill tone={r[4] === "ongoing" ? "warning" : r[4] === "completed" ? "success" : "neutral"}>{r[4]}</Pill></span>
            </Row>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
