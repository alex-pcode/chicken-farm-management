/**
 * Browser storage utilities for caching data
 * Works with your existing DataContext for multi-layer caching
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class BrowserCache {
  private static instance: BrowserCache;
  
  private constructor() {}
  
  static getInstance(): BrowserCache {
    if (!BrowserCache.instance) {
      BrowserCache.instance = new BrowserCache();
    }
    return BrowserCache.instance;
  }

  /**
   * Store data in localStorage with TTL (user-specific)
   */
  set<T>(key: string, data: T, ttlMinutes: number = 5, userId?: string): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000
      };
      const cacheKey = userId ? `bmad_cache_${userId}_${key}` : `bmad_cache_${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data in localStorage:', error);
    }
  }

  /**
   * Retrieve data from localStorage if not expired (user-specific)
   */
  get<T>(key: string, userId?: string): T | null {
    try {
      const cacheKey = userId ? `bmad_cache_${userId}_${key}` : `bmad_cache_${key}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const item: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Check if expired
      if (now - item.timestamp > item.ttl) {
        this.remove(key, userId);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Remove specific cache entry (user-specific)
   */
  remove(key: string, userId?: string): void {
    try {
      const cacheKey = userId ? `bmad_cache_${userId}_${key}` : `bmad_cache_${key}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to remove cache entry:', error);
    }
  }

  /**
   * Clear all app cache entries (optionally for specific user)
   */
  clearAll(userId?: string): void {
    try {
      const prefix = userId ? `bmad_cache_${userId}_` : 'bmad_cache_';
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear cache for all users (admin function)
   */
  clearAllUsers(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('bmad_cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all user cache:', error);
    }
  }

  /**
   * Get cache size and statistics
   */
  getStats(): { totalEntries: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('bmad_cache_'));
      let totalSize = 0;
      
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      });
      
      return {
        totalEntries: keys.length,
        totalSize
      };
    } catch {
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

export const browserCache = BrowserCache.getInstance();

// Cache keys constants
export const CACHE_KEYS = {
  APP_DATA: 'app_data',
  USER_PREFERENCES: 'user_preferences',
  FLOCK_SUMMARY: 'flock_summary',
  SALES_SUMMARY: 'sales_summary'
} as const;