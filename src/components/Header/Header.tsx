import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

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
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
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
  rightSide: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
});
