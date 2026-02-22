import { DAYS, MONTHS, STATUS } from '../lib/constants';
import { dk, daysInMonth, isWeekend, todayStr, getPerms, countLateArrivals } from '../lib/helpers';
import { Avatar, StatusBadge } from './ui';

export default function Dashboard({ employees, records, session }) {
  const today = new Date();
  const ts = todayStr();
  const y = today.getFullYear();
  const m = today.getMonth();
  const p = getPerms(session?.user?.role);
  const emps = p.canViewAll
    ? employees
    : employees.filter(e => e.id === session?.user?.empId);

  // Today counts
  const td = { present: 0, absent: 0, wfh: 0, leave: 0, holiday: 0, weekend: 0, unmarked: 0, late: 0 };
  emps.forEach(e => {
    const s = records[`${e.id}::${ts}`]?.status || (isWeekend(ts) ? 'weekend' : null);
    s ? td[s]++ : td.unmarked++;
    // Count late arrivals today
    if (records[`${e.id}::${ts}`]?.isLate) {
      td.late++;
    }
  });

  // Month summary
  const d = daysInMonth(y, m);
  const ms = { present: 0, absent: 0, wfh: 0, leave: 0, holiday: 0 };
  let monthlyLateCount = 0;
  
  emps.forEach(e => {
    for (let i = 1; i <= d; i++) {
      const s = records[`${e.id}::${dk(y, m, i)}`]?.status || (isWeekend(dk(y, m, i)) ? 'weekend' : null);
      if (s && ms[s] !== undefined) ms[s]++;
      // Count monthly late arrivals
      if (records[`${e.id}::${dk(y, m, i)}`]?.isLate) {
        monthlyLateCount++;
      }
    }
  });

  const KPI_CARDS = [
    { l: "Employees", v: emps.length, c: "#6366f1", i: "👥" },
    { l: "Present", v: td.present, c: "#10b981", i: "✓" },
    { l: "WFH", v: td.wfh, c: "#3b82f6", i: "⌂" },
    { l: "On Leave", v: td.leave, c: "#f59e0b", i: "◉" },
    { l: "Absent", v: td.absent, c: "#ef4444", i: "✗" },
    { l: "Late Today", v: td.late, c: "#d97706", i: "⏰" },
  ];

  return (
    <div className="page-pad" style={{ padding: "26px 30px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--color-text-primary)", margin: 0 }}>Dashboard</h1>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>
          {DAYS[today.getDay()]}, {MONTHS[m]} {today.getDate()}, {y}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 20 }}>
        {KPI_CARDS.map(k => (
          <div key={k.l} style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${k.c}33`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -6, right: -6, fontSize: 44, opacity: 0.07 }}>{k.i}</div>
            <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{k.l}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: k.c, lineHeight: 1 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid — collapses to 1 col on mobile */}
      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Today's list */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "18px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Today's Attendance</div>
          {emps.length === 0 && (
            <div style={{ color: "var(--color-text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No employees yet.</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 270, overflowY: "auto" }}>
            {emps.map(e => {
              const s = records[`${e.id}::${ts}`]?.status || (isWeekend(ts) ? 'weekend' : null);
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 9, background: "var(--color-bg-hover)" }}>
                  <Avatar name={e.name} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{e.department}</div>
                  </div>
                  {s
                    ? <StatusBadge status={s} />
                    : <span style={{ fontSize: 10, color: "var(--color-text-muted)", background: "var(--color-border-light)", padding: "2px 8px", borderRadius: 20 }}>Not marked</span>
                  }
                </div>
              );
            })}
          </div>
        </div>

        {/* Month summary bars */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "18px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{MONTHS[m]} {y} — Summary</div>
          {Object.entries(ms).map(([k, v]) => {
            const cfg = STATUS[k];
            const total = emps.length * d;
            const pct = total ? Math.round(v / total * 100) : 0;
            return (
              <div key={k} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{v}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "var(--color-border-light)" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: cfg.color }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-border-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 600 }}>⏰ Late Arrivals</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>{monthlyLateCount}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "var(--color-border-light)" }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(monthlyLateCount * 5, 100)}%`, background: "#d97706" }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
