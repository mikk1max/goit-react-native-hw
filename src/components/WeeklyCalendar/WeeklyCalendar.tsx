import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export type WeeklyCalendarDay = {
  weekDay: string;
  date: number;
};

export type WeeklyCalendarProps = {
  days: WeeklyCalendarDay[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
};

/** Date-input row for picking an appointment day — "Availability" on Pro profile. */
export function WeeklyCalendar({ days, selectedIndex, onSelect }: WeeklyCalendarProps) {
  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={`${day.weekDay}-${day.date}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect?.(index)}
            style={[styles.day, selected && styles.daySelected]}
          >
            <Text style={[typography.captionM, selected ? styles.weekDaySelected : styles.weekDay]}>
              {day.weekDay}
            </Text>
            <Text style={[typography.bodyL, selected ? styles.dateSelected : styles.date]}>
              {day.date}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  weekDay: {
    color: colors.textPlaceholder,
  },
  weekDaySelected: {
    color: colors.primaryLight,
  },
  date: {
    color: colors.textTertiary,
  },
  dateSelected: {
    color: colors.white,
  },
});
