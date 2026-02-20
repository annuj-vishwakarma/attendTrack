import { useState, useEffect } from 'react';
import { isConfigured, dbSelect, dbInsert, dbUpdate, dbUpsert, dbDelete } from './lib/supabase';
import { rowToEmployee, rowToUser, rowsToRecords } from './lib/helpers';
import CSS from './lib/styles';
import { ThemeProvider } from './hooks/useTheme';

import SetupScreen    from './components/SetupScreen';
import LoginScreen    from './components/LoginScreen';
import Shell          from './components/Shell';
import { LoadingScreen, ErrorScreen } from './components/ui';

export default function App() {
  const [session,   setSession]   = useState(null);
  const [screen,    setScreen]    = useState('login');
  const [users,     setUsers]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [records,   setRecords]   = useState({});
  const [loaded,    setLoaded]    = useState(false);
  const [dbError,   setDbError]   = useState(null);

  // ── Initial data load ─────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) { setLoaded(true); return; }

    (async () => {
      try {
        const [empRows, userRows, recRows] = await Promise.all([
          dbSelect('employees', 'order=name.asc'),
          dbSelect('users',     'order=id.asc'),
          dbSelect('attendance','order=date.asc'),
        ]);

        setEmployees(empRows.map(rowToEmployee));
        setUsers(userRows.map(rowToUser));
        setRecords(rowsToRecords(recRows));

        // Restore session from localStorage
        try {
          const saved = JSON.parse(localStorage.getItem('at-session') || 'null');
          if (saved) {
            const fresh = userRows.find(u => u.username === saved.user.username);
            if (fresh) {
              setSession({ user: rowToUser(fresh) });
              setScreen('dashboard');
            }
          }
        } catch (_) {}
      } catch (e) {
        setDbError(e.message);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Auth ──────────────────────────────────────────────────────
  const login = (user) => {
    setSession({ user });
    localStorage.setItem('at-session', JSON.stringify({ user }));
    setScreen('dashboard');
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('at-session');
    setScreen('login');
  };

  // ── Employees CRUD ────────────────────────────────────────────
  const addEmployee = async (empData, userData) => {
    // Insert employee first, then user (to satisfy foreign key constraint)
    const empRow = await dbInsert('employees', {
      id:          empData.id,
      name:        empData.name,
      email:       empData.email       || null,
      phone:       empData.phone       || null,
      department:  empData.department  || null,
      designation: empData.designation,
      employee_id: empData.employeeId,
      join_date:   empData.joinDate    || null,
    });
    const userRow = await dbInsert('users', {
      username: userData.username,
      password: userData.password,
      name:     userData.name,
      role:     userData.role || 'rw_employee',
      emp_id:   empData.id,
    });
    setEmployees(prev => [...prev, rowToEmployee(empRow[0])]);
    setUsers(prev     => [...prev, rowToUser(userRow[0])]);
  };

  const updateEmployee = async (empData, userData) => {
    await dbUpdate('employees', { id: empData.id }, {
      name:        empData.name,
      email:       empData.email       || null,
      phone:       empData.phone       || null,
      department:  empData.department  || null,
      designation: empData.designation,
      employee_id: empData.employeeId,
      join_date:   empData.joinDate    || null,
    });

    const userUpdates = { name: userData.name };
    if (userData.password) userUpdates.password = userData.password;
    await dbUpdate('users', { emp_id: empData.id }, userUpdates);

    setEmployees(prev => prev.map(e => e.id === empData.id ? empData : e));
    setUsers(prev => prev.map(u =>
      u.empId === empData.id
        ? { ...u, name:userData.name, ...(userData.password ? { password:userData.password } : {}) }
        : u
    ));
  };

  const deleteEmployee = async (empId) => {
    // Cascade: delete user and attendance records first (DB also handles this via FK)
    await dbDelete('users',     { emp_id: empId });
    await dbDelete('employees', { id: empId });
    setEmployees(prev => prev.filter(e => e.id !== empId));
    setUsers(prev     => prev.filter(u => u.empId !== empId));
    // Remove attendance records for this employee from local state
    setRecords(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(empId + '::')) delete next[k]; });
      return next;
    });
  };

  // ── User / Role management ────────────────────────────────────
  const updateUserRole = async (username, role) => {
    await dbUpdate('users', { username }, { role });
    const updated = users.map(u => u.username === username ? { ...u, role } : u);
    setUsers(updated);
    // Sync session if role changed for current user
    if (session?.user?.username === username) {
      const updatedSession = { user: { ...session.user, role } };
      setSession(updatedSession);
      localStorage.setItem('at-session', JSON.stringify(updatedSession));
    }
  };

  const updatePassword = async (username, newPassword) => {
    await dbUpdate('users', { username }, { password: newPassword });
    setUsers(prev => prev.map(u => u.username === username ? { ...u, password: newPassword } : u));
  };

  // ── Attendance CRUD ───────────────────────────────────────────
  const saveRecord = async (empId, date, recordData) => {
    await dbUpsert('attendance', {
      emp_id:       empId,
      date,
      status:       recordData.status,
      check_in:     recordData.checkIn      || null,
      check_out:    recordData.checkOut     || null,
      leave_type:   recordData.leaveType    || null,
      holiday_name: recordData.holidayName  || null,
      note:         recordData.note         || null,
    }, 'emp_id,date');
    setRecords(prev => ({ ...prev, [`${empId}::${date}`]: recordData }));
  };

  const deleteRecord = async (empId, date) => {
    await dbDelete('attendance', { emp_id:empId, date });
    setRecords(prev => {
      const next = { ...prev };
      delete next[`${empId}::${date}`];
      return next;
    });
  };

  // ── Guards ────────────────────────────────────────────────────
  if (!isConfigured)  return <SetupScreen />;
  if (!loaded)        return <LoadingScreen message="Connecting to Supabase…" />;
  if (dbError)        return <ErrorScreen  message={dbError} />;

  // ── Props bundle passed to all screens ────────────────────────
  const sharedProps = {
    session,
    users,
    employees,
    records,
    screen,
    setScreen,
    login,
    logout,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateUserRole,
    updatePassword,
    saveRecord,
    deleteRecord,
  };

  return (
    <ThemeProvider>
      <div style={{ minHeight:"100vh", background:"var(--color-bg-primary)", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"var(--color-text-primary)" }}>
        <style>{CSS}</style>
        {screen === 'login' ? <LoginScreen {...sharedProps}/> : <Shell {...sharedProps}/>}
      </div>
    </ThemeProvider>
  );
}
