'use client';

import * as React from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Sun, Moon, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

/**
 * ThemeSwitcher Component
 *
 * Dropdown to switch between themes (Warm, Blue) and toggle dark mode.
 * Positioned in top-right corner with smooth transitions.
 *
 * Example:
 * <ThemeSwitcher />
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after mount to avoid SSR issues
  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="w-[140px] h-9 bg-muted/50 rounded-md animate-pulse" />
        <div className="w-9 h-9 bg-muted/50 rounded-md animate-pulse" />
      </div>
    );
  }

  return <ThemeSwitcherClient className={className} />;
}

function ThemeSwitcherClient({ className }: ThemeSwitcherProps) {
  const { theme, isDark, setTheme, toggleDarkMode } = useTheme();

  const themeIcons = {
    warm: Sun,
    blue: Droplet,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Theme Selector */}
      <Select value={theme} onValueChange={(value) => setTheme(value as 'warm' | 'blue')}>
        <SelectTrigger className="w-[140px] transition-all duration-300">
          <div className="flex items-center gap-2">
            <ThemeIcon className="h-4 w-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="warm">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-orange-500" />
              <span>Warm</span>
            </div>
          </SelectItem>
          <SelectItem value="blue">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              <span>Blue</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Dark Mode Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        className="transition-all duration-300"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-300" />
        ) : (
          <Moon className="h-4 w-4 rotate-0 scale-100 transition-transform duration-300" />
        )}
      </Button>
    </div>
  );
}
