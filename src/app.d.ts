import type { Session } from 'better-auth';
import type { AppUser } from '#lib/domain/user.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			user?: AppUser;
			session?: Session;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
