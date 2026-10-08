import { describe, expect, it } from 'vitest';
import { RateLimiter } from './rate-limit.ts';

describe('RateLimiter', () => {
	it('allows up to max hits per window, then blocks until the window resets', () => {
		const limiter = new RateLimiter(2, 1000);
		expect(limiter.hit('k', 0)).toBe(true);
		expect(limiter.hit('k', 10)).toBe(true);
		expect(limiter.hit('k', 20)).toBe(false);
		expect(limiter.hit('k', 1000)).toBe(true);
	});

	it('tracks keys independently', () => {
		const limiter = new RateLimiter(1, 1000);
		expect(limiter.hit('a', 0)).toBe(true);
		expect(limiter.hit('b', 0)).toBe(true);
		expect(limiter.hit('a', 1)).toBe(false);
	});

	it('consume throws a 429 ServiceError when exhausted', () => {
		const limiter = new RateLimiter(1, 60_000);
		limiter.consume('x');
		expect(() => limiter.consume('x')).toThrow(/Too many attempts/);
	});
});
