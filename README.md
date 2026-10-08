# BILIDITO

**Buy Nearby. Sell Safely. Connect Locally.** A verified, location-based buy & sell marketplace,
starting in Cagayan Province, Philippines.

Responsive web app (PWA-ready), built with SvelteKit 3 · Svelte 5 · TypeScript · Tailwind 4 ·
PostgreSQL + Drizzle · Better Auth · Leaflet/OpenStreetMap. The package manager is Bun.

- Product spec: [docs/SPEC.md](docs/SPEC.md)
- Payment & transaction rules: [docs/TRANSACTION_RULES.md](docs/TRANSACTION_RULES.md)
- Implementation plan: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Development setup: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

```bash
bun install
bun run db:start      # or: bun run db:docker
bun run db:migrate
bun run dev
```
