import { defineEnvVars } from '@sveltejs/kit/env';
import * as z from 'zod';

const optional = z
	.string()
	.optional()
	.transform((v) => (v ? v : undefined));

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'Postgres connection string.',
		schema: z.string().regex(/^postgres(ql)?:\/\//, 'must be a postgres:// URL')
	},
	ORIGIN: {
		description: 'Public origin of the app, e.g. `http://localhost:5173`. Used for CSRF and links.',
		schema: z.url()
	},
	BETTER_AUTH_SECRET: {
		description: 'High-entropy secret (≥32 chars) used by Better Auth to sign tokens.',
		schema: z.string().min(32, 'must be at least 32 characters')
	},
	SMTP_URL: {
		description:
			'SMTP connection URL for transactional email. When unset in development, emails are printed to the server console.',
		schema: optional
	},
	EMAIL_FROM: {
		description: 'From address for transactional email.',
		schema: z.string().optional().default('BILIDITO <no-reply@bilidito.local>')
	},
	STORAGE_DIR: {
		description:
			'Folder for the local storage driver (public/ and private/ subfolders). Must be persistent and outside the web root.',
		schema: z.string().optional().default('.storage')
	}
});
