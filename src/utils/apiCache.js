/**
 * Advanced Multi-Tier Frontend API Cache Architecture
 * - In-memory Map Store with TTL (Time-To-Live)
 * - Stale-While-Revalidate (SWR) support
 * - Request Coalescing / In-flight Promise Deduplication (prevents duplicate simultaneous network hits)
 * - Tag & URL Prefix-Based Cache Invalidation
 * - Cross-Component Reactive Event Emitter
 */

class ApiCacheManager {
  constructor() {
    this.cache = new Map();
    this.inFlightRequests = new Map();
    this.listeners = new Map();
    this.defaultTtl = 2 * 60 * 1000; // 2 minutes default TTL
    this.maxStaleTime = 10 * 60 * 1000; // Allow stale data up to 10 minutes for SWR
  }

  /**
   * Generates a stable cache key from URL and params
   */
  generateKey(url, params = {}) {
    if (!url) return '';
    const cleanUrl = String(url).trim();
    if (!params || Object.keys(params).length === 0) {
      return cleanUrl;
    }
    const sortedQuery = Object.keys(params)
      .sort()
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    return sortedQuery ? `${cleanUrl}?${sortedQuery}` : cleanUrl;
  }

  /**
   * Derives default tags from the cache key/URL
   */
  deriveTags(key, customTags = []) {
    const tags = new Set(customTags);
    const lower = key.toLowerCase();

    if (lower.includes('vehicle')) tags.add('vehicles');
    if (lower.includes('driver')) tags.add('drivers');
    if (lower.includes('booking') || lower.includes('trip')) {
      tags.add('bookings');
      tags.add('trips');
    }
    if (lower.includes('owner')) tags.add('owners');
    if (lower.includes('admin') || lower.includes('approval') || lower.includes('stats')) {
      tags.add('admin');
      tags.add('approvals');
    }
    if (lower.includes('profile') || lower.includes('auth') || lower.includes('/me')) tags.add('profile');
    if (lower.includes('plan')) tags.add('plans');
    if (lower.includes('notification')) tags.add('notifications');
    if (lower.includes('dashboard')) tags.add('dashboard');

    return Array.from(tags);
  }

  /**
   * Store data in cache with TTL and resource tags
   */
  set(key, data, options = {}) {
    if (!key || data === undefined) return;
    const ttl = typeof options.ttl === 'number' ? options.ttl : this.defaultTtl;
    const tags = this.deriveTags(key, options.tags || []);
    const timestamp = Date.now();

    const entry = {
      data,
      timestamp,
      expiresAt: timestamp + ttl,
      tags,
    };

    this.cache.set(key, entry);
    this.notifyListeners(key, data);
  }

  /**
   * Get cached data if available and fresh, or stale if allowed
   */
  get(key, options = {}) {
    if (!key || !this.cache.has(key)) return null;

    const entry = this.cache.get(key);
    const now = Date.now();
    const isExpired = now > entry.expiresAt;
    const isWithinStaleWindow = now < entry.expiresAt + this.maxStaleTime;

    if (!isExpired) {
      return {
        data: entry.data,
        isStale: false,
        timestamp: entry.timestamp,
      };
    }

    if (options.allowStale && isWithinStaleWindow) {
      return {
        data: entry.data,
        isStale: true,
        timestamp: entry.timestamp,
      };
    }

    // Completely expired
    if (!options.allowStale && isExpired) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Checks if a key exists and is fresh
   */
  has(key) {
    const cached = this.get(key);
    return !!cached && !cached.isStale;
  }

  /**
   * Wraps a fetcher function with caching, SWR, and request deduplication
   */
  async fetchWithCache(key, fetcher, options = {}) {
    const { ttl, tags = [], bypassCache = false, allowStale = true } = options;

    // 1. If not bypassing cache, check cache first
    if (!bypassCache) {
      const cached = this.get(key, { allowStale });
      if (cached && !cached.isStale) {
        return cached.data;
      }
    }

    // 2. In-flight Promise deduplication: If a request for this key is already running, share the Promise
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key);
    }

    // 3. Execute network request and manage deduplication
    const requestPromise = (async () => {
      try {
        const result = await fetcher();
        if (result !== undefined && result !== null) {
          this.set(key, result, { ttl, tags });
        }
        return result;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, requestPromise);
    return requestPromise;
  }

  /**
   * Invalidate specific cache keys
   */
  invalidateKey(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.notifyListeners(key, null, true);
    }
  }

  /**
   * Invalidate all cache entries matching a URL prefix or regex pattern
   */
  invalidatePattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.notifyListeners(key, null, true);
      }
    }
  }

  /**
   * Invalidate all cache entries associated with one or more tags
   */
  invalidateTags(tags = []) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    if (tagList.length === 0) return;

    for (const [key, entry] of this.cache.entries()) {
      const hasMatchingTag = entry.tags && entry.tags.some((t) => tagList.includes(t));
      if (hasMatchingTag) {
        this.cache.delete(key);
        this.notifyListeners(key, null, true);
      }
    }
  }

  /**
   * Clears the entire cache store (e.g. on logout or role change)
   */
  clear() {
    this.cache.clear();
    this.inFlightRequests.clear();
    for (const key of this.listeners.keys()) {
      this.notifyListeners(key, null, true);
    }
  }

  /**
   * Subscription mechanism for components to re-render on cache updates
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    return () => {
      if (this.listeners.has(key)) {
        this.listeners.get(key).delete(callback);
        if (this.listeners.get(key).size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  notifyListeners(key, data, isInvalidated = false) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((cb) => cb({ key, data, isInvalidated }));
    }
  }

  /**
   * Helper to inspect cache stats for debugging
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      inFlight: this.inFlightRequests.size,
    };
  }
}

// Global Singleton Instance
export const apiCache = new ApiCacheManager();
export default apiCache;
