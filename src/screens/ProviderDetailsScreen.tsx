import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchProviderById } from '@/api/providers';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProviderProfile } from '@/components/ProviderProfile';
import { useAsyncData } from '@/hooks/useAsyncData';
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
 * Renders through ProviderProfile, the same About/Pricing/Availability/
 * Reviews layout Home's Pro profile uses for the same shape of data.
 */
export function ProviderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProviderDetailsRoute>();
  const { providerId } = route.params;
  const { contentWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();

  const fetchThis = useCallback(() => fetchProviderById(providerId), [providerId]);
  const { data: provider, loading, error, retry } = useAsyncData(fetchThis);

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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <ProviderProfile provider={provider} />
        </View>
      </ScrollView>

      {/* Sits outside the ScrollView, so it doesn't get the tab bar's automatic
          content-inset — needs its own clearance or it renders unreachable
          underneath the floating/translucent tab bar. */}
      <View style={[styles.footer, { paddingBottom: bottomClearance + spacing.md }]}>
        <Button title="Book appointment" />
      </View>

      <Header title="Provider profile" onBackPress={() => navigation.goBack()} />
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
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
});
