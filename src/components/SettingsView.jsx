import { useState, useEffect } from 'react';
import { PageHeader, Toast, Avatar, RoleBadge, ThemeToggle } from './ui';

// Helper to convert 12-hour time string (e.g., "10:30 AM") to 24-hour format
const timeStringTo24 = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let [_, h, m, period] = match;
  h = parseInt(h);
  m = parseInt(m);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return h + m / 60;
};

// Helper to convert 24-hour format (e.g., 10.5) to 12-hour string (e.g., "10:30 AM")
const hoursTo12HourString = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
};

export default function SettingsView({ users, session, updatePassword }) {
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [workSettings, setWorkSettings] = useState({
    startTime: '10:00 AM',
    endTime: '6:30 PM',
    lateThresholdTime: '11:00 AM', // NEW: When to count as late
    workDays: [1, 2, 3, 4, 5], // 1=Monday, 5=Friday
  });

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('at-work-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format (startHour/endHour) to new format (startTime/endTime)
        if (parsed.startHour !== undefined && parsed.endHour !== undefined) {
          setWorkSettings({
            startTime: hoursTo12HourString(parsed.startHour),
            endTime: hoursTo12HourString(parsed.endHour),
            lateThresholdTime: hoursTo12HourString(parsed.startHour + 1), // Default: 1 hour after start
            workDays: parsed.workDays || [1, 2, 3, 4, 5]
          });
        } else {
          setWorkSettings(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load work settings:', e);
    }
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  async function handleChangePassword() {
    setErr('');
    const u = users.find(x => x.username === session?.user?.username);
    if (!u || u.password !== pw.current) return setErr('Current password is incorrect');
    if (pw.newPw.length < 6) return setErr('New password must be at least 6 characters');
    if (pw.newPw !== pw.confirm) return setErr('Passwords do not match');
    setSaving(true);
    try {
      await updatePassword(session.user.username, pw.newPw);
      setPw({ current: '', newPw: '', confirm: '' });
      showToast('Password updated successfully');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveWorkSettings() {
    // Validate time format
    const startValid = /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(workSettings.startTime);
    const endValid = /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(workSettings.endTime);
    const lateValid = /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(workSettings.lateThresholdTime);
    
    if (!startValid || !endValid || !lateValid) {
      showToast('Invalid time format. Use HH:MM AM/PM (e.g., 10:30 AM)');
      return;
    }

    try {
      localStorage.setItem('at-work-settings', JSON.stringify(workSettings));
      showToast('Work settings saved successfully');
    } catch (e) {
      showToast('Failed to save work settings');
    }
  }

  function toggleWorkDay(dayIndex) {
    setWorkSettings(prev => ({
      ...prev,
      workDays: prev.workDays.includes(dayIndex)
        ? prev.workDays.filter(d => d !== dayIndex)
        : [...prev.workDays, dayIndex].sort((a, b) => a - b)
    }));
  }

  const PW_FIELDS = [
    ['current', 'Current Password'],
    ['newPw', 'New Password'],
    ['confirm', 'Confirm Password'],
  ];

  return (
    <div className="page-pad" style={{ padding: "26px 30px" }}>
      <PageHeader title="Settings" subtitle="Account & preferences" />

      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 1200 }}>

        {/* ── Theme Preferences ── */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "20px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Appearance</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 16 }}>Choose your preferred theme</div>
          
          <div style={{ display: "flex", gap: 10 }}>
            <ThemeToggle />
          </div>
        </div>

        {/* ── Change Password ── */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "20px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Change Password</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 16 }}>Update your login password</div>

          {PW_FIELDS.map(([f, l]) => (
            <div key={f} style={{ marginBottom: 10 }}>
              <label className="field-label">{l}</label>
              <input
                type="password"
                className="field-input"
                value={pw[f]}
                onChange={e => setPw(x => ({ ...x, [f]: e.target.value }))}
                style={{ fontSize: 13, padding: "8px 10px" }}
              />
            </div>
          ))}

          {err && <div style={{ color: "var(--color-danger-text)", fontSize: 12, marginBottom: 9 }}>{err}</div>}

          <button className="btn-primary" onClick={handleChangePassword} disabled={saving} style={{ width: "100%", padding: "9px" }}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </div>

        {/* ── Work Hours (12-hour format with manual input) ── */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "20px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Work Hours (IST)</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 16 }}>Set your work schedule (12-hour format)</div>

          <div style={{ marginBottom: 12 }}>
            <label className="field-label">Start Time</label>
            <input
              type="text"
              className="field-input"
              value={workSettings.startTime}
              onChange={e => setWorkSettings(prev => ({ ...prev, startTime: e.target.value.toUpperCase() }))}
              placeholder="10:00 AM"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 4 }}>Format: HH:MM AM/PM (e.g., 10:00 AM)</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Late Threshold Time</label>
            <input
              type="text"
              className="field-input"
              value={workSettings.lateThresholdTime}
              onChange={e => setWorkSettings(prev => ({ ...prev, lateThresholdTime: e.target.value.toUpperCase() }))}
              placeholder="11:00 AM"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 4 }}>Anyone arriving after this time will be marked late</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">End Time</label>
            <input
              type="text"
              className="field-input"
              value={workSettings.endTime}
              onChange={e => setWorkSettings(prev => ({ ...prev, endTime: e.target.value.toUpperCase() }))}
              placeholder="6:30 PM"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 4 }}>Format: HH:MM AM/PM (e.g., 6:30 PM)</div>
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: "10px 12px", background: "rgba(99,102,241,0.1)", borderRadius: 8, marginBottom: 14 }}>
            📍 Work: <strong>{workSettings.startTime}</strong> → Late after: <strong>{workSettings.lateThresholdTime}</strong> → End: <strong>{workSettings.endTime}</strong>
          </div>

          <button className="btn-primary" onClick={handleSaveWorkSettings} style={{ width: "100%", padding: "9px", background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
            💾 Save Work Hours
          </button>
        </div>

        {/* ── Working Days ── */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "20px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Working Days</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 16 }}>Select your work days</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 14 }}>
            {DAYS_OF_WEEK.map((day, idx) => (
              <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={workSettings.workDays.includes(idx)}
                  onChange={() => toggleWorkDay(idx)}
                  style={{ cursor: "pointer", width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, flex: 1 }}>{day}</span>
              </label>
            ))}
          </div>

          <button className="btn-primary" onClick={handleSaveWorkSettings} style={{ width: "100%", padding: "9px", background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
            Save Working Days
          </button>
        </div>

        {/* ── All Users ── */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "20px", border: "1px solid var(--color-border-lighter)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>All Users ({users.length})</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 16 }}>System accounts and their roles</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 310, overflowY: "auto" }}>
            {users.map(u => (
              <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,0.03)" }}>
                <Avatar name={u.name} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>@{u.username}</div>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {toast && <Toast msg={toast} />}
    </div>
  );
}
