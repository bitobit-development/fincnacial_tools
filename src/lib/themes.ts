/**
 * Theme Definitions
 *
 * Defines available themes for the application with their color palettes.
 * Each theme uses HSL color values that map to CSS custom properties.
 */

export type ThemeMode = 'warm' | 'blue';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface Theme {
  name: string;
  mode: ThemeMode;
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: Record<ThemeMode, Theme> = {
  warm: {
    name: 'Warm',
    mode: 'warm',
    light: {
      background: '40 20% 99%',
      foreground: '30 10% 10%',
      card: '38 25% 97%',
      cardForeground: '30 10% 10%',
      popover: '38 25% 97%',
      popoverForeground: '30 10% 10%',
      primary: '25 95% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '35 80% 60%',
      secondaryForeground: '30 10% 10%',
      muted: '35 20% 92%',
      mutedForeground: '30 40% 45%',
      accent: '30 85% 55%',
      accentForeground: '0 0% 100%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 100%',
      border: '35 30% 85%',
      input: '35 30% 85%',
      ring: '25 95% 53%',
      chart1: '25 95% 53%',
      chart2: '35 80% 60%',
      chart3: '15 75% 60%',
      chart4: '45 85% 55%',
      chart5: '5 70% 60%',
    },
    dark: {
      background: '30 15% 8%',
      foreground: '40 20% 95%',
      card: '30 15% 12%',
      cardForeground: '40 20% 95%',
      popover: '30 15% 12%',
      popoverForeground: '40 20% 95%',
      primary: '25 90% 58%',
      primaryForeground: '30 10% 10%',
      secondary: '30 20% 20%',
      secondaryForeground: '40 20% 95%',
      muted: '30 20% 18%',
      mutedForeground: '35 30% 65%',
      accent: '30 25% 22%',
      accentForeground: '40 20% 95%',
      destructive: '0 62.8% 50.6%',
      destructiveForeground: '40 20% 95%',
      border: '30 20% 18%',
      input: '30 20% 18%',
      ring: '25 90% 58%',
      chart1: '25 90% 65%',
      chart2: '35 75% 70%',
      chart3: '15 70% 65%',
      chart4: '45 80% 65%',
      chart5: '5 65% 65%',
    },
  },
  blue: {
    name: 'Blue',
    mode: 'blue',
    light: {
      background: '210 30% 98%',
      foreground: '220 15% 15%',
      card: '210 25% 96%',
      cardForeground: '220 15% 15%',
      popover: '210 25% 96%',
      popoverForeground: '220 15% 15%',
      primary: '210 90% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '200 75% 60%',
      secondaryForeground: '220 15% 15%',
      muted: '210 20% 92%',
      mutedForeground: '220 30% 45%',
      accent: '200 85% 58%',
      accentForeground: '0 0% 100%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 100%',
      border: '210 25% 88%',
      input: '210 25% 88%',
      ring: '210 90% 55%',
      chart1: '210 90% 55%',
      chart2: '200 75% 60%',
      chart3: '190 70% 58%',
      chart4: '220 80% 60%',
      chart5: '230 75% 62%',
    },
    dark: {
      background: '220 20% 10%',
      foreground: '210 25% 95%',
      card: '220 18% 14%',
      cardForeground: '210 25% 95%',
      popover: '220 18% 14%',
      popoverForeground: '210 25% 95%',
      primary: '210 85% 60%',
      primaryForeground: '220 15% 15%',
      secondary: '220 20% 22%',
      secondaryForeground: '210 25% 95%',
      muted: '220 20% 20%',
      mutedForeground: '210 25% 65%',
      accent: '220 22% 24%',
      accentForeground: '210 25% 95%',
      destructive: '0 62.8% 50.6%',
      destructiveForeground: '210 25% 95%',
      border: '220 20% 20%',
      input: '220 20% 20%',
      ring: '210 85% 60%',
      chart1: '210 85% 65%',
      chart2: '200 70% 68%',
      chart3: '190 65% 65%',
      chart4: '220 75% 68%',
      chart5: '230 70% 70%',
    },
  },
};
