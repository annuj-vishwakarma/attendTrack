import { ROLES } from './constants';

// ─── Date helpers ─────────────────────────────────────────────
export const dk = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

export const isWeekend = (dateStr) => {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
};

export const todayStr = () => {
  const n = new Date();
  return dk(n.getFullYear(), n.getMonth(), n.getDate());
};

export const formatTime = (t) => {
  if (!t) return "—";
  const [h, mn] = t.split(":");
  const hr = +h;
  return `${hr % 12 || 12}:${mn} ${hr >= 12 ? "PM" : "AM"}`;
};

// ─── Role helpers ─────────────────────────────────────────────
export const getPerms = (role) => ROLES[role] || ROLES.ro_employee;

// ─── Avatar colour ────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b",
  "#10b981","#3b82f6","#ef4444","#14b8a6",
];
export const strColor = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

// ─── Supabase row converters ──────────────────────────────────
export const rowToEmployee = (r) => ({
  id:          r.id,
  name:        r.name,
  email:       r.email       || "",
  phone:       r.phone       || "",
  department:  r.department  || "",
  designation: r.designation || "",
  employeeId:  r.employee_id || "",
  joinDate:    r.join_date   || "",
});

export const rowToUser = (r) => ({
  id:       r.id,
  username: r.username,
  password: r.password,
  name:     r.name,
  role:     r.role,
  empId:    r.emp_id || null,
});

export const rowsToRecords = (rows) => {
  const map = {};
  rows.forEach((r) => {
    map[`${r.emp_id}::${r.date}`] = {
      status:      r.status,
      checkIn:     r.check_in     || "",
      checkOut:    r.check_out    || "",
      leaveType:   r.leave_type   || "",
      holidayName: r.holiday_name || "",
      note:        r.note         || "",
    };
  });
  return map;
};
