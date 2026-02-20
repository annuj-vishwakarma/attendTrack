// Theme configuration for light and dark modes
export const themes = {
  dark: {
    // Primary colors
    primary: '#6366f1',
    primaryLight: '#a5b4fc',
    primaryDark: '#4f46e5',
    
    // Background colors
    bg: {
      primary: '#0a0a14',
      secondary: '#13131f',
      tertiary: '#1a1a2e',
      hover: 'rgba(99,102,241,0.05)',
    },
    
    // Text colors
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      tertiary: '#64748b',
      muted: '#475569',
    },
    
    // Border colors
    border: {
      primary: 'rgba(99,102,241,0.2)',
      secondary: 'rgba(99,102,241,0.12)',
      light: 'rgba(255,255,255,0.1)',
      lighter: 'rgba(255,255,255,0.06)',
      muted: 'rgba(255,255,255,0.08)',
    },
    
    // Status colors
    status: {
      success: '#10b981',
      error: '#f87171',
      warning: '#f59e0b',
      info: '#0ea5e9',
    },
    
    // Semantic colors
    danger: {
      bg: 'rgba(239,68,68,0.18)',
      text: '#f87171',
      border: 'rgba(239,68,68,0.3)',
    },
    
    // Overlay
    overlay: 'rgba(0,0,0,0.78)',
    
    // Code/Option backgrounds
    select: '#13131f',
  },
  
  light: {
    // Primary colors
    primary: '#4f46e5',
    primaryLight: '#4f46e5',
    primaryDark: '#4338ca',
    
    // Background colors
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      hover: 'rgba(79,70,229,0.05)',
    },
    
    // Text colors
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8',
    },
    
    // Border colors
    border: {
      primary: 'rgba(79,70,229,0.2)',
      secondary: 'rgba(79,70,229,0.12)',
      light: 'rgba(0,0,0,0.08)',
      lighter: 'rgba(0,0,0,0.04)',
      muted: 'rgba(0,0,0,0.06)',
    },
    
    // Status colors
    status: {
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',
      info: '#0284c7',
    },
    
    // Semantic colors
    danger: {
      bg: 'rgba(220,38,38,0.1)',
      text: '#dc2626',
      border: 'rgba(220,38,38,0.2)',
    },
    
    // Overlay
    overlay: 'rgba(0,0,0,0.5)',
    
    // Code/Option backgrounds
    select: '#ffffff',
  },
};

// CSS variable names for theme properties
export const cssVarMap = {
  '--color-primary': 'primary',
  '--color-primary-light': 'primaryLight',
  '--color-primary-dark': 'primaryDark',
  '--color-bg-primary': 'bg.primary',
  '--color-bg-secondary': 'bg.secondary',
  '--color-bg-tertiary': 'bg.tertiary',
  '--color-bg-hover': 'bg.hover',
  '--color-text-primary': 'text.primary',
  '--color-text-secondary': 'text.secondary',
  '--color-text-tertiary': 'text.tertiary',
  '--color-text-muted': 'text.muted',
  '--color-border-primary': 'border.primary',
  '--color-border-secondary': 'border.secondary',
  '--color-border-light': 'border.light',
  '--color-border-lighter': 'border.lighter',
  '--color-border-muted': 'border.muted',
  '--color-status-success': 'status.success',
  '--color-status-error': 'status.error',
  '--color-status-warning': 'status.warning',
  '--color-status-info': 'status.info',
  '--color-danger-bg': 'danger.bg',
  '--color-danger-text': 'danger.text',
  '--color-danger-border': 'danger.border',
  '--color-overlay': 'overlay',
  '--color-select': 'select',
};

// Helper to get nested theme values
export const getThemeValue = (theme, path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

// Apply theme to document root
export const applyTheme = (mode = 'dark') => {
  const theme = themes[mode];
  const root = document.documentElement;
  
  Object.entries(cssVarMap).forEach(([cssVar, themePath]) => {
    const value = getThemeValue(theme, themePath);
    root.style.setProperty(cssVar, value);
  });
  
  // Store preference
  localStorage.setItem('theme-preference', mode);
  root.setAttribute('data-theme', mode);
};

// Get saved theme or system preference
export const getInitialTheme = () => {
  const saved = localStorage.getItem('theme-preference');
  if (saved) return saved;
  
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
