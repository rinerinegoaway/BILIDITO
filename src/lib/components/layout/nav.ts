/** What the layout knows about the signed-in user. Only ever sent to that same user. */
export interface Viewer {
	id: string;
	name: string;
	/** Shown only to its owner (account menu). */
	email: string;
	username: string;
	image: string | null;
	isAdmin: boolean;
	isVerified: boolean;
	verificationStatus: string;
	status: string;
}

/** True when `pathname` is `href` or inside it (but `/` only matches itself). */
export function isActivePath(pathname: string, href: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname === href || pathname.startsWith(`${href}/`);
}
