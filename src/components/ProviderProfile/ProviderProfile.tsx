import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ApiProvider } from '@/api/providers';
import { Avatar } from '@/components/Avatar';
import { ListItem } from '@/components/ListItem';
import { ProCard } from '@/components/ProCard';
import { StarRating } from '@/components/StarRating';
import { Tag } from '@/components/Tag';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { currentWeek } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors, spacing, typography } from '@/theme';

export type ProviderProfileProps = {
  provider: ApiProvider;
};

/**
 * About/Pricing/Availability/Reviews body — shared by Home's Pro profile
 * (ProDetailsScreen) and Categories' Provider profile (ProviderDetailsScreen)
 * so the two fetch-by-id screens render the exact same layout for the same
 * shape of data instead of drifting apart.
 */
export function ProviderProfile({ provider }: ProviderProfileProps) {
  const { cardWidth } = useResponsiveLayout();
  const [week] = useState(currentWeek);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => (new Date().getDay() + 6) % 7);

  return (
    <>
      <View style={styles.profileHeader}>
        <Avatar size="lg" imageUrl={provider.imageUrl} />
        <Text style={[typography.h1, styles.name]}>{provider.name}</Text>
        <StarRating rating={provider.rating} />
        <Tag label={provider.role} />
      </View>

      <Text style={typography.sectionTitle}>About</Text>
      <Text style={[typography.bodyM, styles.about]}>{provider.about}</Text>

      <Text style={typography.sectionTitle}>Pricing</Text>
      <View style={styles.grid}>
        {provider.pricing.map((item) => (
          <View key={item.id} style={{ width: cardWidth }}>
            <ListItem title={item.title} subtitle={item.subtitle} />
          </View>
        ))}
      </View>

      <Text style={typography.sectionTitle}>Availability</Text>
      <WeeklyCalendar days={week} selectedIndex={selectedDayIndex} onSelect={setSelectedDayIndex} />

      <Text style={typography.sectionTitle}>Reviews</Text>
      <View style={styles.grid}>
        {provider.reviews.map((review) => (
          <View key={review.id} style={{ width: cardWidth }}>
            <ProCard
              name={review.name}
              role={review.comment}
              rating={review.rating}
              imageUrl={review.imageUrl}
            />
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
  },
  about: {
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
