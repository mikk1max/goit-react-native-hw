import type { Category } from '@/components/CategoryList';

export type Pro = {
  id: string;
  name: string;
  role: string;
  rating: number;
  imageUrl?: string;
  /** Matches a Category id, so Home's category tags can filter this list. */
  categoryId?: string;
};

export const categories: Category[] = [
  { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
  { id: 'electrical', label: 'Electrical', icon: 'electrical' },
  { id: 'cleaning', label: 'Cleaning', icon: 'cleaning' },
  { id: 'painting', label: 'Painting', icon: 'painting' },
  { id: 'carpentry', label: 'Carpentry', icon: 'carpentry' },
  { id: 'gardening', label: 'Gardening', icon: 'gardening' },
];

/** DiceBear generates a synthetic illustrated avatar per seed — no real people, no API key. */
const avatar = (seed: string) => `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&size=128`;

export const recommendedPros: Pro[] = [
  {
    id: '1',
    name: 'Marek Nowak',
    role: 'Plumber',
    rating: 4.9,
    imageUrl: avatar('Marek'),
    categoryId: 'plumbing',
  },
  {
    id: '2',
    name: 'Anna Kowalska',
    role: 'Electrician',
    rating: 4.8,
    imageUrl: avatar('Anna'),
    categoryId: 'electrical',
  },
  {
    id: '3',
    name: 'Tomasz Wiśniewski',
    role: 'Cleaner',
    rating: 4.7,
    imageUrl: avatar('Tomasz'),
    categoryId: 'cleaning',
  },
];

export const reviews: Pro[] = [
  {
    id: 'r1',
    name: 'Julia K.',
    role: 'Fixed the issue super fast, highly recommend!',
    rating: 5,
    imageUrl: avatar('Julia'),
  },
  {
    id: 'r2',
    name: 'Piotr S.',
    role: 'Solid work, fair price.',
    rating: 4.5,
    imageUrl: avatar('Piotr'),
  },
];

export const pricingList = [
  { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $50' },
  { id: 'p2', title: 'Hourly rate', subtitle: '$80 / hr' },
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
