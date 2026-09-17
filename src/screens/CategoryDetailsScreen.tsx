import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { fetchProvidersByCategory } from '@/api/providers';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { useTheme } from '@/context/ThemeContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SCREENS } from '@/navigation/screens';
import type { CategoriesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { spacing, typography } from '@/theme';

type CategoryDetailsRoute = RouteProp<CategoriesStackParamList, 'CategoryDetails'>;
type CategoriesStackNav = NativeStackNavigationProp<CategoriesStackParamList>;

/**
 * The provider directory for one category — reached from CategoriesScreen,
 * fetched live the same way as Home's Recommended pros. randomuser.me has
 * no category concept at all, so fetchProvidersByCategory assigns + filters
 * client-side (see api/providers.ts) — a real backend would do this
 * filtering itself, but the result here is a genuinely different directory
 * per category, not the same list relabeled.
 */
export function CategoryDetailsScreen() {
  const navigation = useNavigation<CategoriesStackNav>();
  const route = useRoute<CategoryDetailsRoute>();
  const { categoryId, categoryLabel } = route.params;
  const { contentWidth, cardWidth, columns } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();

  const fetchThis = useCallback(() => fetchProvidersByCategory(categoryId), [categoryId]);
  const { data: providers = [], loading, error, retry } = useAsyncData(fetchThis);

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
          data={providers}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? styles.row : undefined}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[typography.sectionTitle, { color: themeColors.text }]}>
                Available {categoryLabel.toLowerCase()} pros
              </Text>
              <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
                Live directory data.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
              No providers found.
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
