import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/routers';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
import { radii, shadows, spacing, typography } from '@/theme';

/** A booking row's pencil icon was tapped — `y` (the touch's page position) anchors the dropdown near it. */
type MenuTarget = { booking: Booking; y: number };

/** Redux demo: every booking made from a Book appointment button lives in the `bookings` slice. */
export function BookingsScreen() {
  const navigation = useNavigation();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const bookings = useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const confirmRemove = (booking: Booking) => {
    Alert.alert('Remove booking?', `${booking.name} · ${formatBookingDate(booking.dateKey)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => dispatch(removeBooking(booking.id)) },
    ]);
  };

  // A day counts against the same pro's limit for every OTHER booking of
  // theirs, but not for the one being edited — otherwise its own current day
  // would show as full, and other pros' bookings never count against it.
  const isDateDisabledFor = (booking: Booking) => (dateKey: string) =>
    countBookingsOnDate(
      bookings.filter((other) => other.id !== booking.id),
      booking.providerId,
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit booking"
              hitSlop={8}
              style={[styles.editButton, { backgroundColor: themeColors.surfaceMedium }]}
              onPress={(event) => setMenuTarget({ booking: item, y: event.nativeEvent.pageY })}
            >
              <Ionicons name="pencil" size={16} color={themeColors.textPrimary} />
            </Pressable>
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

      {/* A dropdown, not two buttons per row — "Change day" and "Remove" sat
          behind one pencil icon so a stray tap can't fire either directly. */}
      <Modal
        visible={menuTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuTarget(null)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuTarget(null)}>
          {menuTarget ? (
            <View
              style={[
                styles.menu,
                {
                  top: menuTarget.y - spacing.md,
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: themeColors.surfaceMedium },
                ]}
                onPress={() => {
                  setEditingBooking(menuTarget.booking);
                  setMenuTarget(null);
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={themeColors.textPrimary} />
                <Text style={[typography.bodyM, { color: themeColors.textPrimary }]}>
                  Change day
                </Text>
              </Pressable>
              <View style={[styles.menuDivider, { backgroundColor: themeColors.borderLight }]} />
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: themeColors.surfaceMedium },
                ]}
                onPress={() => {
                  confirmRemove(menuTarget.booking);
                  setMenuTarget(null);
                }}
              >
                <Ionicons name="trash-outline" size={18} color={themeColors.urgent} />
                <Text style={[typography.bodyM, { color: themeColors.urgent }]}>Remove</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
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
  editButton: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: spacing.md,
    minWidth: 170,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
