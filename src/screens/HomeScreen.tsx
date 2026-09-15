import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CategoryList } from '@/components/CategoryList';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { SearchBar } from '@/components/SearchBar';
import { categories, recommendedPros } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { HomeStackParamList } from '@/navigation/types';
// Metro/tsc resolve useTabBarHeight.native.ts/.web.ts fine (see App.tsx's RootNavigator import).
// eslint-disable-next-line import/no-unresolved
import { useTabBarHeight } from '@/navigation/useTabBarHeight';
import { colors, radii, spacing, typography } from '@/theme';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const tabBarHeight = useTabBarHeight();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + spacing.xl }]}
      >
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a pro or service"
          />

          {/* Coral accent, not the brand blue used everywhere else — blue reads
              as "book calmly", this module means "something's wrong, act now". */}
          <View style={styles.urgentCard}>
            <View style={styles.urgentIcon}>
              <Ionicons name="heart" size={20} color={colors.urgent} />
            </View>
            <View style={styles.urgentText}>
              <Text style={[typography.h4, styles.urgentTitle]}>Urgent request</Text>
              <Text style={[typography.bodyS, styles.urgentSubtitle]}>
                A pro arrives in about 30 minutes
              </Text>
            </View>
            <Button
              title="Book now"
              variant="secondary"
              tintColor={colors.urgent}
              fullWidth={false}
            />
          </View>

          <CategoryList
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />

          <Text style={[typography.sectionTitle, styles.sectionTitle]}>Recommended pros</Text>

          <View style={styles.grid}>
            {recommendedPros.map((pro) => (
              <View key={pro.id} style={{ width: cardWidth }}>
                <ProCard
                  name={pro.name}
                  role={pro.role}
                  rating={pro.rating}
                  imageUrl={pro.imageUrl}
                  onPress={() => navigation.navigate('ProDetails', { proId: pro.id })}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Header title="FixIt" rightElement={<Avatar />} />
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
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.urgentLight,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  urgentIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentText: {
    flex: 1,
    gap: spacing.xxs,
  },
  urgentTitle: {
    color: colors.textPrimary,
  },
  urgentSubtitle: {
    color: colors.textMuted,
  },
  sectionTitle: {
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
