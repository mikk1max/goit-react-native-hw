import { useWindowDimensions } from 'react-native';

import { spacing } from '@/theme';

/**
 * Width-based, not device-based: a rotated phone crosses this the same as a
 * small tablet, and both get the same extra breathing room.
 */
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH = 960;

export type ResponsiveLayoutOptions = {
  /** Horizontal padding the caller applies around its content column. */
  horizontalPadding?: number;
  /** Gap between grid cards when `columns > 1`. */
  gap?: number;
};

/**
 * Centralizes the phone-vs-tablet layout math so every screen grids its
 * repeating cards (ProCard, ListItem, ...) the same way instead of just
 * capping width and leaving the extra space empty.
 */
export function useResponsiveLayout({
  horizontalPadding = spacing.md,
  gap = spacing.sm,
}: ResponsiveLayoutOptions = {}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const columns = isTablet ? 2 : 1;

  const contentWidth = isTablet ? Math.min(width * 0.9, MAX_CONTENT_WIDTH) : width;
  const innerWidth = contentWidth - horizontalPadding * 2;
  const cardWidth = columns > 1 ? (innerWidth - gap * (columns - 1)) / columns : innerWidth;

  return { isTablet, columns, contentWidth, cardWidth };
}
