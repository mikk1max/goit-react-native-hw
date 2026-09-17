import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/routers';
import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { formatBookingDate } from '@/data/mockData';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import type { Booking } from '@/store/bookingsSlice';
import {
  MAX_BOOKINGS_PER_DAY,
  countBookingsOnDate,
  removeBooking,
  updateBookingDate,
} from '@/store/bookingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, spacing, typography } from '@/theme';

/** Redux demo: every booking made from a Book appointment button lives in the `bookings` slice. */
export function BookingsScreen() {
  const navigation = useNavigation();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const bookings = useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const confirmRemove = (booking: Booking) => {
    Alert.alert('Remove booking?', `${booking.name} · ${formatBookingDate(booking.dateKey)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => dispatch(removeBooking(booking.id)) },
    ]);
  };

  // A day counts against the limit for every OTHER booking, but not for the
  // one being edited — otherwise its own current day would show as full.
  const isDateDisabledFor = (booking: Booking) => (dateKey: string) =>
    countBookingsOnDate(
      bookings.filter((other) => other.id !== booking.id),
      dateKey,
    ) >= MAX_BOOKINGS_PER_DAY;

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <FlatList
        contentContainerStyle={[
          styles.list,
          { paddingTop: headerClearance, paddingBottom: bottomClearance + spacing.xl },
        ]}
        data={bookings}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[typography.bodyM, styles.empty, { color: themeColors.textMuted }]}>
            No bookings yet — book a pro from their profile.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: themeColors.surface }]}>
            <Avatar imageUrl={item.imageUrl} />
            <View style={styles.info}>
              <Text style={[typography.bodyM, { color: themeColors.textPrimary }]}>
                {item.name}
              </Text>
              <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
                {item.role} · {formatBookingDate(item.dateKey)}
              </Text>
            </View>
            <Button title="Change day" fullWidth={false} onPress={() => setEditingBooking(item)} />
            <Button
              title="Remove"
              fullWidth={false}
              tintColor={themeColors.urgent}
              onPress={() => confirmRemove(item)}
            />
          </View>
        )}
      />
      <Header
        title="Bookings"
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />

      {/* Reuses Pro profile's own Availability picker, so picking a new day
          works the exact same way it did when the booking was first made. */}
      <Modal
        visible={editingBooking !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingBooking(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: themeColors.white }]}>
            <Text style={[typography.h4, styles.cardTitle, { color: themeColors.textPrimary }]}>
              Change day
            </Text>
            {editingBooking ? (
              <ScrollView style={styles.calendarScroll}>
                <AvailabilityCalendar
                  layout="stacked"
                  selectedDateKey={editingBooking.dateKey}
                  isDateDisabled={isDateDisabledFor(editingBooking)}
                  onSelectDateKey={(dateKey) => {
                    dispatch(updateBookingDate({ id: editingBooking.id, dateKey }));
                    setEditingBooking(null);
                  }}
                />
              </ScrollView>
            ) : null}
            <View style={styles.cancelButton}>
              <Button title="Cancel" variant="secondary" onPress={() => setEditingBooking(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 32, 36, 0.4)',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    textAlign: 'center',
  },
  calendarScroll: {
    flexShrink: 1,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
});
