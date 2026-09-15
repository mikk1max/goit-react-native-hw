import { Pressable, StyleSheet, Text } from 'react-native';

import { TradeIcon, type TradeIconName } from '@/components/TradeIcon';
import { colors, radii, spacing, typography } from '@/theme';

export type TagProps = {
  label: string;
  /** Optional trade icon ahead of the label, matching the Figma "Left Icon" slot. */
  icon?: TradeIconName;
  selected?: boolean;
  onPress?: () => void;
};

export function Tag({ label, icon, selected = false, onPress }: TagProps) {
  const foregroundColor = selected ? colors.white : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.unselected]}
    >
      {icon ? <TradeIcon name={icon} size={12} color={foregroundColor} /> : null}
      <Text style={[typography.captionM, { color: foregroundColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs + 2,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.primaryLightest,
  },
});
