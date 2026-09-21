import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/routers';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { Button } from '@/components/Button';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { MonthCalendar } from '@/components/MonthCalendar';
import { useTheme } from '@/context/ThemeContext';
import { formatBookingDate, todayDateKey } from '@/data/mockData';
import { navigateToSignIn } from '@/navigation/navigationRef';
import { SCREENS } from '@/navigation/screens';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import type { Booking } from '@/store/bookingsSlice';
import {
  MAX_BOOKINGS_PER_DAY,
  countBookingsOnDate,
  fetchBookings,
  removeBooking,
  updateBookingDate,
} from '@/store/bookingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radii, shadows, spacing, typography } from '@/theme';

/** A booking row's edit icon was tapped — layout provides window coordinates for anchored dropdown positioning. */
type MenuTarget = { booking: Booking; x: number; y: number; width: number; height: number };

type BookingRowProps = {
  booking: Booking;
  isMenuOpen: boolean;
  onOpenMenu: (
    booking: Booking,
    layout: { x: number; y: number; width: number; height: number },
  ) => void;
  onPressRow: (booking: Booking) => void;
};

/**
 * One booking tile. Tapping the tile opens that pro's profile in view-only mode
 * (with Message CTA); tapping the edit pencil opens the dropdown ("Change day", "Remove").
 */
function BookingRow({ booking, isMenuOpen, onOpenMenu, onPressRow }: BookingRowProps) {
  const { colors: themeColors } = useTheme();
  const rowRef = useRef<View>(null);

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
    rowRef.current?.measureInWindow((x, y, width, height) => {
      onOpenMenu(booking, { x, y, width, height });
    });
  };

  return (
    <View ref={rowRef} style={[styles.rowContainer, { backgroundColor: themeColors.surface }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${booking.name}'s profile`}
        onPress={() => onPressRow(booking)}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.8 }]}
      >
        <Avatar imageUrl={booking.imageUrl} />
        <View style={styles.info}>
          <Text style={[typography.bodyM, { color: themeColors.textPrimary }]}>{booking.name}</Text>
          <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
            {booking.role} · {formatBookingDate(booking.dateKey)}
          </Text>
        </View>
      </Pressable>

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

/**
 * Overhauled Bookings Screen:
 * - Full-month calendar with month switcher and point/dot indicator on booked days.
 * - Nearest 3 upcoming bookings below the calendar by default.
 * - Selecting a day with bookings displays those bookings instead of upcoming.
 * - Tapping a booking card opens that pro's profile with "Message" CTA (booking disabled).
 * - Entire screen content scrolls smoothly inside a ScrollView.
 */
export function BookingsScreen() {
  const navigation = useNavigation<any>();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const { colors: themeColors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const isAuthenticated = useAppSelector((state) => state.auth.status === 'authenticated');
  const bookingsState = useAppSelector((state) => state.bookings);
  const bookings = bookingsState.items;
  const dispatch = useAppDispatch();

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const menuProgress = useSharedValue(0);
  useEffect(() => {
    menuProgress.value = withTiming(menuTarget ? 1 : 0, { duration: 120 });
  }, [menuTarget, menuProgress]);
  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuProgress.value,
    transform: [{ translateY: (1 - menuProgress.value) * -4 }],
  }));

  // Marked dateKeys for calendar dots
  const markedDateKeys = useMemo(
    () => new Set(bookings.map((b) => b.dateKey)),
    [bookings],
  );

  // Nearest 3 upcoming bookings (dateKey >= today)
  const today = todayDateKey();
  const upcomingBookings = useMemo(() => {
    const future = bookings
      .filter((b) => b.dateKey >= today)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(0, 3);
    if (future.length === 0 && bookings.length > 0) {
      return bookings
        .slice()
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        .slice(0, 3);
    }
    return future;
  }, [bookings, today]);

  // Bookings on the tapped calendar date
  const bookingsOnSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return bookings.filter((b) => b.dateKey === selectedDateKey);
  }, [bookings, selectedDateKey]);

  const hasSelectedDayBookings = selectedDateKey !== null && bookingsOnSelectedDate.length > 0;
  const displayedBookings = hasSelectedDayBookings ? bookingsOnSelectedDate : upcomingBookings;

  const confirmRemove = (booking: Booking) => {
    Alert.alert('Remove booking?', `${booking.name} · ${formatBookingDate(booking.dateKey)}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(removeBooking(booking.id)).unwrap();
          } catch (err) {
            Alert.alert(
              'Could not remove booking',
              err instanceof Error ? err.message : 'Please try again.',
            );
          }
        },
      },
    ]);
  };

  const isDateDisabledFor = (booking: Booking) => (dateKey: string) =>
    countBookingsOnDate(
      bookings.filter((other) => other.id !== booking.id),
      booking.providerId,
      dateKey,
    ) >= MAX_BOOKINGS_PER_DAY;

  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <Ionicons name="calendar-outline" size={40} color={themeColors.textPlaceholder} />
          <Text style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}>
            Sign in to see your bookings.
          </Text>
          <Button title="Sign in" fullWidth={false} onPress={navigateToSignIn} />
        </View>
        <Header
          title="Bookings"
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      {bookingsState.status === 'loading' && bookings.length === 0 ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : bookingsState.status === 'error' ? (
        <View style={[styles.centered, { paddingTop: headerClearance }]}>
          <Text style={[typography.bodyM, { color: themeColors.textMuted, textAlign: 'center' }]}>
            {bookingsState.error}
          </Text>
          <Button title="Try again" onPress={() => dispatch(fetchBookings())} fullWidth={false} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerClearance, paddingBottom: bottomClearance + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Monthly Calendar with month switcher & dots for booked days */}
          <MonthCalendar
            selectedDateKey={selectedDateKey}
            onSelectDateKey={setSelectedDateKey}
            markedDateKeys={markedDateKeys}
          />

          {/* Section title: upcoming vs selected day */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>
                {hasSelectedDayBookings
                  ? `Bookings · ${formatBookingDate(selectedDateKey!)}`
                  : 'Upcoming bookings'}
              </Text>
              {selectedDateKey && !hasSelectedDayBookings ? (
                <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>
                  No bookings on {formatBookingDate(selectedDateKey)} · showing upcoming
                </Text>
              ) : null}
            </View>

            {hasSelectedDayBookings ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Show upcoming bookings"
                onPress={() => setSelectedDateKey(null)}
                style={[styles.clearChip, { backgroundColor: themeColors.surfaceMedium }]}
              >
                <Text style={[typography.actionS, { color: themeColors.primary }]}>
                  Show upcoming
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Bookings list */}
          {displayedBookings.length === 0 ? (
            <Text style={[typography.bodyM, styles.empty, { color: themeColors.textMuted }]}>
              No bookings yet — book a pro from their profile.
            </Text>
          ) : (
            <View style={styles.list}>
              {displayedBookings.map((item) => (
                <BookingRow
                  key={item.id}
                  booking={item}
                  isMenuOpen={menuTarget?.booking.id === item.id}
                  onOpenMenu={(booking, layout) => setMenuTarget({ booking, ...layout })}
                  onPressRow={(booking) =>
                    navigation.navigate(SCREENS.PRO_DETAILS, {
                      proId: booking.providerId,
                      hideBooking: true,
                    })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Header
        title="Bookings"
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />

      {/* Reuses Pro profile's own Availability picker to change booking day */}
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
                  onSelectDateKey={async (dateKey) => {
                    const id = editingBooking.id;
                    setEditingBooking(null);
                    try {
                      await dispatch(updateBookingDate({ id, dateKey })).unwrap();
                    } catch (err) {
                      Alert.alert(
                        'Could not change day',
                        err instanceof Error ? err.message : 'Please try again.',
                      );
                    }
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

      {/* Anchored Dropdown Menu with window-clamping */}
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
                  top:
                    menuTarget.y + menuTarget.height + 95 > windowHeight - bottomClearance
                      ? Math.max(headerClearance, menuTarget.y - 92)
                      : menuTarget.y + menuTarget.height + 4,
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
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  clearChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
