import { AppShell, Avatar, Kpi, NavItem, Pill, themes } from "./ui";

const days = [
  { d: "23", w: "Mon", n: 2 },
  { d: "24", w: "Tue", n: 3 },
  { d: "25", w: "Wed", n: 4, today: true },
  { d: "26", w: "Thu", n: 2 },
  { d: "27", w: "Fri", n: 1 },
  { d: "28", w: "Sat", n: 0 },
];
const seats = Array.from({ length: 6 * 10 }, (_, i) => (i % 13 === 0 ? "absent" : i % 7 === 0 ? "flag" : i % 4 === 0 ? "free" : "seated"));
const faculty = [
  { n: "Dr. Casey Garcia", room: "D-201", role: "Invigilator", ok: true },
  { n: "Prof. Anil Rao", room: "A-101", role: "Invigilator", ok: true },
  { n: "K. Meena", room: "B-202", role: "Lab tech", ok: true },
  { n: "S. Farhan", room: "C-301", role: "Invigilator", ok: false },
];

export function ExamScreen() {
  return (
    <AppShell
      theme={themes.campus}
      title="ExamSeat"
      accentTitle="Aditya University"
      url="exam-seating-management.vercel.app/admin"
      logo={<span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[12px] font-bold text-[#4c1d95]">A</span>}
      sidebar={
        <>
          <NavItem active>Home</NavItem>
          <NavItem>Manage rooms</NavItem>
          <NavItem>Exam schedules</NavItem>
          <NavItem>Allocate seats</NavItem>
          <NavItem>Allocate faculty</NavItem>
          <NavItem>Add user</NavItem>
          <NavItem>Send mails</NavItem>
        </>
      }
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold tracking-tight">Exam day · 25 June</span>
            <Pill tone="warning">2 ongoing</Pill>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-line-1 bg-bg-2 px-3 py-1.5 text-[12px] text-fg-2">Download template</span>
            <span className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-[12px] font-semibold text-white">Upload students</span>
            <Avatar name="Admin User" size={28} />
          </div>
        </>
      }
    >
      {/* calendar strip */}
      <div className="flex items-center gap-2 overflow-hidden rounded-2xl border border-line-1 bg-bg-2 p-2">
        {days.map((d) => (
          <div key={d.d} className={`flex flex-1 flex-col items-center rounded-xl px-2 py-2 ${d.today ? "bg-accent text-white" : "text-fg-2"}`}>
            <span className="text-[10px] uppercase tracking-wide opacity-80">{d.w}</span>
            <span className="text-[18px] font-semibold leading-tight">{d.d}</span>
            <span className={`mt-1 text-[10px] ${d.today ? "text-white/80" : "text-fg-3"}`}>{d.n ? `${d.n} exams` : "—"}</span>
          </div>
        ))}
        <div className="ml-2 grid grid-cols-2 gap-2 pr-1">
          <span className="rounded-lg bg-[#16a34a]/10 px-3 py-2 text-center text-[11px] font-semibold text-[#15803d]">4 completed</span>
          <span className="rounded-lg bg-[#f59e0b]/10 px-3 py-2 text-center text-[11px] font-semibold text-[#b45309]">2 ongoing</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        <Kpi label="Total rooms" value="21" delta="6 blocks · 3 buildings" delay={200} />
        <Kpi label="Students today" value="345" delta="bulk import · openpyxl" delay={280} />
        <Kpi label="Attendance" value="96%" delta="marked from faculty app" tone="success" delay={360} spark={[70, 74, 80, 86, 90, 92, 95, 96]} />
        <Kpi label="Absentee mails" value="3" delta="sent 09:42 · ServiceNow INC0010042" tone="warning" delay={440} />
      </div>

      <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-line-1 bg-bg-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold">Seat allocation · Room A-101</p>
              <p className="text-[11px] text-fg-3">Data Mining · CS · Sem 4 · FN session</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-fg-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-accent" /> seated</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-[#dc2626]" /> absent</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-[#f59e0b]" /> flagged</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-10 gap-2">
            {seats.map((s, i) => (
              <span key={i} className={`vis-fade grid aspect-square place-items-center rounded-[6px] font-mono text-[8px] ${s === "seated" ? "bg-accent/85 text-white" : s === "absent" ? "bg-[#dc2626]/80 text-white" : s === "flag" ? "bg-[#f59e0b] text-white" : "border border-line-2 text-fg-3"}`} style={{ animationDelay: `${300 + i * 10}ms` }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-fg-3">
            <span>60 seats · 48 seated · 3 absent · 1 flagged · 8 free</span>
            <span className="rounded-md bg-accent/10 px-2 py-1 text-accent">Smart allocate ✓</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line-1 bg-bg-2 p-4">
            <p className="text-[13px] font-semibold">Faculty allocation</p>
            <ul className="mt-3 space-y-2">
              {faculty.map((f, i) => (
                <li key={f.n} className="vis-fade flex items-center gap-3 rounded-xl border border-line-1 px-3 py-2" style={{ animationDelay: `${450 + i * 90}ms` }}>
                  <Avatar name={f.n} size={26} />
                  <span className="flex flex-1 flex-col leading-tight"><span className="text-[12.5px] text-fg-1">{f.n}</span><span className="text-[10.5px] text-fg-3">{f.role}</span></span>
                  <span className="font-mono text-[11px] text-fg-2">{f.room}</span>
                  <Pill tone={f.ok ? "success" : "warning"}>{f.ok ? "confirmed" : "pending"}</Pill>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line-1 bg-bg-2 p-4">
            <p className="text-[13px] font-semibold">Student & faculty apps</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-bg-1 p-2.5"><p className="text-fg-3">React Native</p><p className="font-medium text-fg-1">Today&apos;s exam · Room A-101 · 09:30</p></div>
              <div className="rounded-lg bg-bg-1 p-2.5"><p className="text-fg-3">Push notification</p><p className="font-medium text-fg-1">Duty reminder sent to 21 invigilators</p></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
