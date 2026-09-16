import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { ProCard } from '@/components/ProCard';
import { StarRating } from '@/components/StarRating';
import { Tag } from '@/components/Tag';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { currentWeek, recommendedPros } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { HomeStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { colors, spacing, typography } from '@/theme';

type ProDetailsRoute = RouteProp<HomeStackParamList, 'ProDetails'>;

export function ProDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProDetailsRoute>();
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const [week] = useState(currentWeek);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => (new Date().getDay() + 6) % 7);

  const proId = route.params?.proId;
  const pro = proId ? recommendedPros.find((candidate) => candidate.id === proId) : undefined;

  // proId can be missing or stale (a bad deep link, a typo'd id) — show a
  // clear dead end with a way back instead of crashing on `pro.name` below.
  if (!pro) {
    return (
      <View style={styles.screen}>
        <View style={[styles.errorState, { paddingTop: headerClearance }]}>
          <Text style={[typography.h4, styles.errorTitle]}>Pro not found</Text>
          <Text style={[typography.bodyM, styles.errorBody]}>
            {proId
              ? `No pro matches id "${proId}".`
              : "This screen needs a pro's id to know who to show."}
          </Text>
          <Button title="Back to Home" onPress={() => navigation.goBack()} fullWidth={false} />
        </View>
        <Header title="Pro profile" onBackPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <View style={styles.profileHeader}>
            <Avatar size="lg" imageUrl={pro.imageUrl} />
            <Text style={[typography.h1, styles.name]}>{pro.name}</Text>
            <StarRating rating={pro.rating} />
            <Tag label={pro.role} />
          </View>

          <Text style={typography.sectionTitle}>About</Text>
          <Text style={[typography.bodyM, styles.about]}>{pro.about}</Text>

          <Text style={typography.sectionTitle}>Pricing</Text>
          <View style={styles.grid}>
            {pro.pricing.map((item) => (
              <View key={item.id} style={{ width: cardWidth }}>
                <ListItem title={item.title} subtitle={item.subtitle} />
              </View>
            ))}
          </View>

          <Text style={typography.sectionTitle}>Availability</Text>
          <WeeklyCalendar
            days={week}
            selectedIndex={selectedDayIndex}
            onSelect={setSelectedDayIndex}
          />

          <Text style={typography.sectionTitle}>Reviews</Text>
          <View style={styles.grid}>
            {pro.reviews.map((review) => (
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
        </View>
      </ScrollView>

      {/* Sits outside the ScrollView, so it doesn't get the tab bar's automatic
          content-inset — needs its own clearance or it renders unreachable
          underneath the floating/translucent tab bar. */}
      <View style={[styles.footer, { paddingBottom: bottomClearance + spacing.md }]}>
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
  scroll: {
    flex: 1,
    // Web flexbox won't let a flex child shrink below its content's natural
    // height unless minHeight is reset — without this the ScrollView grows
    // past the footer instead of scrolling internally.
    minHeight: 0,
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
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
  },
  errorBody: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
