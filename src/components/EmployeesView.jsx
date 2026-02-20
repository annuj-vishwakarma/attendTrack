import { useState } from 'react';
import { DEPT_LIST, ROLES, PERM_LABELS } from '../lib/constants';
import { getPerms } from '../lib/helpers';
import { PageHeader, Toast, Avatar, RoleBadge, ConfirmModal } from './ui';

export default function EmployeesView({ employees, users, session, addEmployee, updateEmployee, deleteEmployee, updateUserRole }) {
  const p = getPerms(session?.user?.role);

  const [modal, setModal] = useState(null); // null | 'add' | empObj
  const [permModal, setPermModal] = useState(null); // userObj
  const [delTarget, setDelTarget] = useState(null); // empObj
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const emptyForm = { name: '', email: '', phone: '', department: 'Engineering', designation: '', employeeId: '', joinDate: '', username: '', password: '' };
  const [form, setForm] = useState(emptyForm);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const setField = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  // ── Save employee (add or edit) ───────────────────────────────
  async function handleSave() {
    setFormErr('');
    if (!form.name.trim()) return setFormErr('Name is required');
    if (!form.employeeId.trim()) return setFormErr('Employee ID is required');
    if (!form.designation.trim()) return setFormErr('Designation is required');
    if (modal === 'add') {
      if (!form.username.trim()) return setFormErr('Username is required');
      if (!form.password.trim()) return setFormErr('Password is required');
      if (users.find(u => u.username === form.username)) return setFormErr('Username already taken');
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        const id = `emp_${Date.now()}`;
        await addEmployee(
          { id, name: form.name, email: form.email, phone: form.phone, department: form.department, designation: form.designation, employeeId: form.employeeId, joinDate: form.joinDate },
          { username: form.username, password: form.password, name: form.name, role: 'rw_employee' }
        );
        showToast(`${form.name} added`);
      } else {
        await updateEmployee(
          { id: modal.id, name: form.name, email: form.email, phone: form.phone, department: form.department, designation: form.designation, employeeId: form.employeeId, joinDate: form.joinDate },
          { name: form.name, password: form.password }
        );
        showToast(`${form.name} updated`);
      }
      setModal(null);
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Save permission ───────────────────────────────────────────
  async function handleSavePerm(username, role) {
    try {
      await updateUserRole(username, role);
      setPermModal(null);
      showToast('Permissions updated');
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      await deleteEmployee(delTarget.id);
      showToast(`${delTarget.name} removed`);
      setDelTarget(null);
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  }

  // ── Filter ────────────────────────────────────────────────────
  const filtered = employees.filter(e => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      e.designation?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (deptFilter === 'All' || e.department === deptFilter);
  });

  // ── Field rows for add/edit modal ────────────────────────────
  const FIELDS = [
    ['name', 'Full Name', 'text', true],
    ['employeeId', 'Employee ID', 'text', true],
    ['email', 'Email', 'email', false],
    ['phone', 'Phone', 'text', false],
    ['designation', 'Designation', 'text', true],
    ['joinDate', 'Join Date', 'date', false],
  ];

  return (
    <div className="page-pad" style={{ padding: "26px 30px" }}>
      <PageHeader title="Employees" subtitle={`${employees.length} total`}>
        {p.canManageEmp && (
          <button className="btn-primary"
            onClick={() => { setForm({ ...emptyForm, employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}` }); setFormErr(''); setModal('add'); }}
            style={{ padding: "8px 18px", fontSize: 13 }}>
            + Add Employee
          </button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="filter-row" style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="field-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, designation…" style={{ maxWidth: 270, padding: "8px 12px", fontSize: 13 }} />
        <select className="field-input" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ maxWidth: 160, padding: "8px 12px", fontSize: 13 }}>
          <option>All</option>
          {DEPT_LIST.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* ── Mobile Card List (visible on small screens) ── */}
      <div className="emp-card-list" style={{ display: "none" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)", fontSize: 13 }}>
            {employees.length === 0 ? 'No employees yet. Click "+ Add Employee" to start.' : 'No results found.'}
          </div>
        )}
        {filtered.map(emp => {
          const empUser = users.find(u => u.empId === emp.id);
          return (
            <div key={emp.id} style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid var(--color-border-lighter)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar name={emp.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700 }}>{emp.employeeId}</div>
                </div>
                {empUser && <RoleBadge role={empUser.role} />}
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 10, flexWrap: "wrap" }}>
                {emp.department && <span style={{ background: "var(--color-border-light)", padding: "2px 8px", borderRadius: 20 }}>{emp.department}</span>}
                {emp.designation && <span style={{ background: "var(--color-border-light)", padding: "2px 8px", borderRadius: 20 }}>{emp.designation}</span>}
                {empUser && <span style={{ color: "#4ade80" }}>@{empUser.username}</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {p.canManageEmp && (
                  <button className="btn-sm"
                    onClick={() => { setForm({ ...emp, username: empUser?.username || '', password: '' }); setFormErr(''); setModal(emp); }}
                    style={{ background: "var(--color-primary)", background: "rgba(99,102,241,0.15)", color: "var(--color-primary-light)", flex: 1 }}>
                    Edit
                  </button>
                )}
                {p.canManageRoles && empUser && (
                  <button className="btn-sm"
                    onClick={() => setPermModal({ ...empUser })}
                    style={{ background: "rgba(139,92,246,0.15)", color: "var(--color-text-primary)", flex: 1 }}>
                    Permissions
                  </button>
                )}
                {p.canManageEmp && (
                  <button className="btn-sm"
                    onClick={() => setDelTarget(emp)}
                    style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", flex: 1 }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop Table ── */}
      <div className="emp-table-wrapper table-scroll" style={{ background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-lighter)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
          <thead>
            <tr style={{ background: "var(--color-bg-hover)" }}>
              {["Employee", "ID", "Department", "Designation", "Login / Role", "Actions"].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)", fontSize: 13 }}>
                {employees.length === 0 ? 'No employees yet. Click "+ Add Employee" to start.' : 'No results found.'}
              </td></tr>
            )}
            {filtered.map(emp => {
              const empUser = users.find(u => u.empId === emp.id);
              return (
                <tr key={emp.id} style={{ borderTop: "1px solid var(--color-border-lighter)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Avatar name={emp.name} size={34} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#6366f1", fontWeight: 700 }}>{emp.employeeId}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#94a3b8" }}>{emp.department}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#94a3b8" }}>{emp.designation}</td>
                  <td style={{ padding: "12px 14px" }}>
                    {empUser
                      ? <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 11, color: "#4ade80" }}>@{empUser.username}</span>
                        <RoleBadge role={empUser.role} />
                      </div>
                      : <span style={{ fontSize: 11, color: "#475569" }}>No login</span>
                    }
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {p.canManageEmp && (
                        <button className="btn-sm"
                          onClick={() => { setForm({ ...emp, username: empUser?.username || '', password: '' }); setFormErr(''); setModal(emp); }}
                          style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
                          Edit
                        </button>
                      )}
                      {p.canManageRoles && empUser && (
                        <button className="btn-sm"
                          onClick={() => setPermModal({ ...empUser })}
                          style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}>
                          Permissions
                        </button>
                      )}
                      {p.canManageEmp && (
                        <button className="btn-sm"
                          onClick={() => setDelTarget(emp)}
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-box" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 3, color: "var(--color-text-secondary)" }}>
              {modal === 'add' ? 'Add New Employee' : 'Edit Employee'}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 20 }}>
              {modal === 'add' ? 'New employees start with Read & Write access by default' : 'Update employee details'}
            </div>

            <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 11 }}>
              {FIELDS.map(([f, l, t, required]) => (
                <div key={f}>
                  <label className="field-label">{l}{required && <span style={{ color: "#f87171" }}> *</span>}</label>
                  <input className="field-input" type={t} value={form[f] || ''} onChange={setField(f)} style={{ fontSize: 13, padding: "7px 10px" }} />
                </div>
              ))}
              <div>
                <label className="field-label">Department</label>
                <select className="field-input" value={form.department} onChange={setField('department')} style={{ fontSize: 13, padding: "7px 10px" }}>
                  {DEPT_LIST.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 13, marginBottom: 11 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 9 }}>Login Credentials</div>
              <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                <div>
                  <label className="field-label">Username{modal === 'add' && <span style={{ color: "#f87171" }}> *</span>}</label>
                  <input className="field-input" value={form.username || ''} onChange={setField('username')}
                    placeholder={modal !== 'add' ? '(unchanged)' : ''}
                    style={{ fontSize: 13, padding: "7px 10px" }} />
                </div>
                <div>
                  <label className="field-label">Password{modal === 'add' && <span style={{ color: "#f87171" }}> *</span>}</label>
                  <input className="field-input" type="password" value={form.password || ''} onChange={setField('password')}
                    placeholder={modal !== 'add' ? '(leave blank to keep)' : ''}
                    style={{ fontSize: 13, padding: "7px 10px" }} />
                </div>
              </div>
            </div>

            {formErr && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f87171", marginBottom: 11 }}>
                {formErr}
              </div>
            )}

            <div style={{ display: "flex", gap: 9 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "10px" }}>
                {saving ? 'Saving…' : modal === 'add' ? 'Add Employee' : 'Save Changes'}
              </button>
              <button className="btn-ghost" onClick={() => setModal(null)} style={{ padding: "10px 16px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permissions Modal ── */}
      {permModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPermModal(null); }}>
          <div className="modal-box" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 3, color: "var(--color-text-secondary)" }}>Edit Permissions</div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 20 }}>
              Access level for <strong style={{ color: "var(--color-text-primary)" }}>{permModal.name}</strong> (@{permModal.username})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {Object.entries(ROLES).map(([key, cfg]) => {
                const selected = permModal.role === key;
                const locked = permModal.username === 'admin' && key !== 'admin';
                return (
                  <div key={key}
                    onClick={() => !locked && setPermModal(pm => ({ ...pm, role: key }))}
                    style={{
                      padding: "13px 15px", borderRadius: 11, cursor: locked ? 'not-allowed' : 'pointer', transition: "all 0.12s",
                      opacity: locked ? 0.4 : 1,
                      background: selected ? `${cfg.color}15` : "rgba(255,255,255,0.04)",
                      border: `2px solid ${selected ? cfg.color : "rgba(255,255,255,0.07)"}`
                    }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: selected ? cfg.color : "#334155", border: `2px solid ${cfg.color}` }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: selected ? cfg.color : "#e2e8f0" }}>{cfg.label}</span>
                      </div>
                      {locked && <span style={{ fontSize: 10, color: "#64748b" }}>Protected</span>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginLeft: 18 }}>
                      {PERM_LABELS.map(([label, pk]) => (
                        <div key={pk} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: cfg[pk] ? "#94a3b8" : "#334155" }}>
                          <span style={{ color: cfg[pk] ? "#4ade80" : "#475569", fontWeight: 700, fontSize: 10 }}>{cfg[pk] ? '✓' : '✗'}</span>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button className="btn-primary" onClick={() => handleSavePerm(permModal.username, permModal.role)} style={{ flex: 1, padding: "10px" }}>
                Save Permissions
              </button>
              <button className="btn-ghost" onClick={() => setPermModal(null)} style={{ padding: "10px 16px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {delTarget && (
        <ConfirmModal
          title="Delete Employee?"
          message={<>Permanently remove <strong style={{ color: "#e2e8f0" }}>{delTarget.name}</strong> and their login. Attendance records will also be deleted.</>}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}
