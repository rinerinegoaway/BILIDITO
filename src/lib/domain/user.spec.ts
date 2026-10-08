import { describe, expect, it } from 'vitest';
import {
	type Actor,
	canMessage,
	canSubmitVerification,
	canTransact,
	isAdmin,
	normalizePhMobile,
	USERNAME_PATTERN
} from './user.ts';

const actor = (overrides: Partial<Actor> = {}): Actor => ({
	id: 'u1',
	role: 'USER',
	status: 'ACTIVE',
	verificationStatus: 'UNVERIFIED',
	...overrides
});

describe('normalizePhMobile', () => {
	it.each([
		['09171234567', '+639171234567'],
		['0917 123 4567', '+639171234567'],
		['9171234567', '+639171234567'],
		['639171234567', '+639171234567'],
		['+63 917-123-4567', '+639171234567']
	])('normalises %s', (input, expected) => {
		expect(normalizePhMobile(input)).toBe(expected);
	});

	it.each(['0817123456', '12345', '+6391712345678', '02-8123-4567', ''])('rejects %s', (input) => {
		expect(normalizePhMobile(input)).toBeNull();
	});
});

describe('USERNAME_PATTERN', () => {
	it('accepts lower-case handles', () => {
		expect(USERNAME_PATTERN.test('juan_dela.cruz9')).toBe(true);
	});
	it('rejects short, upper-case or symbol handles', () => {
		expect(USERNAME_PATTERN.test('ab')).toBe(false);
		expect(USERNAME_PATTERN.test('Juan')).toBe(false);
		expect(USERNAME_PATTERN.test('juan-cruz')).toBe(false);
	});
});

describe('access rules', () => {
	it('only verified, active users can transact', () => {
		expect(canTransact(actor())).toBe(false);
		expect(canTransact(actor({ verificationStatus: 'PENDING' }))).toBe(false);
		expect(canTransact(actor({ verificationStatus: 'VERIFIED' }))).toBe(true);
		expect(canTransact(actor({ verificationStatus: 'VERIFIED', status: 'SUSPENDED' }))).toBe(false);
	});

	it('unverified active users can message; restricted users cannot', () => {
		expect(canMessage(actor())).toBe(true);
		expect(canMessage(actor({ status: 'BANNED' }))).toBe(false);
	});

	it('admin rights require an active admin', () => {
		expect(isAdmin(actor({ role: 'ADMIN' }))).toBe(true);
		expect(isAdmin(actor({ role: 'ADMIN', status: 'SUSPENDED' }))).toBe(false);
		expect(isAdmin(actor())).toBe(false);
	});

	it('verification can be (re)submitted only from UNVERIFIED or REJECTED', () => {
		expect(canSubmitVerification(actor())).toBe(true);
		expect(canSubmitVerification(actor({ verificationStatus: 'REJECTED' }))).toBe(true);
		expect(canSubmitVerification(actor({ verificationStatus: 'PENDING' }))).toBe(false);
		expect(canSubmitVerification(actor({ verificationStatus: 'VERIFIED' }))).toBe(false);
	});
});
