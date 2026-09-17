import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { todayDateKey, weekAt } from '@/data/mockData';
import { spacing, typography } from '@/theme';

import { WeeklyCalendar } from '../WeeklyCalendar';

const WEEKS_BACK = 1;
const WEEKS_FORWARD = 2;
// [-1, 0, 1, 2] — last week through 2 weeks out, one page per week.
const WEEK_OFFSETS = Array.from(
  { length: WEEKS_BACK + WEEKS_FORWARD + 1 },
  (_, index) => index - WEEKS_BACK,
);
// "This week" (offset 0) is always where today lives — the page the picker opens on.
const TODAY_PAGE = WEEK_OFFSETS.indexOf(0);
const WEEK_LABELS: Record<number, string> = {
  [-1]: 'Last week',
  0: 'This week',
  1: 'Next week',
  2: 'In 2 weeks',
};

export type AvailabilityCalendarProps = {
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  isDateDisabled: (dateKey: string) => boolean;
  /**
   * "paged" (default) swipes one week at a time, for the Pro profile's
   * inline picker. "stacked" lists every week at once with no scrolling —
   * BookingsScreen's modal has room to just show it all up front.
   */
  layout?: 'paged' | 'stacked';
};

/**
 * Availability picker — Pro profile's own calendar, and reused by
 * BookingsScreen's "Change day" so both pick a date the exact same way.
 * Last week through 2 weeks out; always opens on the week holding today,
 * and never lets you pick a day that's already passed.
 */
export function AvailabilityCalendar({
  selectedDateKey,
  onSelectDateKey,
  isDateDisabled,
  layout = 'paged',
}: AvailabilityCalendarProps) {
  const today = todayDateKey();
  const weeks = useMemo(
    () =>
      WEEK_OFFSETS.map((offset) =>
        weekAt(offset).map((day) => ({
          ...day,
          disabled: day.dateKey < today || isDateDisabled(day.dateKey),
        })),
      ),
    [today, isDateDisabled],
  );

  if (layout === 'stacked') {
    return (
      <StackedCalendar weeks={weeks} selectedDateKey={selectedDateKey} onSelect={onSelectDateKey} />
    );
  }

  return (
    <PagedCalendar weeks={weeks} selectedDateKey={selectedDateKey} onSelect={onSelectDateKey} />
  );
}

type Week = ReturnType<typeof weekAt>;
type CalendarProps = {
  weeks: Week[];
  selectedDateKey: string;
  onSelect: (dateKey: string) => void;
};

function PagedCalendar({ weeks, selectedDateKey, onSelect }: CalendarProps) {
  const { colors: themeColors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activePage, setActivePage] = useState(TODAY_PAGE);

  const onLayout = (event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
  };

  const hasScrolledToTodayRef = useRef(false);

  // Runs after `pageWidth` actually lands and the pages re-render at that
  // width — jumping straight from onLayout was too early: the ScrollView
  // still had its old (zero-width) pages, so the scroll silently no-opped.
  // Animated (not an instant jump) so it reads as a deliberate swipe to
  // "This week" instead of a jarring snap; the ref stops a later relayout
  // (e.g. rotation) from re-triggering it once the user has swiped away.
  useEffect(() => {
    if (pageWidth > 0 && !hasScrolledToTodayRef.current) {
      hasScrolledToTodayRef.current = true;
      scrollRef.current?.scrollTo({ x: pageWidth * TODAY_PAGE, animated: true });
    }
  }, [pageWidth]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth > 0) {
      setActivePage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
    }
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={onLayout}
        onMomentumScrollEnd={onScrollEnd}
      >
        {weeks.map((week, weekIndex) => (
          <View key={WEEK_OFFSETS[weekIndex]} style={{ width: pageWidth }}>
            <WeeklyCalendar
              days={week}
              selectedIndex={week.findIndex((day) => day.dateKey === selectedDateKey)}
              onSelect={(dayIndex) => onSelect(week[dayIndex].dateKey)}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {WEEK_OFFSETS.map((offset, index) => (
          <View
            key={offset}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === activePage ? themeColors.primary : themeColors.borderLight,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function StackedCalendar({ weeks, selectedDateKey, onSelect }: CalendarProps) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.stack}>
      {weeks.map((week, weekIndex) => (
        <View key={WEEK_OFFSETS[weekIndex]}>
          <Text style={[typography.captionM, { color: themeColors.textMuted }]}>
            {WEEK_LABELS[WEEK_OFFSETS[weekIndex]]}
          </Text>
          <WeeklyCalendar
            days={week}
            selectedIndex={week.findIndex((day) => day.dateKey === selectedDateKey)}
            onSelect={(dayIndex) => onSelect(week[dayIndex].dateKey)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stack: {
    gap: spacing.sm,
  },
});
