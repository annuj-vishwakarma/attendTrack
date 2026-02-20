import { useState, useEffect } from 'react';
import { DAYS, MONTHS, STATUS, LEAVE_TYPES } from '../lib/constants';
import { dk, daysInMonth, firstDayOfMonth, isWeekend, todayStr, formatTime, getPerms } from '../lib/helpers';
import { Toast, StatusBadge } from './ui';
import QRCodeModal from './QRCodeModal';
import QRScannerModal from './QRScannerModal';

export default function AttendanceView({ employees, records, session, saveRecord, deleteRecord }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calView, setCalView] = useState('calendar');
  const [selEmp, setSelEmp] = useState(null);
  const [modal, setModal] = useState(null);   // { day, key }
  const [form, setForm] = useState({});
  const [editConf, setEditConf] = useState(null);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [showQR, setShowQR] = useState(false);   // employee QR display
  const [showScanner, setShowScanner] = useState(false);   // admin/manager QR scanner

  const p = getPerms(session?.user?.role);
  const isAdminOrMgr = session?.user?.role === 'admin' || session?.user?.role === 'manager';
  const isEmployee = session?.user?.role === 'rw_employee' || session?.user?.role === 'ro_employee';
  const viewable = p.canViewAll
    ? employees
    : employees.filter(e => e.id === session?.user?.empId);

  const canEdit = emp => {
    if (!emp) return false;
    if (p.canEditAll) return true;
    if (p.canEditOwn && emp.id === session?.user?.empId) return true;
    return false;
  };

  useEffect(() => {
    if (viewable.length > 0 && (!selEmp || !viewable.find(e => e.id === selEmp.id))) {
      setSelEmp(viewable[0]);
    }
  }, [selEmp, viewable, employees, session]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const d = daysInMonth(year, month);
  const fd = firstDayOfMonth(year, month);

  const getStatus = (emp, day) => {
    if (!emp) return null;
    const rec = records[`${emp.id}::${dk(year, month, day)}`];
    return rec?.status || (isWeekend(dk(year, month, day)) ? 'weekend' : null);
  };

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  function openDay(day) {
    if (!selEmp) return;
    if (!canEdit(selEmp)) { setDenied(true); setTimeout(() => setDenied(false), 2500); return; }
    const key = `${selEmp.id}::${dk(year, month, day)}`;
    const rec = records[key];
    if (rec?.status) { setEditConf({ day, key, rec, existingStatus: rec.status }); return; }
    doOpen(day, key, rec);
  }

  function doOpen(day, key, rec) {
    const ex = rec || {};
    const def = isWeekend(dk(year, month, day)) ? 'weekend' : 'present';
    setForm({
      status: ex.status || def,
      checkIn: ex.checkIn || '',
      checkOut: ex.checkOut || '',
      leaveType: ex.leaveType || LEAVE_TYPES[0],
      holidayName: ex.holidayName || '',
      note: ex.note || '',
    });
    setModal({ day, key });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const [empId, date] = modal.key.split(/::/);
      await saveRecord(empId, date, form);
      setModal(null);
      showToast('Attendance saved');
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    try {
      const [empId, date] = modal.key.split(/::/);
      await deleteRecord(empId, date);
      setModal(null);
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  }

  // Per-month stats for selected employee
  const stats = {};
  Object.keys(STATUS).forEach(s => (stats[s] = 0));
  if (selEmp) {
    for (let i = 1; i <= d; i++) {
      const s = getStatus(selEmp, i);
      if (s) stats[s]++;
    }
  }

  return (
    <div className="page-pad">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 14, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--color-text-primary)", margin: 0 }}>Attendance</h1>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>{MONTHS[month]} {year}</div>
        </div>
        <div className="header-actions">
          {/* Employee: show their own QR code */}
          {isEmployee && selEmp && (
            <button
              className="btn-primary"
              onClick={() => setShowQR(true)}
              style={{ padding: "7px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
            >
              🔲 My QR Code
            </button>
          )}
          {/* Admin / Manager: scan employee QR to mark present */}
          {isAdminOrMgr && (
            <button
              className="btn-primary"
              onClick={() => setShowScanner(true)}
              style={{
                padding: "7px 14px", fontSize: 13,
                background: "linear-gradient(135deg,#10b981,#059669)",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              📷 Scan QR
            </button>
          )}
          {/* Admin can also view any selected employee's QR */}
          {isAdminOrMgr && selEmp && (
            <button
              className="btn-ghost"
              onClick={() => setShowQR(true)}
              style={{ padding: "7px 14px", fontSize: 13 }}
            >
              🔲 QR Code
            </button>
          )}
          <button className="btn-ghost" onClick={() => setCalView(v => v === 'calendar' ? 'table' : 'calendar')} style={{ padding: "7px 14px", fontSize: 13 }}>
            {calView === 'calendar' ? 'Table View' : 'Calendar View'}
          </button>
        </div>
      </div>

      {/* Read-only banner */}
      {denied && (
        <div style={{ background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)", borderRadius: 10, padding: "11px 15px", marginBottom: 14, fontSize: 13, color: "var(--color-danger-text)", display: "flex", alignItems: "center", gap: 7 }}>
          🔒 <strong>Read-only access.</strong> You don't have permission to edit attendance.
        </div>
      )}

      {/* Employee selector (only if multiple visible) */}
      {viewable.length > 1 && (
        <div className="emp-pills" style={{ marginBottom: 14, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center", overflowX: "auto" }}>
          <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 3, flexShrink: 0 }}>Employee:</span>
          {viewable.map(e => (
            <div key={e.id} onClick={() => setSelEmp(e)}
              style={{
                padding: "5px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.12s", flexShrink: 0,
                background: selEmp?.id === e.id ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" : "var(--color-border-light)",
                color: selEmp?.id === e.id ? "#fff" : "var(--color-text-tertiary)",
                border: `2px solid ${selEmp?.id === e.id ? "transparent" : "rgba(255,255,255,0.08)"}`
              }}>
              {e.name}
            </div>
          ))}
        </div>
      )}

      {/* Access badge */}
      {selEmp && (
        <div style={{ marginBottom: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Your access for <strong style={{ color: "var(--color-text-primary)" }}>{selEmp.name}</strong>:</span>
          {canEdit(selEmp)
            ? <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(74,222,128,0.2)" }}>✏️ Read & Write</span>
            : <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)" }}>👁 Read Only</span>
          }
        </div>
      )}

      {employees.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--color-text-muted)" }}>No employees added yet.</div>
      )}

      {selEmp && (
        <>
          {/* Status strip */}
          <div className="status-strip" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 7, marginBottom: 18 }}>
            {Object.entries(STATUS).map(([k, v]) => (
              <div key={k} style={{ background: "var(--color-bg-secondary)", borderRadius: 10, padding: "9px 11px", borderLeft: `3px solid ${v.color}` }}>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{v.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: v.color, lineHeight: 1.2, marginTop: 2 }}>{stats[k]}</div>
              </div>
            ))}
          </div>

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <button className="btn-ghost" onClick={prevMonth} style={{ padding: "5px 13px", fontSize: 15 }}>‹</button>
            <div style={{ fontSize: 16, fontWeight: 700, minWidth: 180, textAlign: "center" }}>{MONTHS[month]} {year}</div>
            <button className="btn-ghost" onClick={nextMonth} style={{ padding: "5px 13px", fontSize: 15 }}>›</button>
          </div>

          {/* ── Calendar View ── */}
          {calView === 'calendar' && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--color-text-tertiary)", padding: "3px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                {Array(fd).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(d).fill(null).map((_, i) => {
                  const day = i + 1;
                  const ds = dk(year, month, day);
                  const s = getStatus(selEmp, day);
                  const cfg = s ? STATUS[s] : null;
                  const rec = records[`${selEmp.id}::${ds}`];
                  const isToday = ds === todayStr();
                  const ed = canEdit(selEmp);
                  return (
                    <div key={day} onClick={() => openDay(day)} className="cal-cell"
                      style={{
                        background: cfg ? `${cfg.color}18` : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${isToday ? "#6366f1" : cfg ? cfg.color + "44" : "rgba(255,255,255,0.06)"}`,
                        boxShadow: isToday ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
                        cursor: ed ? "pointer" : "default", opacity: !ed && !cfg ? 0.55 : 1
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: isToday ? "var(--color-primary-light)" : "var(--color-text-secondary)" }}>{day}</span>
                        {cfg && <span style={{ fontSize: 11, color: cfg.color }}>{cfg.icon}</span>}
                      </div>
                      {rec?.checkIn && <div style={{ fontSize: 9, color: "var(--color-text-muted)", marginTop: 1 }}>{formatTime(rec.checkIn)}</div>}
                      {s === 'leave' && rec?.leaveType && <div style={{ fontSize: 9, color: STATUS.leave.color, fontWeight: 700, marginTop: 1 }}>{rec.leaveType.split(' ')[0]}</div>}
                      {s === 'holiday' && rec?.holidayName && <div style={{ fontSize: 9, color: STATUS.holiday.color, fontWeight: 700, marginTop: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{rec.holidayName}</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 11, marginTop: 12, flexWrap: "wrap" }}>
                {Object.entries(STATUS).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-tertiary)" }}>
                    <span style={{ color: v.color }}>{v.icon}</span>{v.label}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Table View ── */}
          {calView === 'table' && (
            <div className="table-scroll" style={{ background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-lighter)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr style={{ background: "rgba(99,102,241,0.08)" }}>
                    {["Date", "Day", "Status", "In", "Out", "Details", "Note"].map(h => (
                      <th key={h} style={{ padding: "10px 13px", textAlign: "left", fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array(d).fill(null).map((_, i) => {
                    const day = i + 1;
                    const ds = dk(year, month, day);
                    const rec = records[`${selEmp.id}::${ds}`];
                    const s = rec?.status || (isWeekend(ds) ? 'weekend' : null);
                    return (
                      <tr key={day} onClick={() => openDay(day)} className="table-row"
                        style={{ borderTop: "1px solid var(--color-border-lighter)", cursor: canEdit(selEmp) ? "pointer" : "default" }}>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Edit Confirmation Modal ── */}
      {editConf && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditConf(null); }}>
          <div className="modal-box" style={{ width: 360, textAlign: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: "rgba(99,102,241,0.15)", border: "2px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>✏️</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "var(--color-text-primary)", marginBottom: 7 }}>Edit Attendance?</div>
            <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 5 }}>
              <span style={{ color: "var(--color-text-secondary)", fontWeight: 700 }}>{selEmp?.name}</span> on <strong style={{ color: "var(--color-text-primary)" }}>{editConf.day} {MONTHS[month]} {year}</strong>
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 4 }}>Currently marked as:</div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><StatusBadge status={editConf.existingStatus} /></div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>Do you want to edit this record?</div>
            <div style={{ display: "flex", gap: 9 }}>
              <button className="btn-ghost" onClick={() => setEditConf(null)} style={{ flex: 1, padding: "10px" }}>No, Keep It</button>
              <button className="btn-primary" onClick={() => { setEditConf(null); doOpen(editConf.day, editConf.key, editConf.rec); }} style={{ flex: 1, padding: "10px" }}>Yes, Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Day Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-box" style={{ width: 390 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2, color: "var(--color-text-secondary)" }}>{modal.day} {MONTHS[month]} {year}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 16 }}>{selEmp?.name}</div>

            {/* Status grid */}
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Status</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
                {Object.entries(STATUS).map(([k, v]) => (
                  <div key={k} onClick={() => setForm(f => ({ ...f, status: k }))}
                    style={{
                      padding: "7px 5px", borderRadius: 8, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 600,
                      background: form.status === k ? `${v.color}22` : "var(--color-border-lighter)",
                      color: form.status === k ? v.color : "var(--color-text-tertiary)",
                      border: `2px solid ${form.status === k ? v.color : "transparent"}`,
                      transition: "all 0.1s"
                    }}>
                    {v.icon} {v.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in / out */}
            {(form.status === 'present' || form.status === 'wfh') && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 12 }}>
                {[['checkIn', 'Check In'], ['checkOut', 'Check Out']].map(([f, l]) => (
                  <div key={f}>
                    <label className="field-label">{l}</label>
                    <input type="time" className="field-input" value={form[f]} onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))} style={{ fontSize: 13, padding: "7px 9px" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Leave type */}
            {form.status === 'leave' && (
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Leave Type</label>
                <select className="field-input" value={form.leaveType} onChange={e => setForm(x => ({ ...x, leaveType: e.target.value }))} style={{ fontSize: 13, padding: "7px 9px" }}>
                  {LEAVE_TYPES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            )}

            {/* Holiday name */}
            {form.status === 'holiday' && (
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Holiday Name</label>
                <input className="field-input" value={form.holidayName} onChange={e => setForm(x => ({ ...x, holidayName: e.target.value }))} placeholder="e.g. Diwali…" style={{ fontSize: 13, padding: "7px 9px" }} />
              </div>
            )}

            {/* Note */}
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Note</label>
              <input className="field-input" value={form.note} onChange={e => setForm(x => ({ ...x, note: e.target.value }))} placeholder="Optional…" style={{ fontSize: 13, padding: "7px 9px" }} />
            </div>

            <div style={{ display: "flex", gap: 7 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "9px" }}>{saving ? 'Saving…' : 'Save'}</button>
              <button className="btn-sm" onClick={handleClear} style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "9px 13px" }}>Clear</button>
              <button className="btn-ghost" onClick={() => setModal(null)} style={{ padding: "9px 13px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} />}

      {/* ── QR Code Display Modal (for selected employee) ── */}
      {showQR && selEmp && (
        <QRCodeModal
          employee={selEmp}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* ── QR Scanner Modal (admin / manager only) ── */}
      {showScanner && (
        <QRScannerModal
          employees={employees}
          records={records}
          onScan={async (empId, date, data) => {
            await saveRecord(empId, date, data);
            showToast(`✓ ${employees.find(e => e.id === empId)?.name || 'Employee'} marked Present`);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
