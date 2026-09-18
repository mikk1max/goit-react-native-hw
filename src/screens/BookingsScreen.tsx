import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/routers';
import { useEffect, useRef, useState } from 'react';
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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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

/** A booking row's edit icon was tapped — `y` is that row's own bottom edge, so the dropdown always opens flush under that exact tile. */
type MenuTarget = { booking: Booking; y: number };

type BookingRowProps = {
  booking: Booking;
  /** Whether THIS row's dropdown is the one currently open — drives the pencil/close icon morph. */
  isMenuOpen: boolean;
  onOpenMenu: (booking: Booking, y: number) => void;
};

/**
 * One booking tile. Its own component (not inlined in renderItem) because it
 * needs a ref to measure itself — the dropdown opens flush under THIS row's
 * bottom edge, not wherever inside the small edit button the finger landed.
 */
function BookingRow({ booking, isMenuOpen, onOpenMenu }: BookingRowProps) {
  const { colors: themeColors } = useTheme();
  const rowRef = useRef<View>(null);

  // Morphs the edit icon into a close icon while its dropdown is open — a
  // rotate + cross-fade between the two, so the icon itself hints "tap to
  // close this" instead of the icon just silently staying a pencil.
  const openProgress = useSharedValue(isMenuOpen ? 1 : 0);
  useEffect(() => {
    openProgress.value = withTiming(isMenuOpen ? 1 : 0, { duration: 180 });
  }, [isMenuOpen, openProgress]);
  const pencilStyle = useAnimatedStyle(() => ({
    opacity: 1 - openProgress.value,
    transform: [
      { rotate: `${openProgress.value * 90}deg` },
      { scale: 1 - openProgress.value * 0.4 },
    ],
  }));
  const closeStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
    transform: [
      { rotate: `${(1 - openProgress.value) * -90}deg` },
      { scale: 0.6 + openProgress.value * 0.4 },
    ],
  }));

  const openMenu = () => {
    rowRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
      onOpenMenu(booking, pageY + height);
    });
  };

  return (
    <View ref={rowRef} style={[styles.row, { backgroundColor: themeColors.surface }]}>
      <Avatar imageUrl={booking.imageUrl} />
      <View style={styles.info}>
        <Text style={[typography.bodyM, { color: themeColors.textPrimary }]}>{booking.name}</Text>
        <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
          {booking.role} · {formatBookingDate(booking.dateKey)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isMenuOpen ? 'Close booking menu' : 'Edit booking'}
        hitSlop={8}
        style={[styles.editButton, { backgroundColor: themeColors.surfaceMedium }]}
        onPress={openMenu}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.editIconLayer, pencilStyle]}>
          <Ionicons name="pencil" size={16} color={themeColors.textPrimary} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.editIconLayer, closeStyle]}>
          <Ionicons name="close" size={18} color={themeColors.textPrimary} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

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

  // Reanimated (useSharedValue + useAnimatedStyle) — deliberately understated:
  // just a quick fade with a couple of pixels of drop, no scale/bounce, so a
  // menu this small doesn't call more attention to itself than the row it
  // came from.
  const menuProgress = useSharedValue(0);
  useEffect(() => {
    menuProgress.value = withTiming(menuTarget ? 1 : 0, { duration: 120 });
  }, [menuTarget, menuProgress]);
  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuProgress.value,
    transform: [{ translateY: (1 - menuProgress.value) * -4 }],
  }));

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
          <BookingRow
            booking={item}
            isMenuOpen={menuTarget?.booking.id === item.id}
            onOpenMenu={(booking, y) => setMenuTarget({ booking, y })}
          />
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
            <Animated.View
              style={[
                styles.menu,
                {
                  top: menuTarget.y + spacing.xxs,
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
                menuAnimatedStyle,
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
            </Animated.View>
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
  editIconLayer: {
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
