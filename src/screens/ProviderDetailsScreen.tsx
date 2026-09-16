import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchProviderById } from '@/api/providers';
import type { ApiProvider } from '@/api/providers';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { Tag } from '@/components/Tag';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { CategoriesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { colors, spacing, typography } from '@/theme';

type ProviderDetailsRoute = RouteProp<CategoriesStackParamList, 'ProviderDetails'>;

/**
 * Reached by tapping a provider on CategoryDetailsScreen — fetches that one
 * record again instead of reusing the list response, the way a real detail
 * screen would once the backend has a true per-record GET endpoint.
 * randomuser.me doesn't have one (it's a generator, not a database), so
 * fetchProviderById re-issues the same seeded request and finds the record
 * client-side — see the comment on that function in api/providers.ts.
 */
export function ProviderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProviderDetailsRoute>();
  const { providerId } = route.params;
  const { contentWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();

  const [provider, setProvider] = useState<ApiProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No synchronous setState here — see the matching comment on
  // CategoryDetailsScreen's load().
  const load = useCallback(() => {
    fetchProviderById(providerId)
      .then((data) => {
        setProvider(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, [providerId]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  if (loading || error || !provider) {
    return (
      <View style={styles.screen}>
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Text style={[typography.bodyM, styles.errorText]}>
                {error ?? 'Provider not found.'}
              </Text>
              <Button title="Try again" onPress={retry} fullWidth={false} />
            </>
          )}
        </View>
        <Header title="Provider profile" onBackPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + spacing.xl },
        ]}
      >
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <View style={styles.profileHeader}>
            <Avatar size="lg" imageUrl={provider.imageUrl} />
            <Text style={[typography.h1, styles.name]}>{provider.name}</Text>
            <Tag label={provider.role} />
          </View>

          <Text style={typography.sectionTitle}>About</Text>
          <Text style={[typography.bodyM, styles.about]}>{provider.about}</Text>

          <Text style={typography.sectionTitle}>Contact</Text>
          <View style={styles.list}>
            <ListItem title={provider.email} subtitle="Email" />
            <ListItem title={provider.phone} subtitle="Phone" />
            <ListItem title={provider.cell} subtitle="Mobile" />
          </View>

          <Text style={typography.sectionTitle}>Address</Text>
          <ListItem title={provider.address} subtitle="Address" />
        </View>
      </ScrollView>

      <Header title="Provider profile" onBackPress={() => navigation.goBack()} />
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
  scrollContent: {
    alignItems: 'center',
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
  list: {
    gap: spacing.xxs,
  },
});
