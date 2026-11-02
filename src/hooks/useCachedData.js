import { useState, useEffect, useCallback, useRef } from 'react';
import apiCache from '../utils/apiCache';

/**
 * Custom React Hook for Instant Cached Data with Stale-While-Revalidate (SWR)
 * - Returns cached data instantly (0ms render time)
 * - Revalidates in the background if data is stale
 * - Automatically updates component state when cache is updated or invalidated
 * - Eliminates duplicate database and network hits
 *
 * @param {string|null} key - Cache key (e.g., 'vehicles_list', 'owner_dashboard')
 * @param {Function} fetcher - Async data fetching function
 * @param {Object} options - Configuration options (ttl, tags, enabled, initialData, etc.)
 */
export const useCachedData = (key, fetcher, options = {}) => {
  const {
    ttl,
    tags = [],
    enabled = true,
    initialData = null,
    revalidateOnMount = true,
    revalidateOnFocus = false,
    allowStale = true,
    onSuccess,
    onError,
  } = options;

  // Check if initial cached entry exists
  const initialCached = key ? apiCache.get(key, { allowStale: true }) : null;

  const [data, setData] = useState(() => (initialCached ? initialCached.data : initialData));
  const [loading, setLoading] = useState(() => (initialCached ? false : enabled));
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(() => (initialCached ? initialCached.isStale : false));

  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const executeFetch = useCallback(
    async (bypassCache = false) => {
      if (!key || !enabled || typeof fetcherRef.current !== 'function') return;

      // If bypassing cache or no cached data, show loading state
      const existing = apiCache.get(key, { allowStale: true });
      if (!existing && !bypassCache) {
        setLoading(true);
      } else {
        setIsValidating(true);
      }

      setError(null);

      try {
        const result = await apiCache.fetchWithCache(key, () => fetcherRef.current(), {
          ttl,
          tags,
          bypassCache,
          allowStale,
        });

        if (isMountedRef.current) {
          setData(result);
          setIsStale(false);
          if (typeof onSuccess === 'function') {
            onSuccess(result);
          }
        }
        return result;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
          if (typeof onError === 'function') {
            onError(err);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsValidating(false);
        }
      }
    },
    [key, enabled, ttl, tags, allowStale, onSuccess, onError]
  );

  // Mount & Key Change Effect
  useEffect(() => {
    isMountedRef.current = true;

    if (!key || !enabled) {
      setLoading(false);
      return;
    }

    const cached = apiCache.get(key, { allowStale: true });
    if (cached) {
      setData(cached.data);
      setIsStale(cached.isStale);
      setLoading(false);

      // Background revalidation if stale or requested on mount
      if (cached.isStale || revalidateOnMount) {
        executeFetch(false);
      }
    } else {
      executeFetch(false);
    }

    // Subscribe to cache updates and invalidation events for this key
    const unsubscribe = apiCache.subscribe(key, ({ data: newData, isInvalidated }) => {
      if (!isMountedRef.current) return;
      if (isInvalidated) {
        // Cache entry was invalidated by a mutation, refetch fresh data
        executeFetch(true);
      } else if (newData !== undefined) {
        setData(newData);
        setIsStale(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [key, enabled, executeFetch, revalidateOnMount]);

  // Window Focus Revalidation
  useEffect(() => {
    if (!revalidateOnFocus || !enabled || !key) return;

    const handleFocus = () => {
      const cached = apiCache.get(key, { allowStale: false });
      if (!cached) {
        executeFetch(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [key, enabled, revalidateOnFocus, executeFetch]);

  // Direct state updater with cache sync
  const updateData = useCallback(
    (updater, shouldUpdateCache = true) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (shouldUpdateCache && key) {
          apiCache.set(key, next, { ttl, tags });
        }
        return next;
      });
    },
    [key, ttl, tags]
  );

  const refetch = useCallback(
    (bypassCache = true) => {
      return executeFetch(bypassCache);
    },
    [executeFetch]
  );

  return {
    data,
    loading,
    isValidating,
    error,
    isStale,
    refetch,
    setData: updateData,
  };
};

export default useCachedData;
