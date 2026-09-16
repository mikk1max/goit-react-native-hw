import { categories } from '@/data/mockData';

/**
 * Live directory data for the Categories → category → provider flow.
 *
 * FixIt has no real backend, and there's no public API for "local home
 * service pros" to integrate against — this uses randomuser.me, a free,
 * no-key, HTTPS API purpose-built for exactly this kind of placeholder
 * person data: real-looking headshots and realistic names/contact/location
 * fields, instead of JSONPlaceholder's /users (which reads as obviously
 * fake test data — made-up company names, nonsense "catchphrases" — for a
 * pro directory).
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
  email: string;
  phone: string;
  cell: string;
  dob: { age: number };
  location: {
    street: { number: number; name: string };
    city: string;
    country: string;
    postcode: string | number;
  };
  picture: { large: string; medium: string; thumbnail: string };
};

export type ApiProvider = {
  id: string;
  name: string;
  role: string;
  categoryId: string;
  about: string;
  email: string;
  phone: string;
  cell: string;
  address: string;
  imageUrl: string;
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
 * randomuser.me has no category field (and no "job" field at all) — each
 * fetched person is assigned one of FixIt's 6 categories by their position
 * in the (seeded, so stable) results array, round-robin. This is what
 * actually makes CategoryDetailsScreen's filter real instead of cosmetic.
 */
function categoryForIndex(index: number): (typeof categories)[number] {
  return categories[index % categories.length];
}

function toProvider(user: RandomUser, index: number): ApiProvider {
  const category = categoryForIndex(index);
  return {
    id: user.login.uuid,
    name: `${user.name.first} ${user.name.last}`,
    role: ROLE_LABELS[category.id],
    categoryId: category.id,
    // randomuser.me has no bio field — this is built from its real age/city,
    // not fabricated text pretending to be an API-provided description.
    about: `${ROLE_LABELS[category.id]} based in ${user.location.city}, ${user.location.country}. ${user.dob.age} years old.`,
    email: user.email,
    phone: user.phone,
    cell: user.cell,
    address: `${user.location.street.number} ${user.location.street.name}, ${user.location.city} ${user.location.postcode}`,
    // Real placeholder headshots from randomuser.me's own photo set — the
    // same images this API always returns for demo/testing use, not
    // people connected to this app.
    imageUrl: user.picture.large,
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
  return body.results.map(toProvider);
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
