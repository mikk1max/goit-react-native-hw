import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { avatarFor, fetchProviders } from '@/api/providers';
import type { ApiProvider } from '@/api/providers';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SCREENS } from '@/navigation/screens';
import type { CategoriesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { colors, spacing, typography } from '@/theme';

type CategoryDetailsRoute = RouteProp<CategoriesStackParamList, 'CategoryDetails'>;
type CategoriesStackNav = NativeStackNavigationProp<CategoriesStackParamList>;

/**
 * The provider directory for one category — reached from CategoriesScreen,
 * fetched live instead of read from local mock data (unlike Home's
 * recommendedPros). JSONPlaceholder's /users has no category field, so the
 * same directory shows for every category here; a real backend would filter
 * this GET by categoryId.
 */
export function CategoryDetailsScreen() {
  const navigation = useNavigation<CategoriesStackNav>();
  const route = useRoute<CategoryDetailsRoute>();
  const { categoryLabel } = route.params;
  const { contentWidth, cardWidth, columns } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();

  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No synchronous setState here — every state update happens inside the
  // promise callbacks, once the fetch actually settles, not immediately when
  // the effect runs. "Try again" resets loading/error itself before calling
  // this, since that happens in a Pressable's onPress, not an effect body.
  const load = useCallback(() => {
    fetchProviders()
      .then((data) => {
        setProviders(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <Text style={[typography.bodyM, styles.errorText]}>{error}</Text>
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
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[typography.sectionTitle, styles.sectionTitle]}>
                Available {categoryLabel.toLowerCase()} pros
              </Text>
              <Text style={[typography.bodyS, styles.subtitle]}>
                Live directory data — the same list shows for every category in this demo.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[typography.bodyM, styles.subtitle]}>No providers found.</Text>
          }
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ProCard
                name={item.name}
                role={item.company.name}
                imageUrl={avatarFor(item.id)}
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
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  listHeader: {
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  row: {
    gap: spacing.sm,
  },
});
