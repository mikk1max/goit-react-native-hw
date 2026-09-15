import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { ProCard } from '@/components/ProCard';
import { StarRating } from '@/components/StarRating';
import { Tag } from '@/components/Tag';
import { useFloatingTabBarClearance } from '@/components/TabBar';
import { pricingList, reviews } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors, spacing, typography } from '@/theme';

export function ProDetailsScreen() {
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const tabBarClearance = useFloatingTabBarClearance();

  return (
    <View style={styles.screen}>
      <Header title="Pro profile" onBackPress={() => {}} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.profileHeader}>
            <Avatar size="lg" />
            <Text style={[typography.h1, styles.name]}>Marek Nowak</Text>
            <StarRating rating={4.9} />
            <Tag label="Plumber" />
          </View>

          <Text style={typography.sectionTitle}>About</Text>
          <Text style={[typography.bodyM, styles.about]}>
            12 years of experience in plumbing repairs. I specialize in emergency leaks and
            pipe/fixture replacement.
          </Text>

          <Text style={typography.sectionTitle}>Pricing</Text>
          <View style={styles.grid}>
            {pricingList.map((item) => (
              <View key={item.id} style={{ width: cardWidth }}>
                <ListItem title={item.title} subtitle={item.subtitle} />
              </View>
            ))}
          </View>

          <Text style={typography.sectionTitle}>Reviews</Text>
          <View style={styles.grid}>
            {reviews.map((review) => (
              <View key={review.id} style={{ width: cardWidth }}>
                <ProCard name={review.name} role={review.role} rating={review.rating} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: tabBarClearance }]}>
        <Button title="Book appointment" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
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
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
