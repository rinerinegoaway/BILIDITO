# BILIDITO — Technical Assessment & Implementation Plan

## 1. Assessment (2026-10-08)

- **Repository:** empty greenfield directory, not a git repo, so there was no existing system to keep.
  The spec's "use the existing ORM" fallback applies, so we use Drizzle.
- **Toolchain:** Node 24.19 and Bun 1.4.2 (installed today, `%USERPROFILE%\.bun\bin`). Docker Desktop
  is installed; it must be running for the local database. No local `psql`.
- **Scaffold:** `sv create` with SvelteKit **3.0**, Svelte 5 (runes forced on), Vite 8, TypeScript 6,
  Tailwind 4 (+forms), Drizzle (postgres.js), Better Auth, adapter-node, Vitest, ESLint and Prettier.
  SvelteKit 3 differs from v2 in a few ways:
  - env vars are declared in `src/env.ts` and imported from `$app/env/private` / `$app/env/public`;
  - imports use `#lib/...` (package.json subpath imports, with `.ts` extensions) instead of `$lib`;
  - there is no `svelte.config.js`; Kit options live in `vite.config.ts`.

## 2. Decisions

| Area           | Choice                                                                                                                                                                         | Why                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Framework      | SvelteKit 3 + Svelte 5 runes + TS strict                                                                                                                                       | Spec.                                                                                                           |
| Mutations      | Form actions with `use:enhance` (stable) calling service functions                                                                                                             | Forms work without JS, which suits slow connections. We skip remote functions while they're still experimental. |
| Business logic | `src/lib/server/services/*` take `(actor, input)`, enforce authorisation and run DB transactions                                                                               | UI, form actions and a future `/api/v1` for mobile all share the same rules.                                    |
| Pure rules     | `src/lib/domain/*` (enums, order/listing state machines, ranking)                                                                                                              | Unit-testable with no DB.                                                                                       |
| DB             | PostgreSQL 16. Dev: portable PG 16 (Docker fallback); Supabase in prod                                                                                                         | Docker is broken on the dev PC (see DEVELOPMENT.md)                                                             |
| ORM            | Drizzle + drizzle-kit **migrations** (committed SQL), `db:push` only for scratch                                                                                               | Reproducible production schema.                                                                                 |
| Auth           | Better Auth (email + password, `username` plugin, DB sessions, password reset, built-in rate limit)                                                                            | User decision. Its bearer plugin can serve the mobile app later.                                                |
| Validation     | Zod schemas shared by client and server                                                                                                                                        | Spec: never trust the client.                                                                                   |
| Search         | Postgres full-text (`simple` config, which suits mixed English/Filipino/Ilocano) + `pg_trgm` for partial and typo matches; GIN indexes                                         | No paid search service.                                                                                         |
| Location       | `locations` table (PROVINCE → CITY_MUNICIPALITY → BARANGAY, PSGC codes, centroids). Distance via Haversine + bounding-box prefilter on indexed lat/lng                         | Expandable beyond Cagayan without PostGIS.                                                                      |
| Maps           | Leaflet + OSM tiles, lazy-loaded only on pages with a map                                                                                                                      | Spec. The OSM public tile policy suits low traffic; switch to a free-tier tile host if traffic grows.           |
| Storage        | `Storage` interface, local-disk driver in dev, S3-compatible driver in prod (Supabase Storage or Cloudflare R2)                                                                | Two buckets: public `listing-images`, private `verification-docs`.                                              |
| ID documents   | Private bucket only, streamed through an admin-only endpoint that writes an audit-log entry per view. No ID number collected. Never in logs or public URLs                     | Spec §11, data minimisation (PH Data Privacy Act, RA 10173).                                                    |
| Images         | Client resizes/compresses before upload (saves mobile data); server re-encodes with `sharp` → WebP, **strips EXIF** (phone photos carry home GPS), makes thumbnail + full size | Performance and privacy.                                                                                        |
| Messaging      | Visibility-aware polling; SSE later                                                                                                                                            | No realtime infrastructure cost.                                                                                |
| Email          | Dev: console transport (logs reset links). Prod: SMTP via env (free-tier provider)                                                                                             | No fake integration; clearly dev-only.                                                                          |
| Mobile number  | Format-validated (`+63 9XXXXXXXXX`), not SMS-verified                                                                                                                          | SMS costs money. Flagged for later.                                                                             |
| Rate limiting  | Better Auth limiter for auth routes; in-memory token bucket for app actions (single instance)                                                                                  | Swap to a DB/Redis store if we scale out.                                                                       |
| Hosting        | adapter-node on any low-cost Node host (Render/Railway/Fly/small VPS) + Supabase + R2                                                                                          | `sharp` needs Node. Note: Vercel Hobby forbids commercial use.                                                  |

## 3. Security baseline (applies to every phase)

- `hooks.server.ts`: load session → load app user (role, status, verification) → block
  suspended/banned users from mutations → **guard `/admin/**` by path**. Layout `load` guards don't
  protect form actions, so every admin action calls `requireAdmin()` again.
- Clients never send `role`, `verification_status`, `status` or order status. Those fields are
  changed only by service functions that check the actor.
- SvelteKit's built-in origin check provides CSRF protection for form actions; JSON endpoints check `Origin`.
- Drizzle uses parameterised queries; user HTML is never rendered with `{@html}`.
- Uploads: magic-byte sniffing, size/count limits, re-encoding, random object keys.
- Secrets come only from env (`src/env.ts` validates them at startup). `.env.example` holds placeholders.

## 4. Directory layout

```
src/
  env.ts                      # declared + validated env vars
  hooks.server.ts             # session, user status, admin guard
  lib/
    domain/                   # pure: enums, order/listing machines, ranking, money/format utils
    schemas/                  # zod schemas (shared)
    components/ui/            # Button, Input, Select, Modal, Badge, EmptyState, Pagination, Skeleton…
    components/marketplace/   # ProductCard, RatingStars, StatusBadge, LocationSelector, ImageUploader…
    server/
      db/                     # schema/*.ts, index.ts, seed/
      auth.ts
      guards.ts               # requireUser / requireVerified / requireAdmin
      services/               # users, verification, listings, search, favorites, messaging,
                              # orders, ratings, reports, moderation, notifications, audit, analytics
      storage/  images/  email/  rate-limit.ts
  routes/
    (public)/   (app)/   admin/   api/v1/   (api only where JS needs it: uploads, polling, toggles)
```

## 5. Phases

Each phase ends with `bun run check`, `bun run lint`, `bun run test` all green.

| Phase               | Scope                                                                                                                                                                                                                                                   | Exit criteria                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **1 Foundation ✅** | git init; env; local Postgres; full Drizzle schema + first migration; Better Auth wired to the app user model (role/status/verification); guards; design tokens + base UI components; app shell (header, mobile bottom nav, footer); remove demo routes | Migrations apply on a clean DB; the shell renders at 360px and desktop; guard unit tests pass |
| **2 Users**         | register (all fields + consent), login/logout, forgot/reset/change password; Cagayan location seed (PSGC); LocationSelector; profile + settings; ID verification submit; private storage                                                                | Register → upload ID → status PENDING works end to end                                        |
| **3 Marketplace**   | categories seed; create/edit listing; image pipeline; `/items` browse with search, filters, sort, pagination; item detail; category pages; landing page with real data                                                                                  | Verified user can post; anyone can find it by search/filter/location                          |
| **4 Communication** | conversations/messages (+block, report); notifications centre; favourites + sold/removed alerts                                                                                                                                                         | Buyer ↔ seller chat with unread counts                                                        |
| **5 Transactions**  | order machine per `TRANSACTION_RULES.md`; meet-up and delivery arrangements; delivery providers (read side); `settleDueOrders`                                                                                                                          | Full request → complete flow with concurrency-safe stock                                      |
| **6 Trust**         | ratings; reports (listing/user/message/order); suspension/ban effects                                                                                                                                                                                   | Rating and report rules enforced with tests                                                   |
| **7 Admin**         | dashboard, users, verifications (doc viewer + audit), listings, reports, orders, categories, delivery providers, prohibited categories, analytics, audit log                                                                                            | Every admin mutation audit-logged; all admin routes server-guarded                            |
| **8 Polish**        | responsive pass, skeletons/empty/error states, a11y, SEO/OG, PWA manifest, Playwright E2E for the §59 flow, perf indexes, security review                                                                                                               | Spec §61 test list covered                                                                    |

## 6. Open items for later (not blocking)

- **ID image retention:** recommend deleting ID images 30 days after the decision and keeping only
  metadata (type, decision, reviewer, date). Confirm with counsel; collecting government IDs may
  trigger NPC registration under RA 10173.
- **Production hosts:** pick the Node host and object storage (R2 vs Supabase Storage) at deployment.
- **Map tiles:** watch OSM tile usage once traffic grows.
