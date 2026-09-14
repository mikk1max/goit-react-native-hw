/** Palette from the Figma design system — reference these, never inline hex values. */
export const colors = {
  primary: '#006FFD',
  primaryMedium: '#6FBAFF',
  primaryLight: '#B4DBFF',
  primaryLightest: '#EAF2FF',

  text: '#000000',
  textPrimary: '#1F2024',
  textSecondary: '#2F3036',
  textTertiary: '#494A50',
  textMuted: '#71727A',
  textPlaceholder: '#8F9098',

  white: '#FFFFFF',
  surface: '#F8F9FE',
  surfaceMedium: '#E8E9F1',
  border: '#C5C6CC',
  borderLight: '#D4D6DD',

  overlay: 'rgba(31, 32, 36, 0.4)',
} as const;

export type ColorToken = keyof typeof colors;
