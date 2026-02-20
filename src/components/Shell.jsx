import { useState } from 'react';
import { getPerms } from '../lib/helpers';
import { RoleBadge } from './ui';
import Dashboard from './Dashboard';
import AttendanceView from './AttendanceView';
import EmployeesView from './EmployeesView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';

const NAV_ITEMS_BASE = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
];

export default function Shell(props) {
  const { screen, setScreen, session, logout } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const p = getPerms(session?.user?.role);
  const isAdmin = session?.user?.role === 'admin';

  const navItems = [
    ...NAV_ITEMS_BASE,
    ...(p.canViewAll || p.canManageEmp ? [{ id: 'employees', label: 'Employees', icon: '👥' }] : []),
    { id: 'reports', label: 'Reports', icon: '📊' },
    ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: '⚙' }] : []),
  ];

  // Mobile bottom nav shows only up to 4 items; rest in a drawer
  const bottomNavItems = navItems.slice(0, 4);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar" style={{
        width: collapsed ? 64 : 220,
        flexShrink: 0,
        background: "var(--color-bg-primary)",
        borderRight: "1px solid var(--color-border-secondary)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s",
        overflow: "hidden",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "16px 13px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", gap: 10, minHeight: 62 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }}>
            📋
          </div>
          {!collapsed && <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-primary-light)", whiteSpace: "nowrap" }}>AttendTrack</div>}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "10px 7px" }}>
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="nav-item"
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 9px", borderRadius: 10, cursor: "pointer",
                marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden",
                background: screen === item.id ? "var(--color-bg-hover)" : "transparent",
                color: screen === item.id ? "var(--color-primary-light)" : "var(--color-text-tertiary)",
              }}
            >
              <span style={{ fontSize: 17, flexShrink: 0, width: 20, textAlign: "center" }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom: user info + actions */}
        <div style={{ padding: "10px 7px", borderTop: "1px solid var(--color-border-light)" }}>
          {!collapsed && (
            <div style={{ padding: "9px 9px", marginBottom: 5, borderRadius: 10, background: "var(--color-bg-hover)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.name}
              </div>
              <div style={{ marginTop: 4 }}>
                <RoleBadge role={session?.user?.role} />
              </div>
            </div>
          )}

          {[
            ['⏻', 'Logout', logout],
            [collapsed ? '▶' : '◀', collapsed ? 'Expand' : 'Collapse', () => setCollapsed(c => !c)],
          ].map(([icon, label, fn]) => (
            <div
              key={label}
              onClick={fn}
              className="nav-item"
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 9px", borderRadius: 10, cursor: "pointer", color: "var(--color-text-tertiary)", marginBottom: 2 }}
            >
              <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}>{icon}</span>
              {!collapsed && <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right panel (mobile top bar + main content) ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Mobile Top Bar */}
        <div className="mobile-top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              📋
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-primary-light)" }}>AttendTrack</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RoleBadge role={session?.user?.role} />
            {/* Hamburger / extra nav items */}
            {navItems.length > 4 && (
              <div
                onClick={() => setMenuOpen(o => !o)}
                style={{ fontSize: 18, cursor: "pointer", color: "var(--color-text-tertiary)", padding: "4px 6px", borderRadius: 8, background: "var(--color-border-light)" }}
              >
                ☰
              </div>
            )}
            <div
              onClick={logout}
              style={{ fontSize: 13, cursor: "pointer", color: "var(--color-danger-text)", padding: "4px 8px", borderRadius: 8, background: "var(--color-danger-bg)", fontWeight: 700 }}
            >
              ⏻
            </div>
          </div>
        </div>

        {/* Mobile Overflow Menu Drawer */}
        {menuOpen && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 150,
          }} onClick={() => setMenuOpen(false)}>
            <div
              style={{
                position: "absolute", top: 54, right: 12,
                background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)",
                borderRadius: 14, padding: "8px", minWidth: 180,
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {navItems.slice(4).map(item => (
                <div
                  key={item.id}
                  onClick={() => { setScreen(item.id); setMenuOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: screen === item.id ? "var(--color-bg-hover)" : "transparent",
                    color: screen === item.id ? "var(--color-primary-light)" : "var(--color-text-secondary)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <main className="main-content" style={{ flex: 1, overflow: "auto", background: "var(--color-bg-primary)" }}>
          {screen === 'dashboard' && <Dashboard      {...props} />}
          {screen === 'attendance' && <AttendanceView  {...props} />}
          {screen === 'employees' && <EmployeesView   {...props} />}
          {screen === 'reports' && <ReportsView      {...props} />}
          {screen === 'settings' && (isAdmin ? <SettingsView {...props} /> : <Dashboard {...props} />)}
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="mobile-bottom-nav">
          {bottomNavItems.map(item => (
            <div
              key={item.id}
              onClick={() => setScreen(item.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "6px 10px", borderRadius: 10, cursor: "pointer", minWidth: 56,
                color: screen === item.id ? "var(--color-primary-light)" : "var(--color-text-muted)",
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {item.label}
              </span>
              {screen === item.id && (
                <div style={{ width: 18, height: 2, borderRadius: 2, background: "var(--color-primary)", marginTop: 1 }} />
              )}
            </div>
          ))}
          {/* More button when there are extra nav items */}
          {navItems.length > 4 && (
            <div
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "6px 10px", borderRadius: 10, cursor: "pointer", minWidth: 56,
                color: "var(--color-text-muted)",
              }}
            >
              <span style={{ fontSize: 20 }}>⋯</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>More</span>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
