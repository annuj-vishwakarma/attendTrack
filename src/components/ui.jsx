import { ROLES, STATUS } from '../lib/constants';
import { strColor } from '../lib/helpers';
import { useTheme } from '../hooks/useTheme';

// ─── Page Header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, gap:14, flexWrap:"wrap" }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.5px", color:"var(--color-text-primary)", margin:0 }}>{title}</h1>
        {subtitle && <div style={{ fontSize:12, color:"var(--color-text-muted)", marginTop:3 }}>{subtitle}</div>}
      </div>
      {children && (
        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>{children}</div>
      )}
    </div>
  );
}

// ─── Toast notification ───────────────────────────────────────
export function Toast({ msg }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:"var(--color-status-success)", color:"#fff", padding:"10px 17px", borderRadius:10, fontWeight:600, fontSize:13, boxShadow:"0 8px 24px rgba(0,0,0,0.4)", zIndex:300 }}>
      ✓ {msg}
    </div>
  );
}

// ─── Error Toast ──────────────────────────────────────────────
export function ErrorToast({ msg }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:"var(--color-status-error)", color:"#fff", padding:"10px 17px", borderRadius:10, fontWeight:600, fontSize:13, boxShadow:"0 8px 24px rgba(0,0,0,0.4)", zIndex:300 }}>
      ✗ {msg}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, size = 34 }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.28),
      background: `linear-gradient(135deg, ${strColor(name || "?")}, ${strColor((name || "?") + "x")})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.36), fontWeight: 800, flexShrink: 0, color: "#fff",
    }}>
      {initials}
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────
export function RoleBadge({ role }) {
  const cfg = ROLES[role] || ROLES.ro_employee;
  return (
    <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color:cfg.color, background:cfg.bg, padding:"2px 7px", borderRadius:20, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (!status) return null;
  const cfg = STATUS[status];
  return (
    <span style={{ fontSize:11, fontWeight:700, color:cfg.color, background:`${cfg.color}22`, padding:"2px 9px", borderRadius:20, border:`1px solid ${cfg.color}44`, whiteSpace:"nowrap" }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────
export function LoadingScreen({ message = "Loading…" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"var(--color-bg-primary)", flexDirection:"column", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid rgba(99,102,241,0.3)", borderTop:"3px solid var(--color-primary)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <div style={{ color:"var(--color-primary)", fontFamily:"monospace", fontSize:15 }}>{message}</div>
    </div>
  );
}

// ─── Error Screen ─────────────────────────────────────────────
export function ErrorScreen({ message }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"var(--color-bg-primary)", flexDirection:"column", gap:12, padding:24 }}>
      <div style={{ fontSize:40 }}>❌</div>
      <div style={{ color:"var(--color-status-error)", fontSize:18, fontWeight:700 }}>Supabase Connection Failed</div>
      <div style={{ color:"var(--color-text-tertiary)", fontSize:13, maxWidth:500, textAlign:"center", fontFamily:"monospace", background:"var(--color-danger-bg)", padding:"12px 16px", borderRadius:8, border:"1px solid var(--color-danger-border)" }}>
        {message}
      </div>
      <div style={{ color:"var(--color-text-tertiary)", fontSize:13, textAlign:"center", maxWidth:440 }}>
        Check your <code>.env</code> file — make sure <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_ANON_KEY</code> are correct, and that you've run <code>schema.sql</code> in Supabase.
      </div>
    </div>
  );
}

// ─── Confirm / Delete Modal ───────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-box" style={{ width:330, textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:10 }}>{danger ? "⚠️" : "❓"}</div>
        <div style={{ fontWeight:800, fontSize:16, marginBottom:7, color: danger ? "var(--color-status-error)" : "var(--color-text-primary)" }}>{title}</div>
        <div style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:20 }}>{message}</div>
        <div style={{ display:"flex", gap:9 }}>
          {danger
            ? <button className="btn-danger" onClick={onConfirm} style={{ flex:1, padding:"10px" }}>Yes, Delete</button>
            : <button className="btn-primary" onClick={onConfirm} style={{ flex:1, padding:"10px" }}>Confirm</button>
          }
          <button className="btn-ghost" onClick={onCancel} style={{ padding:"10px 15px" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Theme Toggle Button ──────────────────────────────────────
export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost"
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 12px',
        fontSize: '13px',
      }}
    >
      {mode === 'dark' ? '☀️' : '🌙'}
      <span style={{ fontSize: '11px' }}>{mode === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

