/**
 * Starts/stops the portable PostgreSQL 16 used for local development on Windows without Docker.
 * Setup is described in docs/DEVELOPMENT.md. Override the install folder with BILIDITO_PG_HOME.
 *
 *   bun run db:start | db:stop | db:status
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const home =
	process.env.BILIDITO_PG_HOME ??
	join(process.env.LOCALAPPDATA ?? process.env.HOME ?? '', 'bilidito-pg');
const data = join(home, 'data');
const logFile = join(home, 'postgres.log');
const pgCtl = join(home, 'pgsql', 'bin', process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl');

const commands: Record<string, string[]> = {
	start: ['-D', data, '-l', logFile, '-o', '-p 5432 -c listen_addresses=localhost', '-w', 'start'],
	stop: ['-D', data, '-m', 'fast', '-w', 'stop'],
	status: ['-D', data, 'status']
};

const command = process.argv[2] ?? 'status';
const args = commands[command];

if (!args) {
	console.error(`Unknown command "${command}". Use: start | stop | status`);
	process.exit(1);
}

if (!existsSync(pgCtl) || !existsSync(join(data, 'PG_VERSION'))) {
	console.error(
		`No portable PostgreSQL found in ${home}.\n` +
			'See docs/DEVELOPMENT.md to set it up, or use Docker instead: docker compose up -d'
	);
	process.exit(1);
}

// The server inherits open handles from pg_ctl, so never pass our stdio pipes to `start`, or this
// script (and any terminal/tool waiting on its output) would hang until the server stops.
const result = spawnSync(pgCtl, args, {
	stdio: command === 'start' ? 'ignore' : 'inherit',
	windowsHide: true
});
if (command === 'start') {
	console.log(
		result.status === 0
			? 'PostgreSQL is running on localhost:5432.'
			: `PostgreSQL failed to start. See ${logFile}`
	);
}
process.exit(result.status ?? 1);
