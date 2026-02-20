# AttendTrack Pro

Organisation Attendance Management System built with React + Supabase.

## Features

- 📅 Calendar & table attendance views
- 👥 Employee management with departments
- 🔐 4-tier role system (Admin / Manager / Employee RW / Employee RO)
- 📊 Reports with Excel export
- ⚙️ Settings (admin only)
- ☁️ Supabase (PostgreSQL) backend — fully persistent

## Quick Start

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `schema.sql` → click **Run**
3. Go to **Settings → API** → copy your **Project URL** and **anon key**

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. Install & run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

**Default login:** `admin` / `admin123`

## Project Structure

```
src/
├── App.js                      # Root — data loading, Supabase CRUD
├── index.js                    # React entry point
│
├── lib/
│   ├── constants.js            # ROLES, STATUS, DEPT_LIST, etc.
│   ├── helpers.js              # Date utils, formatters, converters
│   ├── supabase.js             # Supabase REST client
│   └── styles.js               # Global CSS string
│
└── components/
    ├── ui.jsx                  # Shared: Avatar, Badge, Toast, PageHeader…
    ├── SetupScreen.jsx         # Shown when .env keys are missing
    ├── LoginScreen.jsx         # Login form
    ├── Shell.jsx               # Sidebar + layout
    ├── Dashboard.jsx           # KPI cards + today's list
    ├── AttendanceView.jsx      # Calendar / table + edit modal
    ├── EmployeesView.jsx       # Employee table + add/edit/permissions
    ├── ReportsView.jsx         # Monthly summary + Excel export
    └── SettingsView.jsx        # Password change + user list
```

## Roles & Permissions

| Permission             | Admin | Manager | Employee RW | Employee RO |
|------------------------|:-----:|:-------:|:-----------:|:-----------:|
| Edit any attendance    | ✓     | ✓       | ✗           | ✗           |
| Edit own attendance    | ✓     | ✓       | ✓           | ✗           |
| View all employees     | ✓     | ✓       | ✗           | ✗           |
| Add/remove employees   | ✓     | ✗       | ✗           | ✗           |
| Manage roles           | ✓     | ✗       | ✗           | ✗           |
| Access Settings        | ✓     | ✗       | ✗           | ✗           |

## Build for Production

```bash
npm run build
```

Outputs to `build/` — serve with any static host (Vercel, Netlify, etc.)
