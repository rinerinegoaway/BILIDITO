# BILIDITO

Verified, location-based buy & sell web app for Cagayan Province, PH. MVP, low budget.

- Spec: `docs/SPEC.md` (§ numbers referenced in code). **`docs/TRANSACTION_RULES.md` overrides the
  spec** for payments, orders, listing status and ratings.
- Plan and phase status: `docs/IMPLEMENTATION_PLAN.md`. Setup: `docs/DEVELOPMENT.md`.

## Stack conventions (SvelteKit 3, which differs from v2)

- Imports use `#lib/...` with explicit `.ts` extensions (package.json `imports`), not `$lib`.
- Env vars are declared and validated in `src/env.ts`; import them from `$app/env/private` / `$app/env/public`.
- No `svelte.config.js`; Kit options live in `vite.config.ts`. `dev`/`building` come from `$app/env`.
- Svelte 5 runes only. Form actions + `use:enhance` for mutations (remote functions are still experimental).
- Bun for everything (`bun add`, `bun run`). Never npm.

## Design system

- **The red-orange identity and Poppins replace spec §50's blue/green palette** (user request, 2026-10-09).
  Tokens live in `src/routes/layout.css`: `brand-*` = red, `accent-*` = orange, `success-*` = green,
  and the `slate-*` scale is re-tuned to warm neutrals.
- White text needs `bg-brand-gradient` / `brand-700+`. `#E53935` and `#FF6B35` are too light for
  white text, so use them for icons, highlights and large display text only.
- Reuse `#lib/components/ui/*` (Button, Input, Select, Textarea, Alert, Badge, Modal, Breadcrumbs,
  EmptyState, Skeleton, Pagination) and `page-title`/`page-subtitle`. Don't put display classes
  (`hidden`) on components; wrap them instead.

## Architecture rules

- Business rules live in `src/lib/server/services/*` as `(actor, input)` functions that enforce
  authorisation and throw `ServiceError`. Routes stay thin (`runAction` maps errors to `fail`).
- Pure, unit-tested logic (enums, state machines, formatting) lives in `src/lib/domain/*`.
- Enum values come from `src/lib/domain/enums.ts` (pgEnums are generated from them).
- Money is integer **centavos** (`bigint` mode number). Format with `formatPeso`.
- Clients never set `role`, `status`, `verificationStatus` or order status. Order changes are
  _actions_ validated against the transition table.
- `/admin/**` is guarded in `hooks.server.ts`. Admin actions must still call `requireAdmin` and
  write an `audit_logs` row.
- Government ID images live only in the private bucket and are never logged or given public URLs.
- Better Auth HTTP endpoints that bypass our validation are disabled (`disabledPaths` in
  `src/lib/server/auth.ts`). Registration and profile edits go through our own actions.

## Checks before finishing a phase

`bun run check && bun run lint && bun run test`. Schema changes: `bun run db:generate --name <x>`, then `bun run db:migrate`.
