import * as z from 'zod';
import { normalizePhMobile, USERNAME_PATTERN } from '../domain/user.ts';

const password = z
	.string()
	.min(8, 'Use at least 8 characters.')
	.max(128, 'Use at most 128 characters.');

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));

export const loginSchema = z.object({
	identifier: z.string().trim().min(1, 'Enter your email or username.').max(254),
	password: z.string().min(1, 'Enter your password.').max(128)
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, 'Enter your full name.')
			.max(80, 'Name is too long.')
			.regex(/^[\p{L}\p{M} .,'-]+$/u, 'Use letters only.'),
		username: z
			.string()
			.trim()
			.toLowerCase()
			.regex(USERNAME_PATTERN, '3–30 characters: letters, numbers, dot or underscore.'),
		email,
		mobileNumber: z.string().transform((value, ctx) => {
			const normalized = normalizePhMobile(value);
			if (!normalized) {
				ctx.addIssue({ code: 'custom', message: 'Enter a PH mobile number, e.g. 0917 123 4567.' });
				return z.NEVER;
			}
			return normalized;
		}),
		password,
		confirmPassword: z.string(),
		municipalityId: z.uuid('Choose your municipality or city.'),
		barangayId: z.uuid('Choose your barangay.'),
		agree: z.literal('on', 'You must agree to continue.')
	})
	.refine((v) => v.password === v.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.'
	});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, 'This reset link is invalid.'),
		password,
		confirmPassword: z.string()
	})
	.refine((v) => v.password === v.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.'
	});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Enter your current password.'),
		password,
		confirmPassword: z.string()
	})
	.refine((v) => v.password === v.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.'
	});
