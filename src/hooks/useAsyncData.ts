import { useCallback, useEffect, useState } from 'react';

export type AsyncData<T> = {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Shared fetch/loading/error/retry plumbing for screens that hit the
 * providers API. `fetcher` should be `useCallback`'d by the caller (its own
 * deps, e.g. an id from route params) so this only re-fetches when that
 * actually changes.
 *
 * No synchronous setState in the effect body — every state update happens
 * inside the promise callbacks, once the fetch actually settles. `retry()`
 * resets loading/error itself before calling `load()` again, since that
 * runs from a button's `onPress`, not an effect.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>): AsyncData<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetcher()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  return { data, loading, error, retry };
}
