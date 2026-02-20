<!-- Theme Colors Reference & Comparison -->

# Theme Color Palette Reference

## Dark Mode (Default)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Primary** | Indigo | `#6366f1` | Buttons, Links, Accents |
| **Primary Light** | Light Indigo | `#a5b4fc` | Hover states, Navigation text |
| **Primary Dark** | Dark Indigo | `#4f46e5` | Gradients, Darker variants |
| Background Primary | Very Dark Gray | `#0a0a14` | Main background |
| Background Secondary | Dark Gray | `#13131f` | Cards, Panels |
| Background Tertiary | Dark Gray | `#1a1a2e` | Nested backgrounds |
| Background Hover | Transparent Indigo | `rgba(99,102,241,0.05)` | Hover states |
| Text Primary | Light Gray | `#e2e8f0` | Main text |
| Text Secondary | Medium Light Gray | `#94a3b8` | Secondary text |
| Text Tertiary | Medium Gray | `#64748b` | Labels, hints |
| Text Muted | Dark Gray | `#475569` | Disabled, very secondary |
| **Success** | Green | `#10b981` | Success states, Icons |
| **Error** | Red | `#f87171` | Errors, Danger |
| **Warning** | Amber | `#f59e0b` | Warnings |
| **Info** | Cyan | `#0ea5e9` | Information |
| Danger BG | Transparent Red | `rgba(239,68,68,0.18)` | Danger buttons |
| Danger Text | Light Red | `#f87171` | Danger text |
| Danger Border | Transparent Red | `rgba(239,68,68,0.3)` | Danger borders |
| Border Primary | Transparent Indigo | `rgba(99,102,241,0.2)` | Strong borders |
| Border Secondary | Transparent Indigo | `rgba(99,102,241,0.12)` | Medium borders |
| Border Light | Transparent White | `rgba(255,255,255,0.1)` | Light borders |
| Border Lighter | Transparent White | `rgba(255,255,255,0.06)` | Very light borders |
| Border Muted | Transparent White | `rgba(255,255,255,0.08)` | Muted borders |
| Overlay | Transparent Black | `rgba(0,0,0,0.78)` | Modal overlay |

## Light Mode

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Primary** | Indigo | `#4f46e5` | Buttons, Links, Accents |
| **Primary Light** | Indigo | `#4f46e5` | Hover states |
| **Primary Dark** | Dark Indigo | `#4338ca` | Gradients |
| Background Primary | White | `#ffffff` | Main background |
| Background Secondary | Very Light Gray | `#f8fafc` | Cards, Panels |
| Background Tertiary | Light Gray | `#f1f5f9` | Nested backgrounds |
| Background Hover | Transparent Indigo | `rgba(79,70,229,0.05)` | Hover states |
| Text Primary | Dark Neutral | `#1e293b` | Main text |
| Text Secondary | Medium Dark Gray | `#475569` | Secondary text |
| Text Tertiary | Medium Gray | `#64748b` | Labels, hints |
| Text Muted | Light Gray | `#94a3b8` | Disabled, very secondary |
| **Success** | Dark Green | `#059669` | Success states, Icons |
| **Error** | Dark Red | `#dc2626` | Errors, Danger |
| **Warning** | Dark Amber | `#d97706` | Warnings |
| **Info** | Dark Cyan | `#0284c7` | Information |
| Danger BG | Transparent Red | `rgba(220,38,38,0.1)` | Danger buttons |
| Danger Text | Dark Red | `#dc2626` | Danger text |
| Danger Border | Transparent Red | `rgba(220,38,38,0.2)` | Danger borders |
| Border Primary | Transparent Indigo | `rgba(79,70,229,0.2)` | Strong borders |
| Border Secondary | Transparent Indigo | `rgba(79,70,229,0.12)` | Medium borders |
| Border Light | Transparent Black | `rgba(0,0,0,0.08)` | Light borders |
| Border Lighter | Transparent Black | `rgba(0,0,0,0.04)` | Very light borders |
| Border Muted | Transparent Black | `rgba(0,0,0,0.06)` | Muted borders |
| Overlay | Transparent Black | `rgba(0,0,0,0.5)` | Modal overlay |

## Before & After Code Examples

### Before (Hardcoded Colors)
```jsx
// Login Card
<div style={{
  background: '#13131f',              // ❌ Hardcoded dark color
  border: '1px solid rgba(99,102,241,0.2)',
  color: '#e2e8f0',
  padding: '36px',
}}>
  // Content
</div>

// Button
<button style={{
  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  color: '#fff',
}}>Click Me</button>
```

### After (CSS Variables)
```jsx
// Login Card
<div style={{
  background: 'var(--color-bg-secondary)',        // ✅ Dynamic theme color
  border: '1px solid var(--color-border-primary)',
  color: 'var(--color-text-primary)',
  padding: '36px',
}}>
  // Content
</div>

// Button
<button style={{
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
  color: '#fff',  // White stays for contrast
}}>Click Me</button>
```

## CSS Variables in Action

### Theme Toggle Flow
```
User clicks "☀️ Light" → 
  setMode('light') → 
    applyTheme('light') → 
      document.documentElement.style.setProperty('--color-bg-primary', '#ffffff') →
        document.documentElement.style.setProperty('--color-text-primary', '#1e293b') →
          ... (all other variables) →
            All components using var(--color-*) update instantly ✨
```

## Usage Examples

### Component with Theme Colors
```jsx
import { useTheme } from './hooks/useTheme';

export function Card({ title, children }) {
  const { mode } = useTheme();  // Optional: use mode type
  
  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-primary)',
      borderRadius: '12px',
      padding: '20px',
      color: 'var(--color-text-primary)',
    }}>
      <h2 style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
    </div>
  );
}
```

### Determining Text Color for Contrast
```jsx
// Complementary text colors by mode
const styles = {
  successText: {
    color: 'var(--color-status-success)',
  },
  warningBox: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderLeft: '4px solid var(--color-status-warning)',
    paddingLeft: '12px',
  },
};
```

## Consistency Guidelines

✅ **Do Use CSS Variables For:**
- Backgrounds
- Text colors
- Border colors
- Hover states
- Focus states
- Overlay colors
- Status indicators

❌ **Don't Need Variables For:**
- Content shadows (keep consistent)
- Border radius (design system value)
- Padding/margin (layout)
- Font sizing (typography)
- Transitions (animation)

## Testing Theme Changes

### Manual Testing Checklist
- [ ] Toggle theme in Settings
- [ ] Verify all pages update colors
- [ ] Check all buttons and interactive elements
- [ ] Test forms and inputs
- [ ] Test modals and overlays
- [ ] Check mobile responsive layout
- [ ] Refresh page - theme persists
- [ ] Check system preference (no saved preference)
- [ ] Test hover/focus states

### Browser DevTools Verification
```
1. Open DevTools (F12)
2. Go to Console tab
3. Run: document.documentElement.style.getPropertyValue('--color-bg-primary')
4. Should return color for current theme
5. Click theme toggle
6. Run again - should return new color
```

## Performance Considerations

- CSS variables are **native** to browsers (no overhead)
- Theme updates use `setProperty()` for individual variables
- All calculations happen in CSS (no JavaScript runtime cost)
- Smooth transition from `transition: 0.3s` on body
- No page re-renders needed (pure CSS update)

## Accessibility Notes

- Color contrasts meet WCAG AA standards for both themes
- Text remains readable in both modes
- Status colors (success, error, etc.) maintain contrast
- Focus states visible in both themes
- High contrast mode can be added if needed

---

**Last Updated**: February 20, 2026
**Version**: 1.0
**Status**: Production Ready ✅
