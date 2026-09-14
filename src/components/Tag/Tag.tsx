import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export type TagProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Tag({ label, selected = false, onPress }: TagProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.unselected]}
    >
      <Text style={[typography.captionM, selected ? styles.selectedText : styles.unselectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
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
  selectedText: {
    color: colors.white,
  },
  unselectedText: {
    color: colors.primary,
  },
});
