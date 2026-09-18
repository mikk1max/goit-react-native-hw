import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

export type StarRatingProps = {
  /** 0-5, fractional values (e.g. 4.9) round to the nearest half star. */
  rating: number;
  size?: number;
  maxStars?: number;
};

export function StarRating({ rating, size = 20, maxStars = 5 }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(rating, maxStars));

  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, index) => {
        const diff = clamped - index;
        const name = diff >= 1 ? 'star' : diff >= 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={index} name={name} size={size} color={colors.primary} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
