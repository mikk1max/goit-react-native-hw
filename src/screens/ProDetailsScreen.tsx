import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { ProCard } from '@/components/ProCard';
import { StarRating } from '@/components/StarRating';
import { Tag } from '@/components/Tag';
import { pricingList, recommendedPros, reviews } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
// Metro/tsc resolve useTabBarHeight.native.ts/.web.ts fine (see App.tsx's RootNavigator import).
// eslint-disable-next-line import/no-unresolved
import { useTabBarHeight } from '@/navigation/useTabBarHeight';
import { colors, spacing, typography } from '@/theme';

export function ProDetailsScreen() {
  const navigation = useNavigation();
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  // Only ever reached by pushing from Home, so there's always a screen to go back to.
  const tabBarHeight = useTabBarHeight();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <View style={styles.profileHeader}>
            {/* This screen is always Marek Nowak for now (see Roadmap: no
                real data fetching by proId yet) — his own mock image. */}
            <Avatar size="lg" imageUrl={recommendedPros[0].imageUrl} />
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
                <ProCard
                  name={review.name}
                  role={review.role}
                  rating={review.rating}
                  imageUrl={review.imageUrl}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sits outside the ScrollView, so it doesn't get the tab bar's automatic
          content-inset — needs its own clearance or it renders unreachable
          underneath the floating/translucent tab bar. */}
      <View style={[styles.footer, { paddingBottom: tabBarHeight + spacing.md }]}>
        <Button title="Book appointment" />
      </View>

      <Header title="Pro profile" onBackPress={navigation.goBack} />
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
