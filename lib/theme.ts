// theme.ts
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    background: 'hsl(180 20% 97%)',
    foreground: 'hsl(190 40% 10%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(190 40% 10%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(190 40% 10%)',
    primary: 'hsl(174 100% 45%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(174 30% 95%)',
    secondaryForeground: 'hsl(190 40% 10%)',
    muted: 'hsl(174 20% 94%)',
    mutedForeground: 'hsl(190 15% 50%)',
    accent: 'hsl(174 100% 45%)',
    accentForeground: 'hsl(0 0% 100%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    border: 'hsl(174 20% 88%)',
    input: 'hsl(174 20% 88%)',
    ring: 'hsl(174 100% 45%)',
    radius: '0.625rem',
    chart1: 'hsl(174 100% 45%)',
    chart2: 'hsl(174 80% 50%)',
    chart3: 'hsl(190 60% 40%)',
    chart4: 'hsl(160 70% 45%)',
    chart5: 'hsl(200 60% 50%)',
  },
  dark: {
    background: 'hsl(190 40% 8%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(190 35% 12%)',
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(190 35% 12%)',
    popoverForeground: 'hsl(0 0% 98%)',
    primary: 'hsl(174 100% 48%)',
    primaryForeground: 'hsl(190 40% 8%)',
    secondary: 'hsl(190 30% 18%)',
    secondaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(190 25% 16%)',
    mutedForeground: 'hsl(190 15% 55%)',
    accent: 'hsl(174 100% 48%)',
    accentForeground: 'hsl(190 40% 8%)',
    destructive: 'hsl(0 70.9% 59.4%)',
    border: 'hsl(190 20% 20%)',
    input: 'hsl(190 20% 20%)',
    ring: 'hsl(174 100% 48%)',
    radius: '0.625rem',
    chart1: 'hsl(174 100% 48%)',
    chart2: 'hsl(174 80% 55%)',
    chart3: 'hsl(190 70% 50%)',
    chart4: 'hsl(160 80% 50%)',
    chart5: 'hsl(200 70% 55%)',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

// Gradient colors extracted from the design
export const GRADIENTS = {
  // Main dark teal gradient used in backgrounds
  darkTeal: {
    start: '#0D1B1E',    // Deepest teal (top/edges)
    middle: '#122A2E',   // Mid teal
    end: '#1A3D42',      // Lighter teal center
  },
  // Primary cyan gradient used in buttons and accents
  primaryCyan: {
    start: '#00D4C8',    // Cyan start
    end: '#00E5D4',      // Bright cyan end
  },
  // Water/droplet gradient
  water: {
    start: '#00B8A9',    // Darker teal
    middle: '#00D4C8',   // Mid cyan
    end: '#00F0E0',      // Bright cyan
  },
  // Card surface gradient
  cardSurface: {
    start: '#162D31',    // Dark card start
    end: '#1E3D42',      // Slightly lighter card end
  },
  // Progress ring gradient
  progressRing: {
    start: '#00D4C8',    // Cyan
    end: '#00FFE0',      // Bright cyan/white tint
  },
  // Mood landscape gradient variants
  mood: {
    peaceful: '#00E5D4', // Primary cyan
    energetic: '#00B8A9', // Darker teal
    calm: '#2A8F8F',     // Muted teal
    other: '#3D5A5F',    // Gray teal
  },
} as const;