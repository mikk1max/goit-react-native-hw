import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { ApiProvider } from '@/api/providers';
import { Avatar } from '@/components/Avatar';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { BookingSuccessModal } from '@/components/BookingSuccessModal';
import { Button } from '@/components/Button';
import { ListItem } from '@/components/ListItem';
import { ProCard } from '@/components/ProCard';
import { StarRating } from '@/components/StarRating';
import { Tag } from '@/components/Tag';
import { useTheme } from '@/context/ThemeContext';
import { formatBookingDate, todayDateKey } from '@/data/mockData';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { navigateToChat } from '@/navigation/navigationRef';
import {
  MAX_BOOKINGS_PER_DAY,
  addBooking,
  countBookingsOnDate,
  findAvailableDate,
} from '@/store/bookingsSlice';
import { startConversation } from '@/store/chatsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing, typography } from '@/theme';

export type ProviderProfileProps = {
  provider: ApiProvider;
  hideBooking?: boolean;
};

/** Each section fades/slides in a little after the one before it, instead of the whole profile appearing at once. */
const SECTION_STAGGER_MS = 80;

/**
 * About/Pricing/Availability/Reviews body — shared by Home's Pro profile
 * (ProDetailsScreen) and Categories' Provider profile (ProviderDetailsScreen)
 * so the two fetch-by-id screens render the exact same layout for the same
 * shape of data instead of drifting apart.
 */
export function ProviderProfile({ provider, hideBooking = false }: ProviderProfileProps) {
  const { cardWidth } = useResponsiveLayout();
  const { colors: themeColors } = useTheme();
  const bookings = useAppSelector((state) => state.bookings.items);
  const dispatch = useAppDispatch();
  const requireAuth = useRequireAuth();

  // This pro's day fills up once MAX_BOOKINGS_PER_DAY of THEIR bookings
  // already sit on it — default to today, or the soonest day after it with
  // room on their calendar specifically (other pros' bookings don't count).
  // Guests have no bookings loaded at all, so this just starts at today.
  const [selectedDateKey, setSelectedDateKey] = useState(
    () => findAvailableDate(bookings, provider.id, todayDateKey()) ?? todayDateKey(),
  );
  const [confirmedDateKey, setConfirmedDateKey] = useState<string | null>(null);
  const [bookingPending, setBookingPending] = useState(false);
  const [messagePending, setMessagePending] = useState(false);

  const isDateDisabled = (dateKey: string) =>
    countBookingsOnDate(bookings, provider.id, dateKey) >= MAX_BOOKINGS_PER_DAY;
  const selectedDayDisabled = isDateDisabled(selectedDateKey);

  const book = () => {
    requireAuth(async () => {
      if (selectedDayDisabled) {
        return;
      }
      setBookingPending(true);
      try {
        await dispatch(
          addBooking({
            providerId: provider.id,
            name: provider.name,
            role: provider.role,
            imageUrl: provider.imageUrl,
            dateKey: selectedDateKey,
          }),
        ).unwrap();
        setConfirmedDateKey(selectedDateKey);
      } catch (err) {
        Alert.alert('Could not book', err instanceof Error ? err.message : 'Please try again.');
      } finally {
        setBookingPending(false);
      }
    });
  };

  const message = () => {
    requireAuth(async () => {
      setMessagePending(true);
      try {
        const conversation = await dispatch(
          startConversation({
            providerId: provider.id,
            providerName: provider.name,
            providerRole: provider.role,
            providerImageUrl: provider.imageUrl,
          }),
        ).unwrap();
        navigateToChat({
          conversationId: conversation.id,
          providerName: conversation.providerName,
          providerImageUrl: conversation.providerImageUrl,
        });
      } catch (err) {
        Alert.alert(
          'Could not start conversation',
          err instanceof Error ? err.message : 'Please try again.',
        );
      } finally {
        setMessagePending(false);
      }
    });
  };

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(0 * SECTION_STAGGER_MS).duration(300)}
        style={styles.profileHeader}
      >
        <Avatar size="lg" imageUrl={provider.imageUrl} />
        <Text style={[typography.h1, { color: themeColors.textPrimary }]}>{provider.name}</Text>
        <StarRating rating={provider.rating} />
        <Tag label={provider.role} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(1 * SECTION_STAGGER_MS).duration(300)}
        style={styles.section}
      >
        <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>About</Text>
        <Text style={[typography.bodyM, { color: themeColors.textPrimary }]}>{provider.about}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(2 * SECTION_STAGGER_MS).duration(300)}
        style={styles.section}
      >
        <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>Pricing</Text>
        <View style={styles.grid}>
          {provider.pricing.map((item) => (
            <View key={item.id} style={{ width: cardWidth }}>
              <ListItem title={item.title} subtitle={item.subtitle} />
            </View>
          ))}
        </View>
      </Animated.View>

      {!hideBooking ? (
        <Animated.View
          entering={FadeInDown.delay(3 * SECTION_STAGGER_MS).duration(300)}
          style={styles.section}
        >
          <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>
            Availability
          </Text>
          <AvailabilityCalendar
            selectedDateKey={selectedDateKey}
            onSelectDateKey={setSelectedDateKey}
            isDateDisabled={isDateDisabled}
          />
        </Animated.View>
      ) : null}

      <Animated.View
        entering={FadeInDown.delay(4 * SECTION_STAGGER_MS).duration(300)}
        style={styles.section}
      >
        <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>Reviews</Text>
        <View style={styles.grid}>
          {provider.reviews.map((review) => (
            <View key={review.id} style={{ width: cardWidth }}>
              <ProCard
                name={review.name}
                role={review.comment}
                rating={review.rating}
                imageUrl={review.imageUrl}
              />
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.actions}>
        {!hideBooking ? (
          <Button
            title="Book appointment"
            onPress={book}
            disabled={selectedDayDisabled}
            loading={bookingPending}
          />
        ) : null}
        <Button
          title="Message"
          variant={hideBooking ? 'primary' : 'secondary'}
          icon="chatbubble-outline"
          onPress={message}
          loading={messagePending}
        />
      </View>

      <BookingSuccessModal
        visible={confirmedDateKey !== null}
        providerName={provider.name}
        dateLabel={confirmedDateKey ? formatBookingDate(confirmedDateKey) : ''}
        onClose={() => setConfirmedDateKey(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
