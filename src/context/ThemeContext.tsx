import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { colors as lightColors } from '@/theme';

/**
 * Dark palette, derived from the light one token-by-token (same roles, same
 * relative contrast) rather than a generic invert — brand blue and the
 * urgent-accent hue stay put, only their pale "tint" backgrounds get a dark,
 * desaturated counterpart so they don't glow like a light-mode leftover.
 */
const darkColors: Record<keyof typeof lightColors, string> = {
  ...lightColors,
  primaryLight: '#1B3A57', // was a pale blue tint — now a muted navy tint
  primaryLightest: '#152A42', // was a paler blue tint — an even darker navy
  urgentLight: '#3A2420', // was a pale coral tint — now a muted ember tint

  text: '#F5F6F8',
  textPrimary: '#F5F6F8',
  textSecondary: '#D3D5DC',
  textTertiary: '#A7AAB3',
  textMuted: '#8C8F99',
  textPlaceholder: '#6E7179',

  white: '#121214', // screen background
  surface: '#1C1E22', // cards/tiles — never plain white in dark mode
  surfaceMedium: '#2B2E34',
  border: '#3A3D45',
  borderLight: '#2B2E34',
};

/** What the user picked on the Appearance screen. */
export type ThemePreference = 'light' | 'dark' | 'system';
/** What's actually on screen right now — 'system' above resolves to one of these. */
export type ThemeMode = 'light' | 'dark';
type ThemeColors = Record<keyof typeof lightColors, string>;

type ThemeContextValue = {
  themePreference: ThemePreference;
  theme: ThemeMode;
  colors: ThemeColors;
  setThemePreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const theme: ThemeMode =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  // Forces the *native* color scheme (not just our own JS-painted colors) to
  // follow an explicit light/dark pick — without this, real Liquid Glass and
  // the native tab bar keep following the actual OS appearance regardless of
  // what we choose here, so a manual override that disagrees with the OS
  // setting left their materials rendering against the wrong trait collection
  // (seen as glass elements flashing to a light material on every screen/tab
  // mount before our own dark-tinted content painted over it). 'unspecified'
  // clears the override so 'system' mode still tracks real OS changes via
  // useColorScheme() above instead of getting stuck on a stale forced value.
  useEffect(() => {
    Appearance.setColorScheme(themePreference === 'system' ? 'unspecified' : themePreference);
  }, [themePreference]);

  // Memoized against the *resolved* theme (and nothing else) — this is what
  // gets handed to React Navigation's own theme prop downstream, and a new
  // object there on every unrelated re-render is what caused the tab bar and
  // other native chrome to visibly flash while just navigating around.
  const value = useMemo<ThemeContextValue>(
    () => ({
      themePreference,
      theme,
      colors: theme === 'dark' ? darkColors : lightColors,
      setThemePreference,
    }),
    [themePreference, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Throws outside ThemeProvider on purpose — every screen renders under App.tsx's provider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
