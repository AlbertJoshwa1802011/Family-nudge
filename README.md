# Family-nudge

Reminders that escalate until they land, plus an encrypted family document vault with an audit trail on every touch.

## Why

Two boring but unsolved family pains:

1. **Reminders that don't get ignored.** A regular phone reminder is silent after one tap. Family-nudge escalates: push → WhatsApp text → WhatsApp voice note, stopping the moment the target confirms.
2. **Family documents in one safe place.** Aadhaar, passports, insurance, school certificates, property papers belong in a multi-user encrypted vault with an audit log — not in a phone's camera roll.

## Stack

All services have a working free tier; total running cost for a single family is 0.

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 15 on Vercel (Hobby) |
| Mobile | Expo SDK 52 + expo-router, builds via Expo EAS |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Scheduler | `pg_cron` inside Supabase |
| Messaging | Meta WhatsApp Business Cloud API (direct, 1k conversations/month free) |
| Voice notes | Google Cloud Text-to-Speech (free tier: 1M chars/month) |
| Push | Expo Push + Web Push (VAPID) |
| Encryption | Client-side AES-256-GCM envelope; family KEK wrapped by a passphrase-derived key (Argon2id) |
| Shared types | Zod schemas in `packages/shared` |
| CI | GitHub Actions |

> Insforge was considered as an alternative BaaS and remains a possible swap — the app code talks to Postgres + Auth + Storage + Functions primitives, so migration would touch ~20% of the codebase.

## Repository layout

```
Family-nudge/
├── apps/
│   ├── web/                Next.js 15, App Router
│   └── mobile/             Expo SDK 52, expo-router
├── packages/
│   └── shared/             Zod schemas + shared TypeScript types
├── supabase/
│   ├── config.toml         local dev config
│   ├── migrations/         SQL migrations (source of truth for the schema)
│   └── seed.sql
├── .github/workflows/
│   └── ci.yml              lint + typecheck + test on every PR
├── .env.example            documented env vars (copy to .env.local)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json            root workspace
```

## Getting started

### Prerequisites

- Node.js 20.11+ and pnpm 9.12+ (`corepack enable` picks this up from `package.json`)
- A free Supabase project (https://supabase.com/dashboard)
- Supabase CLI if you want local-first dev (`brew install supabase/tap/supabase`)
- Expo CLI (installed automatically via `pnpm dev`)

### Install and run

```bash
pnpm install
cp .env.example .env.local     # fill in Supabase URL + anon key at minimum
pnpm dev                       # runs web on :3000 and Expo dev server together
```

### Apply the schema to a hosted Supabase project

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push               # applies everything under supabase/migrations/
```

### First-time project checklist

1. **Supabase** — create a project on the free tier, copy URL + anon key into `.env.local`.
2. **Meta WhatsApp** — create an app at developers.facebook.com, add the WhatsApp product, grab the phone number ID + permanent access token.
3. **Google Cloud TTS** — create a project, enable the Text-to-Speech API, create a service account, and paste the base64 of the JSON key into `GOOGLE_TTS_CREDENTIALS_B64`.
4. **Vercel** — import the repo, set the same env vars on the `web` project.
5. **Expo** — `npx eas login` and `npx eas build:configure` inside `apps/mobile/`.

## Roadmap

Current phase: **Week 1 — foundation scaffolding (in progress)**.

See the plan file for the full milestone breakdown:
`~/.claude/plans/give-me-your-thoughts-cuddly-wigderson.md`

- Week 1 — monorepo, supabase schema, CI *(this commit)*
- Week 2 — auth + family + invite flow
- Week 3 — reminders CRUD + push channel
- Week 4 — WhatsApp text + voice-note escalation
- Week 5 — encrypted vault core
- Week 6 — audit + polish + private beta

## License

Private, pre-release. No license granted yet.
