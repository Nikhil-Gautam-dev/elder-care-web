import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

interface Options {
  intervalMs?: number;
  onUnauthorized: () => void;
}

/** Fetches on mount, then polls. A 401 signs the user out; other errors keep the last data. */
export function useLiveData<T>(fetcher: () => Promise<T>, { intervalMs, onUnauthorized }: Options) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    try {
      setData(await fetcherRef.current());
      setUpdatedAt(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [onUnauthorized]);

  useEffect(() => {
    reload();
    if (!intervalMs) return;
    const timer = setInterval(reload, intervalMs);
    return () => clearInterval(timer);
  }, [reload, intervalMs]);

  return { data, error, updatedAt, reload, loading: data === null && error === null };
}
