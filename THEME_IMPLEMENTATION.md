# Dark & Light Theme System - Implementation Guide

## Overview

The attendTrack application now includes a comprehensive dark and light theme system using CSS variables and React Context. Users can toggle between themes, and their preference is persisted in localStorage.

## Architecture

### 1. **Theme Configuration** (`src/lib/theme.js`)
Contains all theme colors and configurations for both dark and light modes:
- Primary colors and variants
- Background colors (primary, secondary, tertiary, hover)
- Text colors (primary, secondary, tertiary, muted)
- Border colors (various opacity levels)
- Status colors (success, error, warning, info)
- Semantic colors (danger, overlay)

### 2. **Theme Provider & Hook** (`src/hooks/useTheme.jsx`)
Provides React Context for theme management:
- `ThemeProvider`: Wraps the application to enable theme functionality
- `useTheme()`: Custom hook to access theme state and toggle function
- Automatically detects system preference on first load
- Persists user preference to localStorage

### 3. **CSS with Variables** (`src/lib/styles.js`)
All colors in the stylesheet use CSS custom properties:
- Variables are defined in `:root` selector
- Updated when theme changes
- Smooth transitions between themes (`0.3s`)

### 4. **Theme Toggle Component** (`src/components/ui.jsx`)
`ThemeToggle` component provides UI for switching themes:
- Shows current mode (Dark/Light) with emoji icons (🌙/☀️)
- Uses the ghost button style for consistency

## Usage

### For Users
1. Go to **Settings** (Admin only)
2. Click the theme toggle button in the "Appearance" section
3. Theme preference is automatically saved

### For Developers

#### Use the Theme Hook
```jsx
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <div>
      Current theme: {mode}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

#### Use CSS Variables in Styles
```js
// Instead of hardcoded colors
background: 'var(--color-bg-secondary)'
color: 'var(--color-text-primary)'
border: '1px solid var(--color-border-primary)'
```

#### Available CSS Variables
```css
--color-primary
--color-primary-light
--color-primary-dark

--color-bg-primary
--color-bg-secondary
--color-bg-tertiary
--color-bg-hover

--color-text-primary
--color-text-secondary
--color-text-tertiary
--color-text-muted

--color-border-primary
--color-border-secondary
--color-border-light
--color-border-lighter
--color-border-muted

--color-status-success
--color-status-error
--color-status-warning
--color-status-info

--color-danger-bg
--color-danger-text
--color-danger-border

--color-overlay
--color-select
```

## Theme Colors

### Dark Mode (Default)
- **Primary**: Indigo (`#6366f1`)
- **Background**: Very dark grays and blacks
- **Text**: Light neutrals (`#e2e8f0`)
- **Accent**: Lighter indigo (`#a5b4fc`)

### Light Mode
- **Primary**: Indigo (`#4f46e5`)
- **Background**: White and light grays
- **Text**: Dark grays and black (`#1e293b`)
- **Accent**: Darker indigo (`#4338ca`)

## Migration Notes

### If Adding New Components
1. Always use CSS variables instead of hardcoded colors
2. Use the theme colors defined in `src/lib/theme.js`
3. Test both light and dark modes

### Updating Existing Components
Replace hardcoded colors with CSS variables:
```jsx
// Before
<div style={{ background: '#13131f', color: '#e2e8f0' }}>

// After
<div style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
```

## Files Modified

- `src/App.js` - Added ThemeProvider wrapper
- `src/lib/styles.js` - Updated with CSS variables
- `src/lib/theme.js` - NEW: Theme configurations
- `src/hooks/useTheme.jsx` - NEW: Theme context & hook
- `src/components/ui.jsx` - Added ThemeToggle component
- `src/components/SettingsView.jsx` - Added theme preferences section
- `src/components/Shell.jsx` - Updated colors to use CSS variables

## Browser Support

CSS custom properties are supported in:
- Chrome/Edge 49+
- Firefox 31+
- Safari 9.1+
- iOS Safari 9.3+

All modern browsers are well-supported.

## Future Enhancements

Potential additions:
- [ ] More theme presets (e.g., high contrast, palette variants)
- [ ] System theme sync with periodic recheck
- [ ] Smooth theme transition animations
- [ ] Custom color picker in settings
- [ ] Theme scheduling (auto-switch at specific times)

## Troubleshooting

### Theme not updating
- Clear browser cache/localStorage
- Check that `ThemeProvider` wraps the entire app
- Verify CSS variables are defined in `:root`

### Colors not matching
- Check `src/lib/theme.js` for the correct color value
- Ensure component uses variable name correctly
- Check browser DevTools for computed style values

### Components showing wrong colors
- Verify the component is within `ThemeProvider`
- Check for hardcoded colors that override CSS variables
- Use `!important` only as last resort (prefer fixing precedence)
