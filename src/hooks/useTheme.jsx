import { createContext, useContext, useState, useEffect } from 'react';
import { applyTheme, getInitialTheme } from '../lib/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setMode(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    applyTheme(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
