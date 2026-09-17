import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import type { ApiProvider } from '@/api/providers';
import { fetchProviders } from '@/api/providers';
import { Button } from '@/components/Button';
import { BookingSuccessModal } from '@/components/BookingSuccessModal';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { useTheme } from '@/context/ThemeContext';
import { todayDateKey } from '@/data/mockData';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { MAX_BOOKINGS_PER_DAY, addBooking, countBookingsOnDate } from '@/store/bookingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography } from '@/theme';

/**
 * "Book now" on the Urgent request card lands here instead of doing
 * nothing — a one-tap list of available pros, each bookable for today
 * immediately, no profile/day-picker detour for when it can't wait.
 */
export function UrgentBookingScreen() {
  const navigation = useNavigation();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { cardWidth } = useResponsiveLayout();
  const { colors: themeColors } = useTheme();
  const { data: pros = [], loading, error, retry } = useAsyncData(fetchProviders);
  const bookings = useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  const [bookedProvider, setBookedProvider] = useState<ApiProvider | null>(null);

  const today = todayDateKey();
  // Each pro caps out at MAX_BOOKINGS_PER_DAY of their OWN bookings for
  // today — that's the only thing that hides them here; it says nothing
  // about anyone else, so no list-wide "today is full" banner applies.
  const isFullToday = (pro: ApiProvider) =>
    countBookingsOnDate(bookings, pro.id, today) >= MAX_BOOKINGS_PER_DAY;
  const visiblePros = pros.filter((pro) => !isFullToday(pro));

  const bookNow = (pro: ApiProvider) => {
    // A stray tap in a scrolling list shouldn't book someone outright — this
    // is the one extra step between "tapped a row" and "actually booked".
    Alert.alert(`Book ${pro.name}?`, `${pro.role} · today`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Book now',
        onPress: () => {
          dispatch(
            addBooking({
              providerId: pro.id,
              name: pro.name,
              role: pro.role,
              imageUrl: pro.imageUrl,
              dateKey: today,
            }),
          );
          setBookedProvider(pro);
        },
      },
    ]);
  };

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
        <Animated.FlatList<ApiProvider>
          contentContainerStyle={[
            styles.list,
            { paddingTop: headerClearance, paddingBottom: bottomClearance + spacing.xl },
          ]}
          data={visiblePros}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Text
              style={[
                typography.sectionTitle,
                styles.listHeader,
                { color: themeColors.textPrimary },
              ]}
            >
              Tap a pro to book them for today
            </Text>
          }
          ListEmptyComponent={
            <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>
              Every pro is fully booked for today — try Bookings to pick another day.
            </Text>
          }
          renderItem={({ item: pro }) => (
            <Animated.View exiting={FadeOut} layout={LinearTransition} style={{ width: cardWidth }}>
              <ProCard
                name={pro.name}
                role={pro.role}
                rating={pro.rating}
                imageUrl={pro.imageUrl}
                onPress={() => bookNow(pro)}
              />
            </Animated.View>
          )}
        />
      )}

      <Header title="Urgent request" onBackPress={() => navigation.goBack()} />

      <BookingSuccessModal
        visible={bookedProvider !== null}
        providerName={bookedProvider?.name ?? ''}
        dateLabel="today"
        onClose={() => {
          setBookedProvider(null);
          navigation.goBack();
        }}
      />
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
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  listHeader: {
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
});
