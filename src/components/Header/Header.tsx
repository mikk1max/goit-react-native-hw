import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/GlassSurface';
import { colors, spacing, typography } from '@/theme';

export type HeaderProps = {
  title: string;
  /** Renders a back chevron on the left and calls this when tapped. */
  onBackPress?: () => void;
  /** Custom right-side slot — an Avatar, an icon button, or nothing. */
  rightElement?: ReactNode;
};

const BAR_CONTENT_HEIGHT = 44;
const BOTTOM_GAP = spacing.sm;

/** How much top padding a screen needs so content doesn't scroll under the docked header. */
export function useFloatingHeaderClearance() {
  const insets = useSafeAreaInsets();
  return insets.top + BAR_CONTENT_HEIGHT + BOTTOM_GAP;
}

/**
 * Docks as a full-width Liquid Glass bar, iOS/Slack nav-bar style — unlike a
 * fully transparent header, the title has a real background behind it, so it
 * stays legible instead of colliding with whatever's scrolled underneath.
 */
export function Header({ title, onBackPress, rightElement }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <GlassSurface style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBackPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBackPress}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[typography.h4, styles.title]} numberOfLines={1}>
          {title}
        </Text>

        <View style={[styles.side, styles.rightSide]}>{rightElement}</View>
      </View>
    </GlassSurface>
  );
}

const SIDE_WIDTH = 40;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceMedium,
  },
  row: {
    height: BAR_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
});
