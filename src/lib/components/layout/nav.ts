/** Minimal viewer info the layout needs (no email or other private fields). */
export interface Viewer {
	id: string;
	name: string;
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
