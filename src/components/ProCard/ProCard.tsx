import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

export type ProCardProps = {
  name: string;
  role: string;
  /** Omitted for data sources with no rating field (e.g. API-fetched providers) — hides the star row instead of faking a number. */
  rating?: number;
  imageUrl?: string;
  onPress?: () => void;
};

/**
 * Recommended-pro / review card — the "product card" of this design system,
 * and the one rendered most often (a whole grid of these per screen). Memoed
 * so a grid full of them doesn't all re-render on an unrelated parent update
 * (e.g. Home's search box changing on every keystroke) — only the cards
 * whose own props actually changed do. Callers must pass a stable `onPress`
 * (see HomeScreen's ProGridItem) or this memoization does nothing.
 */
export const ProCard = memo(function ProCard({
  name,
  role,
  rating,
  imageUrl,
  onPress,
}: ProCardProps) {
  const { colors: themeColors } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: themeColors.surface },
        pressed && onPress && styles.pressed,
      ]}
    >
      <Avatar imageUrl={imageUrl} backgroundColor={themeColors.primaryLight} />

      <View style={styles.content}>
        <Text style={[typography.h4, { color: themeColors.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
        {/* No row wrapper needed here — a Text as the sole child of a column
            wraps within its parent's width on its own, no flex/minWidth tricks. */}
        <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>{role}</Text>
      </View>

      {/* Its own item in the outer row (not nested with the text above), so it
          inherits the row's alignItems: 'center' against the *whole* card's
          height — centered vs the whole tile instead of just the wrapped text. */}
      {rating !== undefined ? (
        <View style={styles.rating}>
          <Ionicons name="star" size={12} color={themeColors.primary} />
          <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
            {rating.toFixed(1)}
          </Text>
        </View>
      ) : null}

      {onPress ? <Ionicons name="chevron-forward" size={12} color={themeColors.textMuted} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
