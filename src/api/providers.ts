import { categories } from '@/data/mockData';
import type { PricingItem, Review } from '@/data/mockData';

/**
 * Live directory data for the Categories → category → provider flow, and
 * for Home's "Recommended pros" — both fetch through this file instead of
 * reading a local mock array.
 *
 * FixIt has no real backend, and there's no public API for "local home
 * service pros" to integrate against — this uses randomuser.me, a free,
 * no-key, HTTPS API purpose-built for exactly this kind of placeholder
 * person data: real-looking headshots and realistic names/location fields,
 * instead of JSONPlaceholder's /users (which reads as obviously fake test
 * data — made-up company names, nonsense "catchphrases" — for a pro
 * directory).
 *
 * `seed` pins the API to always return the same batch in the same order,
 * so the directory doesn't reshuffle on every reload, and `results=30`
 * splits evenly across FixIt's 6 trade categories (see categoryForIndex).
 */
const API_URL = 'https://randomuser.me/api/?results=30&seed=fixit-pros';

/** The exact shape randomuser.me returns for one user (only the fields FixIt uses). */
type RandomUser = {
  login: { uuid: string };
  name: { title: string; first: string; last: string };
  dob: { age: number };
  location: { city: string; country: string };
  picture: { large: string; medium: string };
};

export type ApiProvider = {
  id: string;
  name: string;
  role: string;
  categoryId: string;
  about: string;
  rating: number;
  imageUrl: string;
  pricing: PricingItem[];
  reviews: Review[];
};

/** FixIt's own trade names for the categories randomuser.me obviously has no concept of. */
const ROLE_LABELS: Record<string, string> = {
  plumbing: 'Plumber',
  electrical: 'Electrician',
  cleaning: 'Cleaner',
  painting: 'Painter',
  carpentry: 'Carpenter',
  gardening: 'Gardener',
};

/**
 * FixIt's own flat-rate menu per trade — randomuser.me has no pricing
 * concept at all, so this is hand-authored the same way the original mock
 * data's pricing was (not from any real backend either).
 */
const PRICING_BY_ROLE: Record<string, PricingItem[]> = {
  plumbing: [
    { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $50' },
    { id: 'p2', title: 'Hourly rate', subtitle: '$80 / hr' },
  ],
  electrical: [
    { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $60' },
    { id: 'p2', title: 'Hourly rate', subtitle: '$90 / hr' },
  ],
  cleaning: [
    { id: 'p1', title: 'Standard clean', subtitle: 'from $70' },
    { id: 'p2', title: 'Deep clean', subtitle: 'from $120' },
  ],
  painting: [
    { id: 'p1', title: 'Average room', subtitle: 'from $250' },
    { id: 'p2', title: 'Hourly rate', subtitle: '$45 / hr' },
  ],
  carpentry: [
    { id: 'p1', title: 'Diagnostic visit', subtitle: 'from $55' },
    { id: 'p2', title: 'Hourly rate', subtitle: '$75 / hr' },
  ],
  gardening: [
    { id: 'p1', title: 'Standard visit', subtitle: 'from $45' },
    { id: 'p2', title: 'Hourly rate', subtitle: '$40 / hr' },
  ],
};

/**
 * Two review comments per trade, also FixIt's own — randomuser.me has no
 * review data, so each provider "borrows" two other people from the same
 * fetched batch as reviewers (their real name/photo, see toProvider), paired
 * with one of these category-appropriate comments.
 */
const REVIEW_COMMENTS: Record<string, [string, string]> = {
  plumbing: [
    'Fixed the issue fast and explained everything clearly.',
    'Reliable and fairly priced — would call again.',
  ],
  electrical: [
    'Rewired everything safely and explained the work clearly.',
    'On time and very tidy — highly recommend.',
  ],
  cleaning: ['Place looked brand new afterward.', 'Thorough and reliable every time.'],
  painting: [
    'Clean lines and finished ahead of schedule.',
    'Great color advice and a spotless finish.',
  ],
  carpentry: [
    'Beautiful custom work, very precise joinery.',
    "Solved a tricky fix other pros couldn't.",
  ],
  gardening: [
    'Garden looks fantastic, very knowledgeable about plants.',
    'Tidy, punctual, and great with seasonal upkeep.',
  ],
};

/**
 * randomuser.me has no category field (and no "job" field at all) — each
 * fetched person is assigned one of FixIt's 6 categories by their position
 * in the (seeded, so stable) results array, round-robin. This is what
 * actually makes CategoryDetailsScreen's filter real instead of cosmetic.
 */
function categoryForIndex(index: number): (typeof categories)[number] {
  return categories[index % categories.length];
}

/**
 * randomuser.me has no rating field — this derives a stable 4.3-5.0 value
 * from the person's own uuid (the same input always produces the same
 * output), instead of a random number that would change on every fetch.
 */
function ratingFor(uuid: string): number {
  let hash = 0;
  for (const char of uuid) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  return Math.round((4.3 + (hash / 1000) * 0.7) * 10) / 10;
}

function toReview(user: RandomUser, id: string, comment: string): Review {
  return {
    id,
    name: `${user.name.first} ${user.name.last}`,
    comment,
    rating: ratingFor(user.login.uuid),
    imageUrl: user.picture.medium,
  };
}

function toProvider(users: RandomUser[], index: number): ApiProvider {
  const user = users[index];
  const category = categoryForIndex(index);
  const role = ROLE_LABELS[category.id];
  const comments = REVIEW_COMMENTS[category.id];

  // Two other people from the same batch, standing in as this provider's
  // reviewers — fixed offsets so they're stable across reloads and never
  // the provider's own record.
  const reviewerA = users[(index + 7) % users.length];
  const reviewerB = users[(index + 13) % users.length];

  return {
    id: user.login.uuid,
    name: `${user.name.first} ${user.name.last}`,
    role,
    categoryId: category.id,
    // randomuser.me has no bio field — this is built from its real age/city,
    // not fabricated text pretending to be an API-provided description.
    about: `${role} based in ${user.location.city}, ${user.location.country}. ${user.dob.age} years old.`,
    rating: ratingFor(user.login.uuid),
    // Real placeholder headshots from randomuser.me's own photo set — the
    // same images this API always returns for demo/testing use, not
    // people connected to this app.
    imageUrl: user.picture.large,
    pricing: PRICING_BY_ROLE[category.id],
    reviews: [
      toReview(reviewerA, `${user.login.uuid}-r1`, comments[0]),
      toReview(reviewerB, `${user.login.uuid}-r2`, comments[1]),
    ],
  };
}

/**
 * Shared GET helper: turns a DNS/connection failure (fetch itself throwing)
 * and a non-2xx HTTP response into the same kind of user-facing Error,
 * instead of letting either a raw TypeError or a bare status code reach the
 * screen's error Text.
 */
async function getProviders(): Promise<ApiProvider[]> {
  let response: Response;
  try {
    response = await fetch(API_URL);
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`);
  }
  const body: { results: RandomUser[] } = await response.json();
  return body.results.map((_, index) => toProvider(body.results, index));
}

/** GET the full provider directory — Home's "Recommended pros". */
export async function fetchProviders(): Promise<ApiProvider[]> {
  return getProviders();
}

/** GET the full provider directory, then filter to one category client-side. */
export async function fetchProvidersByCategory(categoryId: string): Promise<ApiProvider[]> {
  const providers = await getProviders();
  return providers.filter((provider) => provider.categoryId === categoryId);
}

/**
 * randomuser.me is a generator, not a database — it has no per-record GET
 * endpoint, so "fetching one provider by id" re-issues the same seeded
 * request (stable results, see API_URL) and finds that one record client
 * side. Still a real, independent network round trip with its own
 * loading/error state, just not a true `/providers/:id` endpoint.
 */
export async function fetchProviderById(id: string): Promise<ApiProvider> {
  const providers = await getProviders();
  const provider = providers.find((candidate) => candidate.id === id);
  if (!provider) {
    throw new Error(`No provider matches id "${id}".`);
  }
  return provider;
}
