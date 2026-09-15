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

const TOP_OFFSET = spacing.sm;
const HEADER_HEIGHT = 44;
const BUTTON_SIZE = 36;

/** How much top padding a screen needs so content doesn't scroll under the floating header. */
export function useFloatingHeaderClearance() {
  const insets = useSafeAreaInsets();
  return insets.top + TOP_OFFSET + HEADER_HEIGHT + spacing.md;
}

/**
 * Floats over content instead of docking as a solid bar — the back button is
 * its own Liquid Glass circle, the title sits directly on the content behind
 * it, iOS 26 nav-bar style.
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

        <Text style={[typography.h4, styles.title]} numberOfLines={1}>
          {title}
        </Text>

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
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  backButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    // The glass fill alone is nearly invisible on a white content area — a
    // rim keeps the pill readable even where there's nothing behind it to blur.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceMedium,
    ...shadows.card,
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
