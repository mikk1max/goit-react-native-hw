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
import type { HomeStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { toggleFavorite } from '@/store/favoritesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, spacing, typography } from '@/theme';

type ProDetailsRoute = RouteProp<HomeStackParamList, 'ProDetails'>;

export function ProDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProDetailsRoute>();
  const { contentWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const dispatch = useAppDispatch();

  const proId = route.params?.proId;
  const hideBooking = route.params?.hideBooking;
  const isFavorite = proId ? favoriteIds.includes(proId) : false;

  // proId can be missing (a screen reached with no params) — reject before
  // ever calling fetchProviderById rather than fetching with an empty id.
  const fetchThis = useCallback(() => {
    if (!proId) {
      return Promise.reject(new Error("This screen needs a pro's id to know who to show."));
    }
    return fetchProviderById(proId);
  }, [proId]);
  const { data: pro, loading, error, retry } = useAsyncData(fetchThis);

  const rightAction = pro ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      hitSlop={8}
      onPress={() => dispatch(toggleFavorite(pro.id))}
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

  // A stale id (bad deep link, typo) surfaces as fetchProviderById's own
  // "no provider matches" error here — same explicit dead end, not a crash.
  if (loading || error || !pro) {
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
                {error ?? 'Pro not found.'}
              </Text>
              <Button title="Try again" onPress={retry} fullWidth={false} />
            </>
          )}
        </View>
        <Header title="Pro profile" onBackPress={() => navigation.goBack()} />
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
          <ProviderProfile provider={pro} hideBooking={hideBooking} />
        </View>
      </ScrollView>

      <Header
        title="Pro profile"
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
