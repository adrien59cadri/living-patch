/**
 * Unit tests for rate limiter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { delay, RateLimiter } from '../../lib/rate-limiter.js';

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('delay function', () => {
    it('should delay for specified milliseconds', async () => {
      const spy = vi.fn();
      
      const promise = delay(100).then(spy);
      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      await promise;
      
      expect(spy).toHaveBeenCalled();
    });

    it('should resolve after specified delay', async () => {
      const start = Date.now();
      const delayMs = 500;
      
      const promise = delay(delayMs);
      vi.advanceTimersByTime(delayMs);
      
      await promise;
      
      expect(Date.now() - start).toBe(delayMs);
    });
  });

  describe('RateLimiter class', () => {
    it('should create instance with default delay', () => {
      const limiter = new RateLimiter();
      expect(limiter).toBeDefined();
    });

    it('should create instance with custom delay', () => {
      const limiter = new RateLimiter(500);
      expect(limiter).toBeDefined();
    });

    it('should wait for specified delay', async () => {
      const limiter = new RateLimiter(100);
      const spy = vi.fn();
      
      const promise = limiter.waitForNextRequest().then(spy);
      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      await promise;
      
      expect(spy).toHaveBeenCalled();
    });

    it('should execute function with rate limiting', async () => {
      const limiter = new RateLimiter(100);
      const fn = vi.fn(async () => 'result');
      const spy = vi.fn();

      const promise = limiter.execute(fn).then(spy);
      
      expect(fn).toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      await promise;
      
      expect(spy).toHaveBeenCalled();
    });

    it('should return function result from execute', async () => {
      const limiter = new RateLimiter(100);
      const testValue = { test: 'data' };
      const fn = vi.fn(async () => testValue);

      const promise = limiter.execute(fn);
      vi.advanceTimersByTime(100);
      const result = await promise;
      
      expect(result).toEqual(testValue);
    });
  });
});
