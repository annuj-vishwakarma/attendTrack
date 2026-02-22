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

// ─── Time conversion helpers ──────────────────────────────────
const timeStringTo24Hour = (timeStr) => {
  // Converts "10:30 AM" or "6:30 PM" to 24-hour format (10.5, 18.5)
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

const checkInStringTo24Hour = (checkInStr) => {
  // Converts "10:30" (24-hour format from database) to decimal (10.5)
  if (!checkInStr) return null;
  const match = checkInStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [_, h, m] = match;
  return parseInt(h) + parseInt(m) / 60;
};

// ─── Work Settings (from localStorage) ────────────────────────
export const getWorkSettings = () => {
  try {
    const saved = localStorage.getItem('at-work-settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load work settings:', e);
  }
  // Default settings (IST: 10:00 AM to 6:30 PM, late after 11:00 AM)
  return {
    startTime: '10:00 AM',
    endTime: '6:30 PM',
    lateThresholdTime: '11:00 AM',
    workDays: [1, 2, 3, 4, 5], // 1=Monday, 5=Friday
  };
};
// ─── Check if arrival is late ────────────────────────────────────
export const isLateArrival = (checkInTime, workSettings = null) => {
  if (!checkInTime) return false;
  const settings = workSettings || getWorkSettings();
  
  const lateThresholdDecimal = timeStringTo24Hour(settings.lateThresholdTime);
  const checkInDecimal = checkInStringTo24Hour(checkInTime);
  
  if (!lateThresholdDecimal || !checkInDecimal) return false;
  if (checkInDecimal <= lateThresholdDecimal) return false; // On time (before or at threshold)
  
  return true; // Late (after threshold)
};

// ─── Count late arrivals ──────────────────────────────────────────
export const countLateArrivals = (emp, y, m, records) => {
  const workSettings = getWorkSettings();
  let lateCount = 0;
  const d = daysInMonth(y, m);
  
  for (let i = 1; i <= d; i++) {
    const ds = dk(y, m, i);
    const rec = records[`${emp.id}::${ds}`];
    if (rec?.status === 'present' && rec?.checkIn) {
      if (isLateArrival(rec.checkIn, workSettings)) {
        lateCount++;
      }
    }
  }
  return lateCount;
};
// ─── Attendance Scoring Functions ────────────────────────────
export const calculateLateArrivalScore = (checkInTime, workSettings = null) => {
  if (!checkInTime) return 100; // No check-in = perfect (assuming leave/holiday)
  const settings = workSettings || getWorkSettings();
  
  const startTimeDecimal = timeStringTo24Hour(settings.startTime);
  const checkInDecimal = checkInStringTo24Hour(checkInTime);
  
  if (!startTimeDecimal || !checkInDecimal) return 100;
  
  if (checkInDecimal <= startTimeDecimal) return 100; // On time
  const minutesLate = (checkInDecimal - startTimeDecimal) * 60;
  if (minutesLate > 60) return 0; // More than 1 hour late
  return Math.max(0, 100 - (minutesLate * 1.67)); // Deduct ~1.67 per minute
};

export const calculateConsistencyScore = (attendanceStats) => {
  const { present = 0, absent = 0, wfh = 0, leave = 0 } = attendanceStats;
  const workDays = present + absent + wfh + leave;
  if (workDays === 0) return 0;
  
  const attendanceRate = (present + wfh) / workDays;
  const absenceRate = absent / workDays;
  
  // Base score from attendance rate (70% weight)
  const attendanceScore = attendanceRate * 70;
  // Penalty for absences (30% weight)
  const absenceScore = Math.max(0, 30 - (absenceRate * 60));
  
  return Math.round(attendanceScore + absenceScore);
};

export const calculateWeeklyPunctualityScore = (week, records, emp, workSettings = null) => {
  const settings = workSettings || getWorkSettings();
  let lateCount = 0;
  let presentCount = 0;
  
  week.forEach(ds => {
    const rec = records[`${emp.id}::${ds}`];
    if (rec?.status === 'present' && rec?.checkIn) {
      presentCount++;
      const score = calculateLateArrivalScore(rec.checkIn, settings);
      if (score < 100) lateCount++;
    }
  });
  
  if (presentCount === 0) return 100; // No data
  return Math.round(((presentCount - lateCount) / presentCount) * 100);
};

export const calculateAttendanceRating = (lateness, consistency, punctuality) => {
  const avg = (lateness + consistency + punctuality) / 3;
  
  if (avg >= 90) return { rating: "Excellent", color: "#10b981", emoji: "⭐" };
  if (avg >= 75) return { rating: "Good", color: "#3b82f6", emoji: "👍" };
  if (avg >= 60) return { rating: "Fair", color: "#f59e0b", emoji: "📊" };
  if (avg >= 45) return { rating: "Poor", color: "#ef4444", emoji: "⚠️" };
  return { rating: "Critical", color: "#991b1b", emoji: "❌" };
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
