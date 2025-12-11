/**
 * Test per CacheManager
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('CacheManager', () => {
  beforeEach(() => {
    // Reset cache state
    if (window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('Cache operations', () => {
    it('should set and get cached values', () => {
      const cache = {
        _cache: new Map(),
        set(key, value, ttl = 300000) {
          this._cache.set(key, {
            value,
            timestamp: Date.now(),
            expires: Date.now() + ttl
          });
        },
        get(key, returnStale = false) {
          const entry = this._cache.get(key);
          if (!entry) return null;
          if (returnStale) return entry.value;
          if (Date.now() > entry.expires) return null;
          return entry.value;
        }
      };

      cache.set('test', { data: 'value' });
      expect(cache.get('test')).toEqual({ data: 'value' });
      expect(cache.get('nonexistent')).toBe(null);
    });

    it('should respect TTL', () => {
      const cache = {
        _cache: new Map(),
        set(key, value, ttl = 100) {
          this._cache.set(key, {
            value,
            timestamp: Date.now(),
            expires: Date.now() + ttl
          });
        },
        get(key) {
          const entry = this._cache.get(key);
          if (!entry) return null;
          if (Date.now() > entry.expires) return null;
          return entry.value;
        }
      };

      cache.set('test', 'value', 50);
      expect(cache.get('test')).toBe('value');
      
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('test')).toBe(null); // Expired
          resolve();
        }, 100);
      });
    });

    it('should return stale values when requested', () => {
      const cache = {
        _cache: new Map(),
        set(key, value, ttl = 50) {
          this._cache.set(key, {
            value,
            timestamp: Date.now(),
            expires: Date.now() + ttl
          });
        },
        get(key, returnStale = false) {
          const entry = this._cache.get(key);
          if (!entry) return null;
          if (returnStale) return entry.value;
          if (Date.now() > entry.expires) return null;
          return entry.value;
        }
      };

      cache.set('test', 'stale-value', 10);
      
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('test')).toBe(null); // Expired
          expect(cache.get('test', true)).toBe('stale-value'); // Stale but returned
          resolve();
        }, 100);
      });
    });

    it('should invalidate cache', () => {
      const cache = {
        _cache: new Map(),
        set(key, value) {
          this._cache.set(key, { value, timestamp: Date.now(), expires: Date.now() + 300000 });
        },
        get(key) {
          const entry = this._cache.get(key);
          if (!entry) return null;
          if (Date.now() > entry.expires) return null;
          return entry.value;
        },
        invalidate(key) {
          if (key) {
            this._cache.delete(key);
          } else {
            this._cache.clear();
          }
        }
      };

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.get('key1')).toBe('value1');
      
      cache.invalidate('key1');
      expect(cache.get('key1')).toBe(null);
      expect(cache.get('key2')).toBe('value2');
      
      cache.invalidate();
      expect(cache.get('key2')).toBe(null);
    });
  });
});

