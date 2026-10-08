import type { UserRole, UserStatus, VerificationStatus } from './enums.ts';

/** Lower-case letters, digits, dot and underscore. Checked after Better Auth lower-cases input. */
export const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/;

/** The authenticated user as the app sees it (from the session). */
export interface AppUser {
	id: string;
	name: string;
	email: string;
	username: string;
	image: string | null;
	role: UserRole;
	status: UserStatus;
	verificationStatus: VerificationStatus;
	municipalityId: string;
	barangayId: string;
}

/** The subset of a user that access rules depend on. */
export type Actor = Pick<AppUser, 'id' | 'role' | 'status' | 'verificationStatus'>;

export const isActive = (a: Actor) => a.status === 'ACTIVE';
export const isVerified = (a: Actor) => a.verificationStatus === 'VERIFIED';
export const isAdmin = (a: Actor) => a.role === 'ADMIN' && isActive(a);

/** Posting listings, requesting to buy and accepting requests (spec §12, TRANSACTION_RULES §5). */
export const canTransact = (a: Actor) => isActive(a) && isVerified(a);

/** Unverified users may message (rate-limited); suspended/banned users may not. */
export const canMessage = (a: Actor) => isActive(a);

/** Users may submit ID verification when they have none pending or approved. */
export const canSubmitVerification = (a: Actor) =>
	isActive(a) && (a.verificationStatus === 'UNVERIFIED' || a.verificationStatus === 'REJECTED');

/**
 * Normalises a Philippine mobile number to E.164 (`+639XXXXXXXXX`).
 * Accepts `09XXXXXXXXX`, `9XXXXXXXXX`, `639XXXXXXXXX` and `+639XXXXXXXXX`, with spaces/dashes.
 * Returns null when the input is not a PH mobile number.
 */
export function normalizePhMobile(input: string): string | null {
	const digits = input.replace(/[\s\-().]/g, '');
	const match = /^(?:\+?63|0)?(9\d{9})$/.exec(digits);
	return match ? `+63${match[1]}` : null;
}
