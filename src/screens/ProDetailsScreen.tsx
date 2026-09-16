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
import type { HomeStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { colors, spacing, typography } from '@/theme';

type ProDetailsRoute = RouteProp<HomeStackParamList, 'ProDetails'>;

export function ProDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProDetailsRoute>();
  const { contentWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();

  const proId = route.params?.proId;
  // proId can be missing (a screen reached with no params) — reject before
  // ever calling fetchProviderById rather than fetching with an empty id.
  const fetchThis = useCallback(() => {
    if (!proId) {
      return Promise.reject(new Error("This screen needs a pro's id to know who to show."));
    }
    return fetchProviderById(proId);
  }, [proId]);
  const { data: pro, loading, error, retry } = useAsyncData(fetchThis);

  // A stale id (bad deep link, typo) surfaces as fetchProviderById's own
  // "no provider matches" error here — same explicit dead end, not a crash.
  if (loading || error || !pro) {
    return (
      <View style={styles.screen}>
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Text style={[typography.bodyM, styles.errorText]}>{error ?? 'Pro not found.'}</Text>
              <Button title="Try again" onPress={retry} fullWidth={false} />
            </>
          )}
        </View>
        <Header title="Pro profile" onBackPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <ProviderProfile provider={pro} />
        </View>
      </ScrollView>

      {/* Sits outside the ScrollView, so it doesn't get the tab bar's automatic
          content-inset — needs its own clearance or it renders unreachable
          underneath the floating/translucent tab bar. */}
      <View style={[styles.footer, { paddingBottom: bottomClearance + spacing.md }]}>
        <Button title="Book appointment" />
      </View>

      <Header title="Pro profile" onBackPress={() => navigation.goBack()} />
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
