import type { Category } from '@/components/CategoryList';

export type PricingItem = {
  id: string;
  title: string;
  subtitle: string;
};

export type Review = {
  id: string;
  name: string;
  comment: string;
  rating: number;
  imageUrl?: string;
};

export const categories: Category[] = [
  { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
  { id: 'electrical', label: 'Electrical', icon: 'electrical' },
  { id: 'cleaning', label: 'Cleaning', icon: 'cleaning' },
  { id: 'painting', label: 'Painting', icon: 'painting' },
  { id: 'carpentry', label: 'Carpentry', icon: 'carpentry' },
  { id: 'gardening', label: 'Gardening', icon: 'gardening' },
];

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Local YYYY-MM-DD — `toISOString()` shifts to UTC first, which can land on the wrong day. */
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type WeekDay = { weekDay: string; date: number; dateKey: string };

/** Monday–Sunday of the week `offsetWeeks` away from this one (0 = this week, -1 = last week, 2 = two weeks out). */
export function weekAt(offsetWeeks: number): WeekDay[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offsetWeeks * 7);

  return WEEKDAY_LABELS.map((weekDay, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { weekDay, date: date.getDate(), dateKey: toDateKey(date) };
  });
}

export function todayDateKey(): string {
  return toDateKey(new Date());
}

/** "We 17" from a dateKey — matches the Availability picker's own day-label format. */
export function formatBookingDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${WEEKDAY_LABELS[(date.getDay() + 6) % 7]} ${date.getDate()}`;
}

/** The dateKey `days` after `dateKey` — used to move a booking to a different day. */
export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}
