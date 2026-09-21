import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { todayDateKey } from '@/data/mockData';
import { radii, spacing, typography } from '@/theme';

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type MonthCalendarProps = {
  selectedDateKey?: string | null;
  onSelectDateKey: (dateKey: string | null) => void;
  /** Set of dateKeys ('YYYY-MM-DD') that have bookings — rendered with a dot indicator */
  markedDateKeys?: Set<string>;
};

function formatToDateKey(year: number, monthZeroIndexed: number, day: number): string {
  const m = String(monthZeroIndexed + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function MonthCalendar({
  selectedDateKey,
  onSelectDateKey,
  markedDateKeys,
}: MonthCalendarProps) {
  const { colors: themeColors } = useTheme();
  const today = todayDateKey();

  // The month currently in view (defaults to today's month)
  const [viewDate, setViewDate] = useState(() => new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const resetToToday = () => {
    setViewDate(new Date());
  };

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === currentYear && now.getMonth() === currentMonth;
  }, [currentYear, currentMonth]);

  // Calendar grid computation
  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentYear, currentMonth],
  );

  // Monday = 0, Sunday = 6
  const leadingBlanks = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return (firstDay + 6) % 7;
  }, [currentYear, currentMonth]);

  const daysInPrevMonth = useMemo(
    () => new Date(currentYear, currentMonth, 0).getDate(),
    [currentYear, currentMonth],
  );

  const prevMonthDate = useMemo(
    () => new Date(currentYear, currentMonth - 1, 1),
    [currentYear, currentMonth],
  );
  const nextMonthDate = useMemo(
    () => new Date(currentYear, currentMonth + 1, 1),
    [currentYear, currentMonth],
  );

  const monthGrid = useMemo(() => {
    const cells: {
      day: number;
      dateKey: string;
      isOtherMonth: boolean;
      targetMonthDate: Date;
    }[] = [];

    // Leading days from previous month
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    for (let i = 0; i < leadingBlanks; i++) {
      const day = daysInPrevMonth - leadingBlanks + 1 + i;
      cells.push({
        day,
        dateKey: formatToDateKey(prevYear, prevMonth, day),
        isOtherMonth: true,
        targetMonthDate: prevMonthDate,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        dateKey: formatToDateKey(currentYear, currentMonth, d),
        isOtherMonth: false,
        targetMonthDate: viewDate,
      });
    }

    // Trailing days from next month to complete the row
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth();
    const trailingCount = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= trailingCount; d++) {
      cells.push({
        day: d,
        dateKey: formatToDateKey(nextYear, nextMonth, d),
        isOtherMonth: true,
        targetMonthDate: nextMonthDate,
      });
    }

    return cells;
  }, [
    leadingBlanks,
    daysInPrevMonth,
    daysInMonth,
    currentYear,
    currentMonth,
    prevMonthDate,
    nextMonthDate,
    viewDate,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
      {/* Month header & navigation */}
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={[typography.sectionTitle, { color: themeColors.textPrimary }]}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>
          {!isCurrentMonth ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to this month"
              onPress={resetToToday}
              style={[styles.todayChip, { backgroundColor: themeColors.surfaceMedium }]}
            >
              <Text style={[typography.actionS, { color: themeColors.primary }]}>Today</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.navButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            hitSlop={8}
            onPress={prevMonth}
            style={({ pressed }) => [
              styles.navButton,
              { backgroundColor: themeColors.surfaceMedium },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={themeColors.textPrimary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            hitSlop={8}
            onPress={nextMonth}
            style={({ pressed }) => [
              styles.navButton,
              { backgroundColor: themeColors.surfaceMedium },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="chevron-forward" size={18} color={themeColors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.cell}>
            <Text style={[typography.captionM, { color: themeColors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.grid}>
        {monthGrid.map((cell) => {
          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === today;
          const hasBookings = Boolean(markedDateKeys?.has(cell.dateKey));
          const isOtherMonth = cell.isOtherMonth;

          return (
            <Pressable
              key={cell.dateKey}
              accessibilityRole="button"
              accessibilityLabel={`${cell.day} ${MONTH_NAMES[currentMonth]}${
                hasBookings ? ', booked pro' : ''
              }`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                if (isOtherMonth) {
                  setViewDate(cell.targetMonthDate);
                }
                if (isSelected) {
                  onSelectDateKey(null);
                } else {
                  onSelectDateKey(cell.dateKey);
                }
              }}
              style={styles.cell}
            >
              <View
                style={[
                  styles.dayCircle,
                  isSelected && { backgroundColor: themeColors.primary },
                  isToday && !isSelected && {
                    borderColor: themeColors.primary,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodyM,
                    {
                      color: isSelected
                        ? themeColors.white
                        : isToday
                          ? themeColors.primary
                          : isOtherMonth
                            ? themeColors.textPlaceholder
                            : themeColors.textPrimary,
                      fontWeight: isToday || isSelected ? '600' : '400',
                      opacity: isOtherMonth && !isSelected ? 0.6 : 1,
                    },
                  ]}
                >
                  {cell.day}
                </Text>

                {/* Dot indicator if pro is booked */}
                {hasBookings ? (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected ? themeColors.white : themeColors.primary,
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xxs,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todayChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxs,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 1,
  },
});
