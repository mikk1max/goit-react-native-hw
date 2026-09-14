import { Platform } from 'react-native';

/**
 * iOS reads shadow* props, Android only respects `elevation` — Platform.select
 * keeps both in one token instead of scattering the branch across components.
 */
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#1F2024',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  raised: Platform.select({
    ios: {
      shadowColor: '#1F2024',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
} as const;
