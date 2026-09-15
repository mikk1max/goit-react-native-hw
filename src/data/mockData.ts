import type { Category } from '@/components/CategoryList';

export type Pro = {
  id: string;
  name: string;
  role: string;
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

/** DiceBear generates a synthetic illustrated avatar per seed — no real people, no API key. */
const avatar = (seed: string) => `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&size=128`;

export const recommendedPros: Pro[] = [
  { id: '1', name: 'Marek Nowak', role: 'Plumber', rating: 4.9, imageUrl: avatar('Marek') },
  { id: '2', name: 'Anna Kowalska', role: 'Electrician', rating: 4.8, imageUrl: avatar('Anna') },
  { id: '3', name: 'Tomasz Wiśniewski', role: 'Cleaner', rating: 4.7, imageUrl: avatar('Tomasz') },
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
