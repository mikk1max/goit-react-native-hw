import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/routers';
import { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { ApiProvider } from '@/api/providers';
import { fetchProviders } from '@/api/providers';
import { Button } from '@/components/Button';
import { CategoryList } from '@/components/CategoryList';
import { GlassSurface } from '@/components/GlassSurface';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/context/ThemeContext';
import { categories } from '@/data/mockData';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SCREENS } from '@/navigation/screens';
import type { HomeStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { useAppSelector } from '@/store/hooks';
import { radii, spacing, typography } from '@/theme';

/** "Recommended" means top-rated — anything below this doesn't make the cut. */
const RECOMMENDED_MIN_RATING = 4.8;

type ProGridItemProps = {
  pro: ApiProvider;
  width: number;
  onPress: (proId: string) => void;
};

/**
 * One tile of the Recommended-pros grid, split out and memoed so typing in
 * the search box above — which re-renders HomeScreen on every keystroke —
 * doesn't also re-render every card in the grid, only the ones that actually
 * entered/left the filtered list. Needs `onPress` to be a stable reference
 * (see `goToProDetails` below) or React.memo has nothing to compare against.
 */
const ProGridItem = memo(function ProGridItem({
  pro,
  width,
  onPress,
}: ProGridItemProps) {
  const handlePress = useCallback(() => onPress(pro.id), [onPress, pro.id]);

  return (
    <View style={{ width }}>
      <ProCard
        name={pro.name}
        role={pro.role}
        rating={pro.rating}
        imageUrl={pro.imageUrl}
        onPress={handlePress}
      />
    </View>
  );
});

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  // Context API demo, 2nd consumer: same ThemeContext DrawerContent's switch flips.
  const { colors: themeColors } = useTheme();

  const { data: pros = [], loading, error, retry } = useAsyncData(fetchProviders);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  const normalizedQuery = query.trim().toLowerCase();
  // Memoized so this re-filter only runs when the pros list, the category
  // filter, or the search text actually change — not on every HomeScreen
  // re-render (e.g. a theme change while this screen sits in the background).
  const filteredPros = useMemo(
    () =>
      pros.filter((pro) => {
        const isRecommended = pro.rating >= RECOMMENDED_MIN_RATING;
        const matchesCategory =
          !selectedCategoryId ||
          (selectedCategoryId === 'favorites'
            ? favoriteIds.includes(pro.id)
            : pro.categoryId === selectedCategoryId);
        const matchesQuery =
          !normalizedQuery ||
          pro.name.toLowerCase().includes(normalizedQuery) ||
          pro.role.toLowerCase().includes(normalizedQuery);
        return isRecommended && matchesCategory && matchesQuery;
      }),
    [pros, selectedCategoryId, favoriteIds, normalizedQuery],
  );

  // Stable across re-renders so ProGridItem's React.memo can actually skip
  // re-rendering cards — an inline arrow recreated per render would defeat it.
  const goToProDetails = useCallback(
    (proId: string) => navigation.navigate(SCREENS.PRO_DETAILS, { proId }),
    [navigation],
  );

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + spacing.xl },
        ]}
      >
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <Animated.View entering={FadeInDown.delay(0).duration(280)}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search for a pro or service"
            />
          </Animated.View>

          {/* Coral accent, not the brand blue used everywhere else — blue reads
              as "book calmly", this module means "something's wrong, act now". */}
          <Animated.View
            entering={FadeInDown.delay(70).duration(280)}
            style={[styles.urgentCard, { backgroundColor: themeColors.urgentLight }]}
          >
            <View style={[styles.urgentIcon, { backgroundColor: themeColors.urgent }]}>
              <Ionicons name="heart" size={20} color={themeColors.white} />
            </View>
            <View style={styles.urgentText}>
              <Text style={[typography.h4, { color: themeColors.textPrimary }]}>
                Urgent request
              </Text>
              <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
                A pro arrives in about 30 minutes
              </Text>
            </View>
            <Button
              title="Book now"
              tintColor={themeColors.urgent}
              fullWidth={false}
              onPress={() => navigation.navigate(SCREENS.URGENT_BOOKING)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(280)}>
            <CategoryList
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={(id) => setSelectedCategoryId((current) => (current === id ? undefined : id))}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(210).duration(280)} style={styles.recommendedSection}>
            <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>
              Recommended pros
            </Text>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={themeColors.primary}
                style={styles.sectionState}
              />
            ) : error ? (
              <View style={styles.sectionState}>
                <Text
                  style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}
                >
                  {error}
                </Text>
                <Button title="Try again" onPress={retry} fullWidth={false} />
              </View>
            ) : filteredPros.length === 0 ? (
              <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
                No pros match your search yet.
              </Text>
            ) : (
              <View style={styles.grid}>
                {filteredPros.map((pro) => (
                  <ProGridItem
                    key={pro.id}
                    pro={pro}
                    width={cardWidth}
                    onPress={goToProDetails}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      <Header
        title="FixIt"
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        rightElement={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to Profile"
            hitSlop={8}
            onPress={() => navigation.getParent()?.navigate(SCREENS.PROFILE as never)}
          >
            <GlassSurface
              style={[styles.profileButton, { borderColor: themeColors.surfaceMedium }]}
              isInteractive
            >
              <Ionicons name="person-outline" size={18} color={themeColors.textPrimary} />
            </GlassSurface>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    borderRadius: radii.md,
    padding: spacing.md,
  },
  urgentIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentText: {
    flex: 1,
    gap: spacing.xxs,
  },
  recommendedSection: {
    gap: spacing.md,
  },
  sectionState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
