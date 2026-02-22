import * as XLSX from 'xlsx';
import { DAYS, MONTHS, STATUS } from '../lib/constants';
import { dk, daysInMonth, isWeekend, formatTime, getPerms, calculateLateArrivalScore, calculateConsistencyScore, calculateWeeklyPunctualityScore, calculateAttendanceRating, getWorkSettings, countLateArrivals } from '../lib/helpers';
import { PageHeader, Toast, StatusBadge } from './ui';
import { useState } from 'react';

export default function ReportsView({ employees, records, session }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [scope, setScope] = useState('month');
  const [toast, setToast] = useState('');

  const p = getPerms(session?.user?.role);
  const emps = p.canViewAll
    ? employees
    : employees.filter(e => e.id === session?.user?.empId);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  function buildRows(emp, y, m) {
    const d = daysInMonth(y, m);
    const rows = [];
    const sts = { present: 0, absent: 0, wfh: 0, leave: 0, holiday: 0, weekend: 0 };
    for (let i = 1; i <= d; i++) {
      const ds = dk(y, m, i);
      const rec = records[`${emp.id}::${ds}`];
      const s = rec?.status || (isWeekend(ds) ? 'weekend' : null) || 'absent';
      if (sts[s] !== undefined) sts[s]++;
      rows.push({
        "Date": ds,
        "Day": DAYS[new Date(ds).getDay()],
        "Employee": emp.name,
        "Emp ID": emp.employeeId || '',
        "Department": emp.department || '',
        "Status": STATUS[s]?.label || s,
        "Check In": rec?.checkIn ? formatTime(rec.checkIn) : '',
        "Check Out": rec?.checkOut ? formatTime(rec.checkOut) : '',
        "Leave Type": s === 'leave' ? rec?.leaveType || '' : '',
        "Holiday": s === 'holiday' ? rec?.holidayName || '' : '',
        "Note": rec?.note || '',
      });
    }
    return { rows, sts };
  }

  function calculateMonthlyScores(emp, y, m) {
    const workSettings = getWorkSettings();
    const d = daysInMonth(y, m);
    const sts = { present: 0, absent: 0, wfh: 0, leave: 0, holiday: 0, weekend: 0 };
    const lateArrivals = [];
    const weeklyScores = [];
    
    // Calculate daily stats and track late arrivals
    for (let i = 1; i <= d; i++) {
      const ds = dk(y, m, i);
      const rec = records[`${emp.id}::${ds}`];
      const s = rec?.status || (isWeekend(ds) ? 'weekend' : null) || 'absent';
      if (sts[s] !== undefined) sts[s]++;
      
      if (rec?.status === 'present' && rec?.checkIn) {
        lateArrivals.push(calculateLateArrivalScore(rec.checkIn, workSettings));
      }
    }
    
    // Calculate weekly punctuality scores
    for (let week = 0; week < 5; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dayOfMonth = week * 7 + dayOfWeek + 1;
        if (dayOfMonth <= d) {
          weekDays.push(dk(y, m, dayOfMonth));
        }
      }
      if (weekDays.length > 0) {
        let lateInWeek = 0;
        let presentInWeek = 0;
        weekDays.forEach(ds => {
          const rec = records[`${emp.id}::${ds}`];
          if (rec?.status === 'present' && rec?.checkIn) {
            presentInWeek++;
            const score = calculateLateArrivalScore(rec.checkIn, workSettings);
            if (score < 100) lateInWeek++;
          }
        });
        const wscore = presentInWeek === 0 ? 100 : Math.round(((presentInWeek - lateInWeek) / presentInWeek) * 100);
        weeklyScores.push(wscore);
      }
    }
    
    // Calculate final scores
    const lateArrivalScore = lateArrivals.length > 0 
      ? Math.round(lateArrivals.reduce((a, b) => a + b, 0) / lateArrivals.length)
      : 100;
    const consistencyScore = calculateConsistencyScore(sts);
    const weeklyPunctualityScore = weeklyScores.length > 0 
      ? Math.round(weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length)
      : 100;
    const ratingInfo = calculateAttendanceRating(lateArrivalScore, consistencyScore, weeklyPunctualityScore);
    
    return { lateArrivalScore, consistencyScore, weeklyPunctualityScore, ratingInfo };
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const cw = [14, 8, 20, 10, 14, 10, 10, 10, 18, 18, 22].map(w => ({ wch: w }));

    if (scope === 'month' || !p.canViewAll) {
      emps.forEach(emp => {
        const { rows, sts } = buildRows(emp, year, month);
        const ws = XLSX.utils.aoa_to_sheet([
          ["AttendTrack Pro"],
          [`Employee: ${emp.name}  |  Dept: ${emp.department}`],
          [`Month: ${MONTHS[month]} ${year}`],
          [],
          ["SUMMARY"],
          ["Present", "Absent", "WFH", "Leave", "Holiday", "Weekend"],
          [sts.present, sts.absent, sts.wfh, sts.leave, sts.holiday, sts.weekend],
          [],
        ]);
        XLSX.utils.sheet_add_json(ws, rows, { origin: -1 });
        ws['!cols'] = cw;
        XLSX.utils.book_append_sheet(wb, ws, `${emp.name.split(' ')[0]}_${MONTHS[month].slice(0, 3)}`.slice(0, 31));
      });
      XLSX.writeFile(wb, `Attendance_${MONTHS[month]}${year}.xlsx`);
    } else {
      const months = new Set([`${year}-${String(month + 1).padStart(2, '0')}`]);
      Object.keys(records).forEach(k => {
        const pt = k.split('::');
        if (pt[1]) { const [y2, m2] = pt[1].split('-'); months.add(`${y2}-${m2}`); }
      });
      emps.forEach(emp => {
        const allRows = [];
        const totals = { present: 0, absent: 0, wfh: 0, leave: 0, holiday: 0, weekend: 0 };
        Array.from(months).sort().forEach(ym => {
          const [y2, m2] = ym.split('-').map(Number);
          const { rows, sts } = buildRows(emp, y2, m2 - 1);
          rows.forEach(r => allRows.push(r));
          Object.keys(totals).forEach(k => totals[k] += sts[k]);
        });
        const ws = XLSX.utils.aoa_to_sheet([
          ["AttendTrack Pro — Full Report"],
          [`Employee: ${emp.name}  |  Dept: ${emp.department}`],
          [`Exported: ${new Date().toLocaleDateString()}`],
          [],
          ["TOTALS"],
          ["Present", "Absent", "WFH", "Leave", "Holiday", "Weekend"],
          [totals.present, totals.absent, totals.wfh, totals.leave, totals.holiday, totals.weekend],
          [],
        ]);
        XLSX.utils.sheet_add_json(ws, allRows, { origin: -1 });
        ws['!cols'] = cw;
        XLSX.utils.book_append_sheet(wb, ws, emp.name.split(' ')[0].slice(0, 31));
      });
      XLSX.writeFile(wb, `Attendance_All_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
    showToast('Excel downloaded!');
  }

  const d = daysInMonth(year, month);
  const empStats = emps.map(emp => {
    const sts = { present: 0, absent: 0, wfh: 0, leave: 0, holiday: 0, weekend: 0 };
    for (let i = 1; i <= d; i++) {
      const s = records[`${emp.id}::${dk(year, month, i)}`]?.status || (isWeekend(dk(year, month, i)) ? 'weekend' : null) || 'absent';
      if (sts[s] !== undefined) sts[s]++;
    }
    return { emp, sts };
  });

  // Personal daily rows for employees who can't view all
  const myEmp = !p.canViewAll ? emps[0] : null;
  const myRows = myEmp
    ? Array(d).fill(null).map((_, i) => {
      const day = i + 1, ds = dk(year, month, day), rec = records[`${myEmp.id}::${ds}`];
      const s = rec?.status || (isWeekend(ds) ? 'weekend' : null);
      return { day, ds, rec, s };
    })
    : [];
  const myStats = {};
  Object.keys(STATUS).forEach(s => (myStats[s] = 0));
  myRows.forEach(({ s }) => { if (s && myStats[s] !== undefined) myStats[s]++; });

  return (
    <div className="page-pad" style={{ padding: "26px 30px" }}>
      <PageHeader
        title={p.canViewAll ? "Reports & Export" : "My Attendance Report"}
        subtitle={p.canViewAll ? "View and download attendance data" : `${session?.user?.name} — ${MONTHS[month]} ${year}`}
      >
        <div className="header-actions" style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          {p.canViewAll && ['month', 'all'].map(s => (
            <button key={s} onClick={() => setScope(s)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                background: scope === s ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)",
                color: scope === s ? "var(--color-text-secondary)" : "var(--color-text-tertiary)"
              }}>
              {s === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
          <button className="btn-primary" onClick={exportExcel} style={{ padding: "8px 18px", fontSize: 13, background: "linear-gradient(135deg,#059669,#047857)" }}>
            ⬇ Export
          </button>
        </div>
      </PageHeader>

      {/* Month navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn-ghost" onClick={prevMonth} style={{ padding: "5px 13px", fontSize: 15 }}>‹</button>
        <div style={{ fontSize: 16, fontWeight: 700, minWidth: 160, textAlign: "center" }}>{MONTHS[month]} {year}</div>
        <button className="btn-ghost" onClick={nextMonth} style={{ padding: "5px 13px", fontSize: 15 }}>›</button>
      </div>

      {/* ── Non-admin: personal daily report ── */}
      {!p.canViewAll && myEmp && (
        <>
          <div className="status-strip" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 7, marginBottom: 18 }}>
            {Object.entries(STATUS).map(([k, v]) => (
              <div key={k} style={{ background: "var(--color-bg-secondary)", borderRadius: 10, padding: "9px 11px", borderLeft: `3px solid ${v.color}` }}>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{v.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: v.color, lineHeight: 1.2, marginTop: 2 }}>{myStats[k]}</div>
              </div>
            ))}
          </div>

          {(() => {
            const scores = calculateMonthlyScores(myEmp, year, month);
            return (
              <div className="score-cards" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
                <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "16px", border: "1px solid var(--color-border-lighter)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>Late Arrival Score</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scores.lateArrivalScore >= 80 ? "#10b981" : scores.lateArrivalScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                    {scores.lateArrivalScore}%
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
                    {scores.lateArrivalScore >= 90 ? "Always on time" : scores.lateArrivalScore >= 70 ? "Generally punctual" : "Needs improvement"}
                  </div>
                </div>

                <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "16px", border: "1px solid var(--color-border-lighter)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>Consistency Score</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scores.consistencyScore >= 80 ? "#10b981" : scores.consistencyScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                    {scores.consistencyScore}%
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
                    {scores.consistencyScore >= 90 ? "Excellent attendance" : scores.consistencyScore >= 70 ? "Good attendance" : "Requires attention"}
                  </div>
                </div>

                <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "16px", border: "1px solid var(--color-border-lighter)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>Weekly Punctuality Score</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scores.weeklyPunctualityScore >= 80 ? "#10b981" : scores.weeklyPunctualityScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                    {scores.weeklyPunctualityScore}%
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
                    Week average punctuality
                  </div>
                </div>

                <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "16px", border: `2px solid ${scores.ratingInfo.color}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>Performance Rating</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scores.ratingInfo.color }}>
                    {scores.ratingInfo.emoji}
                  </div>
                  <div style={{ fontSize: 12, color: scores.ratingInfo.color, marginTop: 4, fontWeight: 600 }}>
                    {scores.ratingInfo.rating}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="table-scroll" style={{ background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-lighter)", overflow: "hidden" }}>
            <table className="report-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(99,102,241,0.08)" }}>
                  {["Date", "Day", "Status", "Check In", "Check Out", "Details", "Note"].map(h => (
                    <th key={h} style={{ padding: "10px 13px", textAlign: "left", fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myRows.map(({ day, ds, rec, s }) => (
                  <tr key={day} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 13px", fontWeight: 600, fontSize: 13 }}>{day} {MONTHS[month].slice(0, 3)}</td>
                    <td style={{ padding: "10px 13px", fontSize: 12, color: "var(--color-text-tertiary)" }}>{DAYS[new Date(ds).getDay()]}</td>
                    <td style={{ padding: "10px 13px" }}><StatusBadge status={s} /></td>
                    <td style={{ padding: "10px 13px", fontSize: 12, color: "var(--color-text-tertiary)" }}>{formatTime(rec?.checkIn)}</td>
                    <td style={{ padding: "10px 13px", fontSize: 12, color: "var(--color-text-tertiary)" }}>{formatTime(rec?.checkOut)}</td>
                    <td style={{ padding: "10px 13px", fontSize: 12, color: "var(--color-text-tertiary)" }}>
                      {s === 'leave' ? rec?.leaveType || '' : s === 'holiday' ? rec?.holidayName || '' : ''}
                    </td>
                    <td style={{ padding: "10px 13px", fontSize: 12, color: "var(--color-text-muted)" }}>{rec?.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Admin/Manager: summary table ── */}
      {p.canViewAll && scope === 'month' && (
        <div className="table-scroll" style={{ background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-lighter)", overflow: "hidden" }}>
          <table className="report-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(99,102,241,0.08)" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Employee</th>
                {Object.values(STATUS).map(v => (
                  <th key={v.label} style={{ padding: "10px 7px", textAlign: "center", fontSize: 9, color: v.color, fontWeight: 700, textTransform: "uppercase" }}>
                    {v.icon}<br />{v.label}
                  </th>
                ))}
                <th style={{ padding: "10px 7px", textAlign: "center", fontSize: 9, color: "#d97706", fontWeight: 700, textTransform: "uppercase" }}>⏰ Late Count</th>
                <th style={{ padding: "10px 7px", textAlign: "center", fontSize: 9, color: "#10b981", fontWeight: 700, textTransform: "uppercase" }}>Late Arrival %</th>
                <th style={{ padding: "10px 7px", textAlign: "center", fontSize: 9, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase" }}>Consistency</th>
                <th style={{ padding: "10px 7px", textAlign: "center", fontSize: 9, color: "#8b5cf6", fontWeight: 700, textTransform: "uppercase" }}>Punctuality</th>
                <th style={{ padding: "10px 7px", textAlign: "center", fontSize: 9, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {empStats.map(({ emp, sts }) => {
                const scores = calculateMonthlyScores(emp, year, month);
                const lateCount = countLateArrivals(emp, year, month, records);
                return (
                  <tr key={emp.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                      <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{emp.department}</div>
                    </td>
                    {Object.entries(STATUS).map(([k, v]) => (
                      <td key={k} style={{ padding: "10px 7px", textAlign: "center", fontSize: 13, fontWeight: 700, color: sts[k] > 0 ? v.color : "var(--color-text-muted)" }}>
                        {sts[k] || '—'}
                      </td>
                    ))}
                    <td style={{ padding: "10px 7px", textAlign: "center", fontSize: 13, fontWeight: 700, color: lateCount > 5 ? "#ef4444" : lateCount > 2 ? "#f59e0b" : "#10b981" }}>
                      ⏰ {lateCount}
                    </td>
                    <td style={{ padding: "10px 7px", textAlign: "center", fontSize: 12, fontWeight: 700, color: scores.lateArrivalScore >= 80 ? "#10b981" : scores.lateArrivalScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                      {scores.lateArrivalScore}%
                    </td>
                    <td style={{ padding: "10px 7px", textAlign: "center", fontSize: 12, fontWeight: 700, color: scores.consistencyScore >= 80 ? "#10b981" : scores.consistencyScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                      {scores.consistencyScore}%
                    </td>
                    <td style={{ padding: "10px 7px", textAlign: "center", fontSize: 12, fontWeight: 700, color: scores.weeklyPunctualityScore >= 80 ? "#10b981" : scores.weeklyPunctualityScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                      {scores.weeklyPunctualityScore}%
                    </td>
                    <td style={{ padding: "10px 7px", textAlign: "center", fontSize: 12, fontWeight: 700 }}>
                      <span style={{ color: scores.ratingInfo.color }}>{scores.ratingInfo.emoji}</span> <span style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>{scores.ratingInfo.rating}</span>
                    </td>
                  </tr>
                );
              })}
              {emps.length === 0 && (
                <tr><td colSpan={13} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>No employees</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Admin: all-time export CTA ── */}
      {p.canViewAll && scope === 'all' && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 7 }}>Export All Data</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Download complete attendance report across all recorded months.</div>
          <button className="btn-primary" onClick={exportExcel} style={{ padding: "11px 26px", fontSize: 14, background: "linear-gradient(135deg,#059669,#047857)" }}>
            ⬇ Download Full Report
          </button>
        </div>
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}
