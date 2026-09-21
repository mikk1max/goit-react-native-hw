import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { fetchProviders, fetchProvidersByCategory } from '@/api/providers';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { useTheme } from '@/context/ThemeContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SCREENS } from '@/navigation/screens';
import type { CategoriesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { useAppSelector } from '@/store/hooks';
import { spacing, typography } from '@/theme';

type CategoryDetailsRoute = RouteProp<CategoriesStackParamList, 'CategoryDetails'>;
type CategoriesStackNav = NativeStackNavigationProp<CategoriesStackParamList>;

/**
 * The provider directory for one category — reached from CategoriesScreen,
 * fetched live the same way as Home's Recommended pros.
 */
export function CategoryDetailsScreen() {
  const navigation = useNavigation<CategoriesStackNav>();
  const route = useRoute<CategoryDetailsRoute>();
  const { categoryId, categoryLabel } = route.params;
  const { contentWidth, cardWidth, columns } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();

  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  const fetchThis = useCallback(() => {
    if (categoryId === 'favorites') {
      return fetchProviders();
    }
    return fetchProvidersByCategory(categoryId);
  }, [categoryId]);
  const { data: providers = [], loading, error, retry } = useAsyncData(fetchThis);

  const displayedProviders = useMemo(() => {
    if (categoryId === 'favorites') {
      return providers.filter((p) => favoriteIds.includes(p.id));
    }
    return providers;
  }, [categoryId, providers, favoriteIds]);

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      {loading ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <Text style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}>
            {error}
          </Text>
          <Button title="Try again" onPress={retry} fullWidth={false} />
        </View>
      ) : (
        <FlatList
          key={columns}
          style={{ width: contentWidth }}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerClearance, paddingBottom: bottomClearance + spacing.xl },
          ]}
          data={displayedProviders}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? styles.row : undefined}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>
                {categoryId === 'favorites'
                  ? 'Your favorite pros'
                  : `Available ${categoryLabel.toLowerCase()} pros`}
              </Text>
              <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
                {categoryId === 'favorites'
                  ? 'Pros you marked as favorite.'
                  : 'Live directory data.'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
              {categoryId === 'favorites'
                ? 'No favorite pros yet — tap the heart icon on any pro card to add them here.'
                : 'No providers found.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ProCard
                name={item.name}
                role={item.role}
                rating={item.rating}
                imageUrl={item.imageUrl}
                onPress={() =>
                  navigation.navigate(SCREENS.PROVIDER_DETAILS, { providerId: item.id })
                }
              />
            </View>
          )}
        />
      )}

      <Header title={categoryLabel} onBackPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  listHeader: {
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
});
