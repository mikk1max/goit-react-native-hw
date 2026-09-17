import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  /** Whatever the caller renders — an Ionicons glyph, a TradeIcon, anything sized to fit. */
  leftIcon?: ReactNode;
  /** Shows a trailing chevron, e.g. for navigating into a category. */
  showChevron?: boolean;
  onPress?: () => void;
};

export function ListItem({
  title,
  subtitle,
  leftIcon,
  showChevron = false,
  onPress,
}: ListItemProps) {
  const { colors: themeColors } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={styles.container}
    >
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

      <View style={styles.content}>
        <Text style={[typography.bodyM, { color: themeColors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.bodyS, { color: themeColors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {showChevron ? (
        <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    padding: spacing.md,
    borderRadius: radii.sm,
  },
  leftIcon: {
    width: 20,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
});
