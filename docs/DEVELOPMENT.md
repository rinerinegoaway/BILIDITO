# Development setup

## Prerequisites

- **Bun ≥ 1.4** (package manager and script runner). Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`.
- **Node ≥ 24** (used by Vite and the production server).
- **PostgreSQL 16**, using one of the options below.

## Database

### Option A: portable PostgreSQL (Windows, no admin, no Docker), the current setup on the main dev machine

1. Download the official binaries zip from EDB:
   `https://get.enterprisedb.com/postgresql/postgresql-16.15-5-windows-x64-binaries.zip`.
2. Extract it to `%LOCALAPPDATA%\bilidito-pg` so you get `%LOCALAPPDATA%\bilidito-pg\pgsql\bin\postgres.exe`.
   pgAdmin, StackBuilder and docs can be excluded.
3. Initialise a cluster (localhost only, password auth):
   ```bash
   "%LOCALAPPDATA%\bilidito-pg\pgsql\bin\initdb.exe" -D "%LOCALAPPDATA%\bilidito-pg\data" -U postgres -W -A scram-sha-256 -E UTF8 --locale=en-US
   ```
4. `bun run db:start`. Then, as `postgres`, create the app role and databases:
   ```sql
   CREATE ROLE bilidito LOGIN PASSWORD '<random>';
   CREATE DATABASE bilidito OWNER bilidito ENCODING 'UTF8';
   CREATE DATABASE bilidito_test OWNER bilidito ENCODING 'UTF8';
   ```
5. Put the URL in `.env`: `DATABASE_URL="postgres://bilidito:<random>@localhost:5432/bilidito"`.

`bun run db:start | db:stop | db:status` manage the server (`scripts/local-pg.ts`). The server does
**not** start with Windows, so run `db:start` after a reboot. Logs: `%LOCALAPPDATA%\bilidito-pg\postgres.log`.

### Option B: Docker

`bun run db:docker` starts Postgres 16 from `compose.yaml` (user/password/db `bilidito` /
`bilidito_dev` / `bilidito`).

> Docker Desktop currently fails to start on the main dev machine: Windows returns error 1920 for
> every AF_UNIX socket file Docker creates (e.g. `%LOCALAPPDATA%\Docker\run\dockerInference`). A stale
> copy of that folder was renamed to `run.stale-20261008` and can be deleted after a reboot.

## First run

```bash
bun install
cp .env.example .env        # then fill in DATABASE_URL and BETTER_AUTH_SECRET
bun run db:migrate          # applies drizzle/*.sql
bun run dev                 # http://localhost:5173
```

In development, emails (e.g. password reset links) are printed to the dev server console unless
`SMTP_URL` is set.

## Everyday commands

| Command                                           | What it does                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `bun run dev`                                     | Dev server with HMR                                                   |
| `bun run check`                                   | `svelte-check` type checking                                          |
| `bun run lint` / `bun run format`                 | Prettier + ESLint / auto-format                                       |
| `bun run test`                                    | Vitest unit tests (run once)                                          |
| `bun run db:generate --name <change>`             | Create a migration from schema changes in `src/lib/server/db/schema/` |
| `bun run db:migrate`                              | Apply pending migrations                                              |
| `bun run db:studio`                               | Drizzle Studio (DB browser)                                           |
| `bun run build` then `node --env-file=.env build` | Production build and server                                           |

Always commit generated migrations. Never edit an applied migration; add a new one instead.

## Production notes

- **CSRF and origin:** with adapter-node 6 / SvelteKit 3, the server derives its own origin from the
  `Host` header and defaults to **https**. Behind a TLS-terminating proxy this is correct. If the
  proxy rewrites headers, set `PROTOCOL_HEADER=x-forwarded-proto` and `HOST_HEADER=x-forwarded-host`.
  A plain-http production server (e.g. a local `node build` test) will reject its own form posts as
  cross-site. `ORIGIN` in `.env` is still required by Better Auth for links in emails.
- **Request body size:** adapter-node's default `BODY_SIZE_LIMIT` (512 KB) is raised when image
  uploads land in Phase 3.
- **Database:** Supabase Postgres. `pg_trgm` is created by the first migration (trusted extension).
