# End-to-End Flow Connectors

This document maps every connector needed for the full lifecycle of Family Nudge: **Development**, **Testing**, **Deployment**, **Monitoring/Maintenance**, and **Continuous Improvement**.

---

## Connector Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT                                     │
│  pnpm workspaces · Turborepo · Docker Compose (Postgres + Redis)       │
│  TypeScript · Prisma ORM · ESLint · Prettier · Husky + lint-staged     │
├─────────────────────────────────────────────────────────────────────────┤
│                           TESTING                                       │
│  Vitest (unit/integration) · Supertest (API) · CI services             │
│  GitHub Actions (Postgres + Redis containers)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         DEPLOYMENT                                      │
│  GitHub Actions → GitHub Pages (web) · Render / Docker (API)           │
│  Vercel (web alt) · Expo EAS (mobile) · Prisma Migrate (DB)           │
├─────────────────────────────────────────────────────────────────────────┤
│                    MONITORING & MAINTENANCE                             │
│  /health + /health/ready endpoints · Pino logging                      │
│  Dependabot (deps) · Sentry (errors, optional)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                    CONTINUOUS IMPROVEMENT                                │
│  PR-based workflow · Preview deploys (Vercel) · Dependabot PRs         │
│  Automated lint/test gates · Docker smoke tests                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Development Connectors

| Connector | Purpose | Status | Config |
|-----------|---------|--------|--------|
| **pnpm workspaces** | Monorepo package management | Active | `pnpm-workspace.yaml` |
| **Turborepo** | Parallel builds, caching, task orchestration | Active | `turbo.json` |
| **Docker Compose** | Local Postgres 16 + Redis 7 | Active | `docker-compose.yml` |
| **Prisma ORM** | Database schema, migrations, type-safe queries | Active | `apps/api/prisma/` |
| **TypeScript** | Type safety across all packages | Active | `tsconfig.base.json` |
| **Prettier** | Code formatting | Active | `.prettierrc` |
| **Husky** | Git pre-commit hooks | Active | `package.json` (prepare script) |
| **lint-staged** | Run formatters on staged files only | Active | `package.json` (lint-staged config) |

### Local Setup

```bash
pnpm install          # Install all workspace deps
docker compose up -d  # Start Postgres + Redis
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to local DB
pnpm dev              # Start all apps via Turborepo
```

---

## 2. Testing Connectors

| Connector | Purpose | Status | Config |
|-----------|---------|--------|--------|
| **Vitest** | Unit & integration tests (API) | Active | `apps/api/vitest.config.ts` |
| **GitHub Actions CI** | Automated lint + test on PR/push | Active | `.github/workflows/ci.yml` |
| **CI Postgres service** | Test database in CI | Active | `.github/workflows/ci.yml` |
| **CI Redis service** | Test cache/queue in CI | Active | `.github/workflows/ci.yml` |
| **Docker build smoke** | Validate API Dockerfile builds | Active | `.github/workflows/ci.yml` (docker-build job) |

### Running Tests

```bash
pnpm test             # Run all tests via Turborepo
pnpm --filter @family-nudge/api test   # API tests only
```

### CI Pipeline

Every push to `main` and every PR triggers:
1. Install dependencies (pnpm)
2. Generate Prisma client
3. Push schema to test DB
4. Build all packages
5. Lint (type-check)
6. Run tests
7. Docker build smoke test (main branch only)

---

## 3. Deployment Connectors

| Connector | Target | Purpose | Status | Config |
|-----------|--------|---------|--------|--------|
| **GitHub Pages** | Web (static) | Deploy Next.js static export | Active | `.github/workflows/deploy.yml` |
| **Vercel** | Web (SSR) | Alternative web deploy with preview URLs | Documented | `DEPLOYMENT.md` |
| **Render** | API | Deploy Express API | Configured | `render.yaml` |
| **Docker** | API | Containerized API deployment | Configured | `apps/api/Dockerfile` |
| **Expo EAS** | Mobile | iOS/Android builds and submissions | Configured | `apps/mobile/eas.json` |
| **Prisma Migrate** | Database | Schema migrations in production | Active | `apps/api/prisma/` |
| **Neon** | Database | Serverless PostgreSQL hosting | Documented | `DEPLOYMENT.md` |
| **Upstash** | Redis | Serverless Redis hosting | Documented | `DEPLOYMENT.md` |

### Deployment Flow

```
Developer pushes to main
        │
        ├── GitHub Actions: CI (lint + test)
        │         │
        │         ├── Pass → GitHub Pages deploys web
        │         └── Pass → Docker build smoke test
        │
        ├── Render: Auto-deploys API
        │         └── Runs Prisma migrations on start
        │
        └── Vercel (if configured): Auto-deploys web
                  └── Creates preview deploys for PRs
```

---

## 4. Runtime / Application Connectors

| Connector | Package | Purpose | Status | Env Vars |
|-----------|---------|---------|--------|----------|
| **PostgreSQL** | `@prisma/client` | Primary data store | Active | `DATABASE_URL` |
| **Redis** | `ioredis` | Cache, pub/sub | Wired | `REDIS_URL` |
| **Bull Queue** | `bull` | Job queue (notifications, maintenance) | Wired | `REDIS_URL` |
| **Twilio SMS** | `twilio` | Send SMS notifications | Wired | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_FROM` |
| **Twilio WhatsApp** | `twilio` | Send WhatsApp messages | Wired | `TWILIO_WHATSAPP_FROM` |
| **Twilio Voice** | `twilio` | Automated phone calls | Wired | `TWILIO_PHONE_FROM` |
| **Firebase FCM** | `firebase-admin` | Push notifications (mobile/web) | Wired | `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` |
| **SMTP Email** | `nodemailer` | Email notifications | Wired | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| **AES-256-GCM** | `@family-nudge/crypto` | Document encryption at rest | Active | `ENCRYPTION_MASTER_KEY` |
| **JWT** | `jsonwebtoken` | Authentication tokens | Active | `JWT_SECRET` |
| **Cron Scheduler** | `cron` | Periodic checks (reminders, policies) | Active | — |

### Connector Architecture

All external service connectors live in `apps/api/src/connectors/`:

```
connectors/
├── index.ts              # Re-exports + getConnectorStatus()
├── twilio.connector.ts   # SMS, WhatsApp, Voice
├── email.connector.ts    # SMTP via nodemailer
├── firebase.connector.ts # FCM push notifications
├── redis.connector.ts    # Redis client (ioredis)
└── queue.connector.ts    # Bull job queues
```

Each connector:
- Lazily initializes on first use
- Gracefully degrades when not configured (logs a warning, returns `skipped:not_configured`)
- Exposes an `isConfigured()` check
- Is used by `NotificationService` for the escalation flow

---

## 5. Monitoring & Maintenance Connectors

| Connector | Purpose | Status | Endpoint / Config |
|-----------|---------|--------|-------------------|
| **Health endpoint** | Liveness check | Active | `GET /health` |
| **Readiness endpoint** | Deep check (DB + Redis + connectors) | Active | `GET /health/ready` |
| **Pino logger** | Structured JSON logging | Active | All services |
| **Dependabot** | Automated dependency updates | Active | `.github/dependabot.yml` |
| **Sentry** | Error tracking (optional) | Planned | `SENTRY_DSN` env var |

### Health Endpoints

**`GET /health`** — Fast liveness probe for load balancers:
```json
{
  "status": "ok",
  "timestamp": "2026-04-28T19:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600.5
}
```

**`GET /health/ready`** — Deep readiness check with connectivity:
```json
{
  "status": "ready",
  "timestamp": "2026-04-28T19:00:00.000Z",
  "checks": {
    "database": { "status": "ok", "latencyMs": 12 },
    "redis": { "status": "ok", "latencyMs": 3 },
    "notifications": {
      "status": "ok",
      "push_fcm": "not_configured",
      "sms_twilio": "configured",
      "whatsapp_twilio": "configured",
      "voice_twilio": "configured",
      "email_smtp": "configured"
    }
  }
}
```

### Dependabot Schedule

| Ecosystem | Frequency | Scope |
|-----------|-----------|-------|
| npm | Weekly (Monday) | All workspace packages, grouped by prod/dev |
| GitHub Actions | Weekly | Workflow action versions |
| Docker | Monthly | Base image versions |

---

## 6. Continuous Improvement Connectors

| Practice | Connector | How It Works |
|----------|-----------|--------------|
| **Code quality gates** | GitHub Actions CI | Every PR must pass lint + test before merge |
| **Preview deploys** | Vercel | Every PR branch gets a unique preview URL |
| **Dependency freshness** | Dependabot | Auto-creates PRs for outdated deps |
| **Format consistency** | Husky + lint-staged | Pre-commit hook runs Prettier on staged files |
| **Docker validation** | CI docker-build job | Ensures Dockerfile stays buildable |
| **Schema safety** | Prisma Migrate | Database changes are versioned and reviewable |

---

## Environment Variables Reference

```env
# ─── Required ───
DATABASE_URL=postgresql://...
JWT_SECRET=...
ENCRYPTION_MASTER_KEY=...           # 64-char hex string

# ─── Infrastructure (recommended) ───
REDIS_URL=redis://...               # Enables queues + caching
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-app.com

# ─── Twilio (SMS + WhatsApp + Voice) ───
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_FROM=+1...
TWILIO_WHATSAPP_FROM=+1...

# ─── Firebase (Push Notifications) ───
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# ─── Email (SMTP) ───
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@example.com

# ─── Monitoring ───
SENTRY_DSN=https://...@sentry.io/...

# ─── File Storage ───
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50
```

---

## What's Next (Roadmap Items Needing Connectors)

| Feature | Connector Needed | Notes |
|---------|-----------------|-------|
| Google Calendar sync | `googleapis` | OAuth 2.0 flow for calendar read/write |
| OCR for documents | `@google-cloud/vision` or Tesseract | Scan uploaded documents |
| Bill splitting | Stripe / payment connector | If payments are involved |
| Multi-language | `i18next` or similar | Translation management |
| PWA support | Service Worker + Web Push | `web-push` npm package |
| E2E encrypted sharing | `@family-nudge/crypto` extensions | Key exchange protocol |
