const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ─── CSS Variables (Theme) ─── */
  :root {
    --color-primary: #6366f1;
    --color-primary-light: #a5b4fc;
    --color-primary-dark: #4f46e5;
    --color-bg-primary: #0a0a14;
    --color-bg-secondary: #13131f;
    --color-bg-tertiary: #1a1a2e;
    --color-bg-hover: rgba(99,102,241,0.05);
    --color-text-primary: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;
    --color-text-muted: #475569;
    --color-border-primary: rgba(99,102,241,0.2);
    --color-border-secondary: rgba(99,102,241,0.12);
    --color-border-light: rgba(255,255,255,0.1);
    --color-border-lighter: rgba(255,255,255,0.06);
    --color-border-muted: rgba(255,255,255,0.08);
    --color-status-success: #10b981;
    --color-status-error: #f87171;
    --color-status-warning: #f59e0b;
    --color-status-info: #0ea5e9;
    --color-danger-bg: rgba(239,68,68,0.18);
    --color-danger-text: #f87171;
    --color-danger-border: rgba(239,68,68,0.3);
    --color-overlay: rgba(0,0,0,0.78);
    --color-select: #13131f;
  }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--color-bg-primary); }
  ::-webkit-scrollbar-thumb { background: var(--color-bg-secondary); border-radius: 3px; }

  /* ── Viewport Meta Helpers ── */
  html { -webkit-text-size-adjust: 100%; }

  body {
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: background-color 0.3s, color 0.3s;
    font-family: 'DM Sans', sans-serif;
  }

  .login-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 20px;
    padding: 36px;
    width: 400px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
    position: relative;
    z-index: 1;
  }

  .field-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 5px;
  }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--color-border-light);
    border-radius: 10px;
    padding: 10px 12px;
    color: var(--color-text-primary);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, background-color 0.15s;
  }
  .field-input:focus {
    border-color: var(--color-primary);
    background: rgba(99,102,241,0.08);
  }
  select.field-input option { 
    background: var(--color-select); 
    color: var(--color-text-primary); 
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-primary:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.4);
  }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: var(--color-border-muted);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-muted);
    border-radius: 10px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 13px;
  }
  .btn-ghost:hover { 
    background: var(--color-bg-hover); 
    color: var(--color-text-primary); 
  }

  .btn-danger {
    background: var(--color-danger-bg);
    color: var(--color-danger-text);
    border: 1px solid var(--color-danger-border);
    border-radius: 10px;
    font-family: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-danger:hover { 
    background: rgba(239,68,68,0.28); 
  }

  .btn-sm {
    padding: 5px 11px;
    border-radius: 7px;
    border: none;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }
  .btn-sm:hover { opacity: 0.8; }

  .nav-item:hover { 
    background: var(--color-bg-hover) !important; 
    color: var(--color-primary-light) !important; 
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-overlay);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 16px;
    overflow-y: auto;
  }
  .modal-box {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.7);
    width: 100%;
    max-width: 420px;
    margin: auto;
  }

  .cal-cell { 
    border-radius: 9px; 
    padding: 6px; 
    min-height: 64px; 
    transition: all 0.12s;
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }
  .cal-cell:hover { transform: scale(1.03); filter: brightness(1.15); }

  .table-row:hover td { background: var(--color-bg-hover) !important; }

  /* ── Responsive table wrapper ── */
  .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

  /* ── Default page padding ── */
  .page-pad { padding: 26px 30px; }

  /* ── Header actions row ── */
  .header-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  /* ── Employee table/card toggle (desktop: table shown, card hidden) ── */
  .emp-card-list       { display: none !important; }
  .emp-table-wrapper   { display: block; }

  /* ── Mobile Bottom Nav ── */
  .mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: var(--color-bg-primary);
    border-top: 1px solid var(--color-border-secondary);
    z-index: 100;
    padding: 6px 0 env(safe-area-inset-bottom, 8px);
  }

  /* ── Mobile top header bar ── */
  .mobile-top-bar {
    display: none;
    position: sticky;
    top: 0;
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-border-secondary);
    padding: 10px 16px;
    z-index: 90;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  /* ── Grid utilities ── */
  .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; }
  .grid-6-col { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }

  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes qr-scan {
    0%   { top: 0%; }
    50%  { top: calc(100% - 3px); }
    100% { top: 0%; }
  }

  .qr-scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--color-status-success), transparent);
    border-radius: 2px;
    animation: qr-scan 2s linear infinite;
    box-shadow: 0 0 8px rgba(16,185,129,0.8);
  }

  /* html5-qrcode internal video element fix */
  #qr-scanner-region video {
    width: 100% !important;
    height: auto !important;
    border-radius: 10px;
    object-fit: cover;
  }
  #qr-scanner-region img { display: none !important; }

  /* ═══════════════════════════════════════════
     MOBILE RESPONSIVE — breakpoint ≤ 768px
  ═══════════════════════════════════════════ */
  @media (max-width: 768px) {

    /* Login card */
    .login-card {
      width: 100%;
      max-width: 100%;
      border-radius: 16px;
      padding: 28px 20px;
    }

    /* Sidebar: hide on mobile */
    .desktop-sidebar { display: none !important; }

    /* Mobile top bar & bottom nav */
    .mobile-top-bar  { display: flex !important; }
    .mobile-bottom-nav { display: flex !important; justify-content: space-around; align-items: center; }

    /* Main content: remove left flex squeeze, add bottom padding for bottom nav */
    .main-content { padding-bottom: 70px !important; }

    /* Modal: full-width on mobile */
    .modal-box { padding: 20px 16px; border-radius: 14px; }

    /* Grid columns: collapse to single column */
    .grid-2-col { grid-template-columns: 1fr !important; }
    .grid-3-col { grid-template-columns: repeat(2, 1fr) !important; }
    .grid-6-col { grid-template-columns: repeat(3, 1fr) !important; }

    /* Calendar cells: smaller */
    .cal-cell { min-height: 48px; padding: 4px; }
    .cal-cell:hover { transform: none; }

    /* Page padding */
    .page-pad { padding: 14px 14px 0 14px !important; }

    /* Status strip: 3 cols */
    .status-strip { grid-template-columns: repeat(3, 1fr) !important; }

    /* Buttons: full width in stacked contexts */
    .btn-stack { flex-direction: column !important; }
    .btn-stack > * { width: 100% !important; }

    /* Employee filters */
    .filter-row { flex-direction: column !important; }
    .filter-row .field-input { max-width: 100% !important; }

    /* Table: horizontal scroll */
    .table-scroll { overflow-x: auto; }
    .table-scroll table { min-width: 560px; }

    /* Report table */
    .report-table { min-width: 500px; }

    /* Dashboard bottom grid */
    .dash-grid { grid-template-columns: 1fr !important; }

    /* Header action row */
    .header-actions { flex-wrap: wrap; gap: 6px !important; }
    .header-actions button { font-size: 12px !important; padding: 6px 10px !important; }

    /* Employee: hide table, show cards */
    .emp-card-list     { display: block !important; }
    .emp-table-wrapper { display: none  !important; }

    /* Attendance employee pills: scroll horizontally */
    .emp-pills { flex-wrap: nowrap !important; overflow-x: auto; padding-bottom: 4px; }
    .emp-pills::-webkit-scrollbar { height: 3px; }
  }

  @media (max-width: 420px) {
    .grid-6-col { grid-template-columns: repeat(2, 1fr) !important; }
    .grid-3-col { grid-template-columns: 1fr !important; }
    .cal-cell   { min-height: 40px; }
  }
`;

export default CSS;
