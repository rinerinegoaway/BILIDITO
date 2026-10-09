import type { ActionResult } from '$app/forms';

export const CONNECTION_ERROR =
	"We couldn't reach BILIDITO. Check your internet connection and try again. Nothing was lost.";

/**
 * True when a form submission failed before getting a real answer (dropped connection, timeout,
 * server crash). Forms show CONNECTION_ERROR inline instead of navigating to the error page, so
 * people on slow mobile data keep what they typed and can simply retry.
 */
export function isConnectionError(result: ActionResult): boolean {
	return result.type === 'error';
}
