import { ServiceError } from './errors.ts';

interface Bucket {
	count: number;
	resetAt: number;
}

/**
 * In-memory fixed-window rate limiter for form actions and app endpoints.
 * Fine for a single Node instance (MVP). Swap for a Postgres/Redis store before scaling out.
 */
export class RateLimiter {
	private buckets = new Map<string, Bucket>();

	constructor(
		readonly max: number,
		readonly windowMs: number
	) {}

	/** Records a hit and returns whether it is allowed. */
	hit(key: string, now = Date.now()): boolean {
		const bucket = this.buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
			this.sweep(now);
			return true;
		}
		if (bucket.count >= this.max) return false;
		bucket.count++;
		return true;
	}

	/** Like `hit`, but throws a 429 ServiceError when the limit is exceeded. */
	consume(key: string, message = 'Too many attempts. Please wait a moment and try again.') {
		if (!this.hit(key)) throw new ServiceError('RATE_LIMITED', message, 429);
	}

	private sweep(now: number) {
		if (this.buckets.size < 10_000) return;
		for (const [key, bucket] of this.buckets) {
			if (bucket.resetAt <= now) this.buckets.delete(key);
		}
	}
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const limits = {
	login: new RateLimiter(5, MINUTE),
	register: new RateLimiter(5, HOUR),
	passwordReset: new RateLimiter(3, 15 * MINUTE),
	/** TRANSACTION_RULES §5: unverified users may start 5 conversations per day. */
	unverifiedNewConversation: new RateLimiter(5, DAY),
	message: new RateLimiter(30, MINUTE),
	report: new RateLimiter(10, HOUR),
	upload: new RateLimiter(60, HOUR)
} as const;
