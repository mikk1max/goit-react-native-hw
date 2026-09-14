import { Platform, type TextStyle } from 'react-native';

/**
 * Inter is loaded via `useFonts` in App.tsx (see @expo-google-fonts/inter).
 * Fall back to the platform system font so the UI still renders correctly
 * for the one frame before the fonts finish loading.
 */
const fontFamily = {
  regular: Platform.select({
    ios: 'Inter_400Regular',
    android: 'Inter_400Regular',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'Inter_600SemiBold',
    android: 'Inter_600SemiBold',
    default: 'System',
  }),
  bold: Platform.select({ ios: 'Inter_700Bold', android: 'Inter_700Bold', default: 'System' }),
};

export const typography = {
  h1: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  h5: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  bodyL: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyM: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyS: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.12,
  },
  bodyXS: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.15,
  },
  actionM: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  actionS: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 14,
  },
  captionM: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
export { fontFamily };
