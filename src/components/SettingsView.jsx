import { useState } from 'react';
import { PageHeader, Toast, Avatar, RoleBadge, ThemeToggle } from './ui';

export default function SettingsView({ users, session, updatePassword }) {
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

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

  const PW_FIELDS = [
    ['current', 'Current Password'],
    ['newPw', 'New Password'],
    ['confirm', 'Confirm Password'],
  ];

  return (
    <div className="page-pad" style={{ padding: "26px 30px" }}>
      <PageHeader title="Settings" subtitle="Account & preferences" />

      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 780 }}>

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
