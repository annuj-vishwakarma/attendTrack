-- ═══════════════════════════════════════════════════════════════
-- AttendTrack Pro — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- ── 1. EMPLOYEES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  department   TEXT,
  designation  TEXT NOT NULL,
  employee_id  TEXT UNIQUE NOT NULL,
  join_date    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. USERS (login accounts) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'rw_employee'
               CHECK (role IN ('admin','manager','rw_employee','ro_employee')),
  emp_id     TEXT REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. ATTENDANCE RECORDS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id           SERIAL PRIMARY KEY,
  emp_id       TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  status       TEXT NOT NULL
                 CHECK (status IN ('present','absent','wfh','leave','holiday','weekend')),
  check_in     TEXT,
  check_out    TEXT,
  leave_type   TEXT,
  holiday_name TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (emp_id, date)
);

-- ── 4. AUTO-UPDATE updated_at trigger ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON attendance;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_emp_id   ON attendance(emp_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date     ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance(emp_id, date);

-- ── 6. DISABLE Row Level Security ─────────────────────────────────
-- This is an internal tool — disabling RLS for simplicity.
ALTER TABLE employees  DISABLE ROW LEVEL SECURITY;
ALTER TABLE users      DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- ── 7. SEED default admin ─────────────────────────────────────────
INSERT INTO users (username, password, name, role)
VALUES ('admin', 'admin123', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Done! ✅ Go back to the app, add your keys to .env, and run npm start.
