import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/routers';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchProviders } from '@/api/providers';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CategoryList } from '@/components/CategoryList';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { SearchBar } from '@/components/SearchBar';
import { categories } from '@/data/mockData';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SCREENS } from '@/navigation/screens';
import type { HomeStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { colors, radii, spacing, typography } from '@/theme';

/** "Recommended" means top-rated — anything below this doesn't make the cut. */
const RECOMMENDED_MIN_RATING = 4.8;

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

  const { data: pros = [], loading, error, retry } = useAsyncData(fetchProviders);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPros = pros.filter((pro) => {
    const isRecommended = pro.rating >= RECOMMENDED_MIN_RATING;
    const matchesCategory = !selectedCategoryId || pro.categoryId === selectedCategoryId;
    const matchesQuery =
      !normalizedQuery ||
      pro.name.toLowerCase().includes(normalizedQuery) ||
      pro.role.toLowerCase().includes(normalizedQuery);
    return isRecommended && matchesCategory && matchesQuery;
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + spacing.xl },
        ]}
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
              <Ionicons name="heart" size={20} color={colors.white} />
            </View>
            <View style={styles.urgentText}>
              <Text style={[typography.h4, styles.urgentTitle]}>Urgent request</Text>
              <Text style={[typography.bodyS, styles.urgentSubtitle]}>
                A pro arrives in about 30 minutes
              </Text>
            </View>
            <Button title="Book now" tintColor={colors.urgent} fullWidth={false} />
          </View>

          <CategoryList
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={(id) => setSelectedCategoryId((current) => (current === id ? undefined : id))}
          />

          <Text style={[typography.sectionTitle, styles.sectionTitle]}>Recommended pros</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.sectionState} />
          ) : error ? (
            <View style={styles.sectionState}>
              <Text style={[typography.bodyM, styles.errorText]}>{error}</Text>
              <Button title="Try again" onPress={retry} fullWidth={false} />
            </View>
          ) : filteredPros.length === 0 ? (
            <Text style={[typography.bodyM, styles.emptyState]}>
              No pros match your search yet.
            </Text>
          ) : (
            <View style={styles.grid}>
              {filteredPros.map((pro) => (
                <View key={pro.id} style={{ width: cardWidth }}>
                  <ProCard
                    name={pro.name}
                    role={pro.role}
                    rating={pro.rating}
                    imageUrl={pro.imageUrl}
                    onPress={() => navigation.navigate(SCREENS.PRO_DETAILS, { proId: pro.id })}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Header
        title="FixIt"
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        rightElement={<Avatar />}
      />
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
    backgroundColor: colors.urgent,
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
  emptyState: {
    color: colors.textMuted,
  },
  sectionState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  errorText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
