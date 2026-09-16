/**
 * Live directory data for the Categories → category → provider flow.
 *
 * FixIt has no real backend, and there's no public API for "local home
 * service pros" to integrate against — so, per the assignment's own
 * fallback, this uses JSONPlaceholder's /users endpoint as stand-in
 * provider records (JSONPlaceholder has no category field at all, so
 * CategoryDetailsScreen shows the same directory for every category;
 * see the comment there).
 */
const API_URL = 'https://jsonplaceholder.typicode.com/users';

export type ApiProvider = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
};

/** DiceBear generates a synthetic illustrated avatar per seed — no real people, no API key. */
export const avatarFor = (seed: number | string) =>
  `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&size=128`;

/**
 * Shared GET helper: turns a DNS/connection failure (fetch itself throwing)
 * and a non-2xx HTTP response into the same kind of user-facing Error,
 * instead of letting either a raw TypeError or a bare status code reach the
 * screen's error Text.
 */
async function get<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`);
  }
  return response.json();
}

/** GET the full provider directory. */
export function fetchProviders(): Promise<ApiProvider[]> {
  return get<ApiProvider[]>(API_URL);
}

/** GET a single provider by id, for the detail screen reached from the list. */
export function fetchProviderById(id: number): Promise<ApiProvider> {
  return get<ApiProvider>(`${API_URL}/${id}`);
}
