import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/GlassSurface';
import { useTheme } from '@/context/ThemeContext';
import { useSetDrawerSwipeEnabled } from '@/navigation/DrawerSwipeContext';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { radii, shadows, spacing, typography } from '@/theme';

export type HeaderProps = {
  title: string;
  /** Renders a back chevron on the left and calls this when tapped. */
  onBackPress?: () => void;
  /**
   * Renders a hamburger icon on the left and calls this when tapped — for
   * root tab screens, which have nothing to go back to but do sit inside
   * the Drawer. Ignored when onBackPress is also given (mutually exclusive:
   * a screen either has something to go back to, or opens the Drawer).
   */
  onMenuPress?: () => void;
  /**
   * Custom right-side slot — an Avatar, or a future icon button. A button
   * placed here should wrap itself in its own <GlassSurface>, same as the
   * back button, to match — this slot doesn't force any styling of its own.
   */
  rightElement?: ReactNode;
};

const PIECE_HEIGHT = 36;
const TOP_OFFSET = spacing.sm;

/** How much top padding a screen needs so content doesn't scroll under the floating header. */
export function useFloatingHeaderClearance() {
  const insets = useSafeAreaInsets();
  const { topClearance } = useTabBarLayout();
  return insets.top + topClearance + TOP_OFFSET + PIECE_HEIGHT + spacing.sm;
}

/**
 * Three independent Liquid Glass pieces in a row — back button, title,
 * (future) right-side action — not one shared tile behind all of them.
 * Matches Slack's nav bar: a back chevron, a title, and a huddle button all
 * float as their own elements over the same content, side by side.
 */
export const Header = memo(function Header({
  title,
  onBackPress,
  onMenuPress,
  rightElement,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { topClearance } = useTabBarLayout();
  const setDrawerSwipeEnabled = useSetDrawerSwipeEnabled();
  const { colors: themeColors } = useTheme();

  // A back button means native-stack's own swipe-back gesture lives on this
  // screen's left edge too — sharing it with the Drawer's swipe-to-open
  // otherwise made "swipe from the edge" go back or open the Drawer
  // depending on which gesture handler happened to win the race. Only one
  // of the two ever makes sense per screen (see DrawerSwipeContext.tsx).
  useFocusEffect(
    useCallback(() => {
      const shouldEnable = !onBackPress;
      setDrawerSwipeEnabled((prev) => (prev !== shouldEnable ? shouldEnable : prev));
    }, [setDrawerSwipeEnabled, onBackPress]),
  );

  return (
    <View
      style={[styles.floatingLayer, { top: insets.top + topClearance + TOP_OFFSET }]}
      pointerEvents="box-none"
    >
      <View style={styles.row}>
        <View style={styles.side}>
          {onBackPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBackPress}
            >
              <GlassSurface
                style={[styles.backButton, { borderColor: themeColors.surfaceMedium }]}
                isInteractive
              >
                <Ionicons name="chevron-back" size={18} color={themeColors.textPrimary} />
              </GlassSurface>
            </Pressable>
          ) : onMenuPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={8}
              onPress={onMenuPress}
            >
              <GlassSurface
                style={[styles.backButton, { borderColor: themeColors.surfaceMedium }]}
                isInteractive
              >
                <Ionicons name="menu" size={18} color={themeColors.textPrimary} />
              </GlassSurface>
            </Pressable>
          ) : null}
        </View>

        <GlassSurface style={[styles.titlePill, { borderColor: themeColors.surfaceMedium }]}>
          <Text style={[typography.h4, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
        </GlassSurface>

        <View style={[styles.side, styles.rightSide]}>{rightElement}</View>
      </View>
    </View>
  );
});

const SIDE_WIDTH = 40;

const styles = StyleSheet.create({
  floatingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  row: {
    height: PIECE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: PIECE_HEIGHT,
    height: PIECE_HEIGHT,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    // The glass fill alone is nearly invisible with nothing behind it to
    // blur — a rim keeps each piece readable as its own shape regardless.
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.card,
  },
  titlePill: {
    height: PIECE_HEIGHT,
    maxWidth: '60%',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.card,
  },
});
