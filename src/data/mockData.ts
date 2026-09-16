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

/** This week (Monday–Sunday), for the Availability picker — real dates, not a static mock. */
export function currentWeek(): { weekDay: string; date: number }[] {
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return labels.map((weekDay, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { weekDay, date: date.getDate() };
  });
}
