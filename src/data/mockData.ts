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

export type Pro = {
  id: string;
  name: string;
  role: string;
  rating: number;
  imageUrl?: string;
  /** Matches a Category id, so Home's category tags can filter this list. */
  categoryId?: string;
  about: string;
  pricing: PricingItem[];
  reviews: Review[];
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
    about:
      '12 years of experience in plumbing repairs. I specialize in emergency leaks and pipe/fixture replacement.',
    pricing: [
      { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $50' },
      { id: 'p2', title: 'Hourly rate', subtitle: '$80 / hr' },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Julia K.',
        comment: 'Fixed the issue super fast, highly recommend!',
        rating: 5,
        imageUrl: avatar('Julia'),
      },
      {
        id: 'r2',
        name: 'Piotr S.',
        comment: 'Solid work, fair price.',
        rating: 4.5,
        imageUrl: avatar('Piotr'),
      },
    ],
  },
  {
    id: '2',
    name: 'Anna Kowalska',
    role: 'Electrician',
    rating: 4.8,
    imageUrl: avatar('Anna'),
    categoryId: 'electrical',
    about:
      '8 years rewiring and troubleshooting home electrics. Licensed for full panel upgrades and smart-home installs.',
    pricing: [
      { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $60' },
      { id: 'p2', title: 'Hourly rate', subtitle: '$90 / hr' },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Marta W.',
        comment: 'Rewired our kitchen safely and explained everything clearly.',
        rating: 5,
        imageUrl: avatar('Marta'),
      },
      {
        id: 'r2',
        name: 'Kuba L.',
        comment: 'On time and very tidy work.',
        rating: 4.6,
        imageUrl: avatar('Kuba'),
      },
    ],
  },
  {
    id: '3',
    name: 'Tomasz Wiśniewski',
    role: 'Cleaner',
    rating: 4.7,
    imageUrl: avatar('Tomasz'),
    categoryId: 'cleaning',
    about:
      '5 years doing deep cleans for homes and small offices. Brings all supplies, pet-friendly products on request.',
    pricing: [
      { id: 'p1', title: 'Standard clean', subtitle: 'from $70' },
      { id: 'p2', title: 'Deep clean', subtitle: 'from $120' },
    ],
    reviews: [
      {
        id: 'r1',
        name: 'Ola P.',
        comment: 'Apartment looked brand new afterward.',
        rating: 4.8,
        imageUrl: avatar('Ola'),
      },
      {
        id: 'r2',
        name: 'Dawid R.',
        comment: 'Reliable and thorough every time.',
        rating: 4.6,
        imageUrl: avatar('Dawid'),
      },
    ],
  },
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
