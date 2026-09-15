import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { colors, radii, shadows, spacing, typography } from '@/theme';

export type HeaderProps = {
  title: string;
  /** Renders a back chevron on the left and calls this when tapped. */
  onBackPress?: () => void;
  /** Custom right-side slot — an Avatar, an icon button, or nothing. */
  rightElement?: ReactNode;
};

export function Header({ title, onBackPress, rightElement }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBackPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={onBackPress}
          >
            <GlassSurface style={styles.backButton}>
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
  );
}

const SIDE_WIDTH = 40;

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    // The glass fill alone is nearly invisible on a white header — a rim
    // makes the pill readable even where there's nothing behind it to blur.
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
