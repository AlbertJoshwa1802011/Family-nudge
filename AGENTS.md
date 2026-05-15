# AGENTS.md

## Cursor Cloud specific instructions

### Services Overview

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| PostgreSQL 16 | `sudo docker compose up -d postgres` | 5432 | Required; credentials: postgres/postgres |
| Redis 7 | `sudo docker compose up -d redis` | 6379 | Optional (declared but not used in current code) |
| API (Express) | `pnpm --filter @family-nudge/api dev` | 4000 | Uses `tsx watch` for hot reload |
| Web (Next.js) | `pnpm --filter family-nudge-web dev` | 3000 | `NEXT_PUBLIC_API_URL=http://localhost:4000/api` |

### Prerequisites & Startup

- Docker daemon must be running before starting containers: `sudo dockerd &>/tmp/dockerd.log &`
- After containers are up, run `pnpm db:generate` then `pnpm db:push` to sync the Prisma schema
- The `.env` file at the workspace root must contain `DATABASE_URL`, `JWT_SECRET`, and `ENCRYPTION_MASTER_KEY` — copy from `.env.example` and fill in `ENCRYPTION_MASTER_KEY` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Copy the root `.env` to `apps/api/.env` so the API server picks it up

### Gotchas

- `turbo.json` and `packageManager` field in root `package.json` were missing from the original repo — they have been added as part of environment setup.
- The `@family-nudge/shared` and `@family-nudge/crypto` packages required `typescript` and `@types/node` as devDependencies (added during setup).
- The `@family-nudge/crypto` package has pre-existing TypeScript type errors (`getAuthTag`/`setAuthTag` on `Cipher`/`Decipher` types) — these do not block runtime since `tsx` skips type checking.
- The web app ESLint requires version 8 (`eslint@^8`), not 9, because Next.js 15.3 uses the legacy config format.
- The API `tsc --noEmit` lint has pre-existing type errors in routes (Express header types, JWT sign overload) that don't affect runtime.
- There are no automated test files yet; `pnpm test` (vitest) exits with "no test files found".
- Docker in this environment requires `fuse-overlayfs` storage driver and `iptables-legacy` for nested container support.

### Common Commands

See root `package.json` scripts for standard commands (`pnpm dev`, `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm db:generate`, `pnpm db:push`, `pnpm db:migrate`, `pnpm db:studio`).
