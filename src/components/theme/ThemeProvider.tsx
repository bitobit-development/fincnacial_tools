'use client';

import * as React from 'react';
import { type ThemeMode, themes } from '@/lib/themes';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultDarkMode?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'warm',
  defaultDarkMode = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeMode>(defaultTheme);
  const [isDark, setIsDark] = React.useState(defaultDarkMode);
  const [mounted, setMounted] = React.useState(false);

  // Load theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
    }
    setIsDark(savedDarkMode);
    setMounted(true);
  }, []);

  // Apply theme to document
  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const selectedTheme = themes[theme];
    const colors = isDark ? selectedTheme.dark : selectedTheme.light;

    // Apply theme data attribute
    root.setAttribute('data-theme', theme);

    // Apply dark class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVarName}`, value);
    });
  }, [theme, isDark, mounted]);

  const setTheme = React.useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleDarkMode = React.useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('darkMode', String(next));
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ theme, isDark, setTheme, toggleDarkMode }),
    [theme, isDark, setTheme, toggleDarkMode]
  );

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
