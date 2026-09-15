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
  /** Custom right-side slot — an Avatar, an icon button, or nothing. */
  rightElement?: ReactNode;
};

const BAR_HEIGHT = 52;
const TOP_OFFSET = spacing.sm;

/** How much top padding a screen needs so content doesn't scroll under the floating header. */
export function useFloatingHeaderClearance() {
  const insets = useSafeAreaInsets();
  return insets.top + TOP_OFFSET + BAR_HEIGHT + spacing.sm;
}

/**
 * A floating Liquid Glass capsule, same visual language as TabBar (rounded,
 * shadow, no hard divider line) rather than a flat docked bar with a hairline
 * border — that read as a plain opaque UI bar and didn't match the tab bar at
 * all. Still gives the title a real background so it doesn't collide with
 * whatever's scrolled underneath, iOS/Slack nav-bar style.
 */
export function Header({ title, onBackPress, rightElement }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingLayer, { top: insets.top + TOP_OFFSET }]} pointerEvents="box-none">
      <GlassSurface style={styles.bar}>
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
      </GlassSurface>
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
  bar: {
    height: BAR_HEIGHT,
    marginHorizontal: spacing.md,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.raised,
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
