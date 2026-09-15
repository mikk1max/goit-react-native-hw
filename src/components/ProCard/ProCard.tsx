import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { colors, radii, spacing, typography } from '@/theme';

export type ProCardProps = {
  name: string;
  role: string;
  rating: number;
  imageUrl?: string;
  onPress?: () => void;
};

/** Recommended-pro / review card — the "product card" of this design system. */
export function ProCard({ name, role, rating, imageUrl, onPress }: ProCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.container, pressed && onPress && styles.pressed]}
    >
      <Avatar imageUrl={imageUrl} backgroundColor={colors.primaryLight} />

      <View style={styles.content}>
        <Text style={[typography.h4, styles.name]} numberOfLines={1}>
          {name}
        </Text>
        {/* No row wrapper needed here — a Text as the sole child of a column
            wraps within its parent's width on its own, no flex/minWidth tricks. */}
        <Text style={[typography.bodyS, styles.meta]}>{role}</Text>
      </View>

      {/* Its own item in the outer row (not nested with the text above), so it
          inherits the row's alignItems: 'center' against the *whole* card's
          height — centered vs the whole tile instead of just the wrapped text. */}
      <View style={styles.rating}>
        <Ionicons name="star" size={12} color={colors.primary} />
        <Text style={[typography.bodyS, styles.meta]}>{rating.toFixed(1)}</Text>
      </View>

      {onPress ? <Ionicons name="chevron-forward" size={12} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    color: colors.textPrimary,
  },
  meta: {
    color: colors.textMuted,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
