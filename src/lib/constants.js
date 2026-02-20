// ─── Calendar & Date ──────────────────────────────────────────
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Domain ───────────────────────────────────────────────────
export const LEAVE_TYPES = [
  "Casual Leave","Sick Leave","Earned Leave",
  "Maternity/Paternity","Unpaid Leave",
];

export const DEPT_LIST = [
  "Engineering","HR","Finance","Marketing",
  "Operations","Design","Sales","Management",
];

// ─── Roles & permissions ──────────────────────────────────────
export const ROLES = {
  admin: {
    label: "Admin",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    canEditAll: true,
    canEditOwn: true,
    canViewAll: true,
    canManageEmp: true,
    canManageRoles: true,
  },
  manager: {
    label: "Manager",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    canEditAll: true,
    canEditOwn: true,
    canViewAll: true,
    canManageEmp: false,
    canManageRoles: false,
  },
  rw_employee: {
    label: "Employee (Read & Write)",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    canEditAll: false,
    canEditOwn: true,
    canViewAll: false,
    canManageEmp: false,
    canManageRoles: false,
  },
  ro_employee: {
    label: "Employee (Read Only)",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    canEditAll: false,
    canEditOwn: false,
    canViewAll: false,
    canManageEmp: false,
    canManageRoles: false,
  },
};

export const PERM_LABELS = [
  ["Edit any employee's attendance", "canEditAll"],
  ["Edit own attendance",            "canEditOwn"],
  ["View all employees' data",       "canViewAll"],
  ["Add / Remove employees",         "canManageEmp"],
  ["Manage user roles",              "canManageRoles"],
];

// ─── Attendance statuses ──────────────────────────────────────
export const STATUS = {
  present: { label: "Present", color: "#10b981", icon: "✓" },
  absent:  { label: "Absent",  color: "#ef4444", icon: "✗" },
  wfh:     { label: "WFH",     color: "#3b82f6", icon: "⌂" },
  leave:   { label: "Leave",   color: "#f59e0b", icon: "◉" },
  holiday: { label: "Holiday", color: "#8b5cf6", icon: "★" },
  weekend: { label: "Weekend", color: "#94a3b8", icon: "—" },
};
