import type { Category } from '@/components/CategoryList';

export type Pro = {
  id: string;
  name: string;
  role: string;
  rating: number;
  imageUrl?: string;
};

export const categories: Category[] = [
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'painting', label: 'Painting' },
  { id: 'carpentry', label: 'Carpentry' },
  { id: 'gardening', label: 'Gardening' },
];

export const recommendedPros: Pro[] = [
  { id: '1', name: 'Marek Nowak', role: 'Plumber', rating: 4.9 },
  { id: '2', name: 'Anna Kowalska', role: 'Electrician', rating: 4.8 },
  { id: '3', name: 'Tomasz Wiśniewski', role: 'Cleaner', rating: 4.7 },
];

export const reviews: Pro[] = [
  { id: 'r1', name: 'Julia K.', role: 'Fixed the issue super fast, highly recommend!', rating: 5 },
  { id: 'r2', name: 'Piotr S.', role: 'Solid work, fair price.', rating: 4.5 },
];

export const pricingList = [
  { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $50' },
  { id: 'p2', title: 'Hourly rate', subtitle: '$80 / hr' },
];
