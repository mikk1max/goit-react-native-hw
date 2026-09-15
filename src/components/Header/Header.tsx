import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/GlassSurface';
import { colors, radii, shadows, spacing, typography } from '@/theme';

export type HeaderProps = {
  title: string;
  /** Renders a back chevron on the left and calls this when tapped. */
  onBackPress?: () => void;
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
  return insets.top + TOP_OFFSET + PIECE_HEIGHT + spacing.sm;
}

/**
 * Three independent Liquid Glass pieces in a row — back button, title,
 * (future) right-side action — not one shared tile behind all of them.
 * Matches Slack's nav bar: a back chevron, a title, and a huddle button all
 * float as their own elements over the same content, side by side.
 */
export function Header({ title, onBackPress, rightElement }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingLayer, { top: insets.top + TOP_OFFSET }]} pointerEvents="box-none">
      <View style={styles.row}>
        <View style={styles.side}>
          {onBackPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBackPress}
            >
              <GlassSurface style={styles.backButton} isInteractive>
                <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
              </GlassSurface>
            </Pressable>
          ) : null}
        </View>

        <GlassSurface style={styles.titlePill}>
          <Text style={[typography.h4, styles.title]} numberOfLines={1}>
            {title}
          </Text>
        </GlassSurface>

        <View style={[styles.side, styles.rightSide]}>{rightElement}</View>
      </View>
    </View>
  );
}

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
    borderColor: colors.surfaceMedium,
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
    borderColor: colors.surfaceMedium,
    ...shadows.card,
  },
  title: {
    color: colors.textPrimary,
  },
});
