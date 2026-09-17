import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

export type WeeklyCalendarDay = {
  weekDay: string;
  date: number;
  /** Already at capacity (see MAX_BOOKINGS_PER_DAY) — shown dimmed and unpickable. */
  disabled?: boolean;
};

export type WeeklyCalendarProps = {
  days: WeeklyCalendarDay[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
};

/** Date-input row for picking an appointment day — "Availability" on Pro profile. */
export function WeeklyCalendar({ days, selectedIndex, onSelect }: WeeklyCalendarProps) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={`${day.weekDay}-${day.date}`}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: day.disabled }}
            disabled={day.disabled}
            onPress={() => onSelect?.(index)}
            style={[
              styles.day,
              selected && { backgroundColor: themeColors.primary },
              day.disabled && styles.dayDisabled,
            ]}
          >
            <Text
              style={[
                typography.captionM,
                { color: selected ? themeColors.primaryLight : themeColors.textPlaceholder },
              ]}
            >
              {day.weekDay}
            </Text>
            <Text
              style={[
                typography.bodyL,
                { color: selected ? themeColors.white : themeColors.textTertiary },
              ]}
            >
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
  dayDisabled: {
    opacity: 0.35,
  },
});
