import Ionicons from '@expo/vector-icons/Ionicons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchProviderById } from '@/api/providers';
import { Button } from '@/components/Button';
import { GlassSurface } from '@/components/GlassSurface';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProviderProfile } from '@/components/ProviderProfile';
import { useTheme } from '@/context/ThemeContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { CategoriesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { toggleFavorite } from '@/store/favoritesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, spacing, typography } from '@/theme';

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
  const { colors: themeColors } = useTheme();
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const dispatch = useAppDispatch();
  const isFavorite = providerId ? favoriteIds.includes(providerId) : false;

  const fetchThis = useCallback(() => fetchProviderById(providerId), [providerId]);
  const { data: provider, loading, error, retry } = useAsyncData(fetchThis);

  const rightAction = provider ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      hitSlop={8}
      onPress={() => dispatch(toggleFavorite(provider.id))}
    >
      <GlassSurface
        style={[styles.headerButton, { borderColor: themeColors.surfaceMedium }]}
        isInteractive
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite ? themeColors.urgent : themeColors.textPrimary}
        />
      </GlassSurface>
    </Pressable>
  ) : null;

  if (loading || error || !provider) {
    return (
      <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          {loading ? (
            <ActivityIndicator size="large" color={themeColors.primary} />
          ) : (
            <>
              <Text
                style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}
              >
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
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + spacing.xl },
        ]}
      >
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <ProviderProfile provider={provider} />
        </View>
      </ScrollView>

      <Header
        title="Provider profile"
        onBackPress={() => navigation.goBack()}
        rightElement={rightAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
