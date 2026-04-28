# Connectors — End-to-End Flow Support

This document maps every connector needed for a complete development → testing → deployment → maintenance → improvement lifecycle for Family Nudge.

---

## Overview by Lifecycle Phase

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Development │────▶│   Testing   │────▶│  Deployment  │────▶│ Maintenance  │────▶│ Improvements │
│             │     │             │     │              │     │              │     │              │
│ • Redis     │     │ • Vitest    │     │ • Vercel     │     │ • Dependabot │     │ • Sentry     │
│ • Postgres  │     │ • Supertest │     │ • Render     │     │ • Health API │     │ • Analytics  │
│ • Firebase  │     │ • CI matrix │     │ • Neon       │     │ • Scheduler  │     │ • FCM tokens │
│ • Twilio    │     │ • Docker    │     │ • Upstash    │     │ • Bull queue │     │ • Monitoring │
│ • SMTP      │     │   Compose   │     │ • Docker     │     │ • Logging    │     │              │
│ • Bull      │     │             │     │ • GH Pages   │     │              │     │              │
└─────────────┘     └─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 1. Development Connectors

### Database — PostgreSQL via Prisma

| Item | Status | Details |
|------|--------|---------|
| Prisma ORM | ✅ Wired | `apps/api/src/lib/prisma.ts` |
| Docker Compose | ✅ Ready | `docker-compose.yml` — Postgres 16 on port 5432 |
| Migrations | ✅ Ready | `pnpm db:migrate`, `pnpm db:push` |
| Env var | `DATABASE_URL` | Required |

### Cache / Queue — Redis + Bull

| Item | Status | Details |
|------|--------|---------|
| Redis client | ✅ Wired | `apps/api/src/lib/redis.ts` — lazy connect, retry logic |
| Bull queue | ✅ Wired | `apps/api/src/lib/queue.ts` — notification job queue |
| Docker Compose | ✅ Ready | `docker-compose.yml` — Redis 7 on port 6379 |
| Graceful fallback | ✅ | Falls back to direct dispatch if Redis unavailable |
| Env var | `REDIS_URL` | Optional (degrades gracefully) |

### Notifications — Twilio (SMS, WhatsApp, Voice)

| Item | Status | Details |
|------|--------|---------|
| Twilio client | ✅ Wired | `apps/api/src/lib/twilio.ts` — lazy init |
| SMS sending | ✅ Wired | `notification.service.ts` → `twilio.messages.create()` |
| WhatsApp | ✅ Wired | `notification.service.ts` → WhatsApp channel |
| Voice calls | ✅ Wired | `notification.service.ts` → TwiML voice |
| Env vars | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_FROM`, `TWILIO_WHATSAPP_FROM` | Required for SMS/WhatsApp/Voice |

### Notifications — Email (SMTP / Nodemailer)

| Item | Status | Details |
|------|--------|---------|
| Nodemailer transport | ✅ Wired | `apps/api/src/lib/email.ts` — SMTP with TLS |
| Email sending | ✅ Wired | `notification.service.ts` → `sendEmail()` |
| Env vars | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Required for email |

### Notifications — Push (Firebase Cloud Messaging)

| Item | Status | Details |
|------|--------|---------|
| Firebase Admin SDK | ✅ Wired | `apps/api/src/lib/firebase.ts` — lazy init |
| FCM dispatch | ⚠️ Partial | Firebase initialized; device token storage needed |
| Env vars | `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` | Required for push |

### Scheduler — Cron Jobs

| Item | Status | Details |
|------|--------|---------|
| Cron jobs | ✅ Wired | `scheduler.service.ts` — started from `main.ts` |
| Due reminders | ✅ | Every 15 minutes |
| Expiring policies | ✅ | Daily at 9 AM |
| Overdue maintenance | ✅ | Daily at 8 AM |

---

## 2. Testing Connectors

### Unit / Integration Tests

| Item | Status | Details |
|------|--------|---------|
| Vitest | ✅ Configured | `apps/api/vitest.config.ts` |
| Supertest | ✅ Added | HTTP endpoint testing |
| Coverage (v8) | ✅ Configured | `@vitest/coverage-v8` |
| Test setup | ✅ | `apps/api/src/__tests__/setup.ts` |
| Sample tests | ✅ | `health.test.ts`, `auth.test.ts`, `notification.service.test.ts` |

### CI Test Infrastructure

| Item | Status | Details |
|------|--------|---------|
| Postgres service | ✅ | CI job spins up Postgres 16 container |
| Redis service | ✅ | CI job spins up Redis 7 container |
| Test docker-compose | ✅ | `docker-compose.test.yml` on ports 5433/6380 |
| Coverage upload | ✅ | Artifact uploaded in CI |

---

## 3. Deployment Connectors

### CI/CD Pipeline (GitHub Actions)

| Item | Status | Details |
|------|--------|---------|
| Lint + Typecheck | ✅ | `.github/workflows/ci.yml` |
| API tests | ✅ | Runs with Postgres + Redis services |
| Build all | ✅ | Full monorepo build |
| Docker build | ✅ | API Docker image on `main` push |
| Deploy web | ✅ | GitHub Pages static export |
| Concurrency | ✅ | Cancel in-progress for same ref |

### Web — Vercel

| Item | Status | Details |
|------|--------|---------|
| `vercel.json` | ✅ Added | `apps/web/vercel.json` — framework, build, rewrites |
| Auto-deploy | ✅ | Push to `main` → production; PR → preview |
| Env var | `NEXT_PUBLIC_API_URL` | Set in Vercel dashboard |

### API — Render

| Item | Status | Details |
|------|--------|---------|
| `render.yaml` | ✅ Exists | Blueprint for Express API |
| Auto-deploy | ✅ | Push to `main` triggers deploy |
| Env vars | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `ENCRYPTION_MASTER_KEY` | Set in Render dashboard |

### API — Docker

| Item | Status | Details |
|------|--------|---------|
| Dockerfile | ✅ Exists | `apps/api/Dockerfile` — multi-stage build |
| CI build | ✅ | Docker image built on `main` push |

### Database — Neon (Managed Postgres)

| Item | Status | Details |
|------|--------|---------|
| Connection | ✅ | `DATABASE_URL` with SSL |
| Schema push | ✅ | `prisma db push` on deploy |

### Redis — Upstash (Managed Redis)

| Item | Status | Details |
|------|--------|---------|
| Connection | ✅ | `REDIS_URL` with TLS |

### Mobile — Expo/EAS

| Item | Status | Details |
|------|--------|---------|
| EAS config | ✅ Exists | `apps/mobile/eas.json` |
| Build commands | ✅ | `eas build --platform android/ios` |

---

## 4. Maintenance Connectors

### Dependency Management

| Item | Status | Details |
|------|--------|---------|
| Dependabot | ✅ Added | `.github/dependabot.yml` — npm weekly, actions weekly, Docker monthly |
| Grouped updates | ✅ | Dev deps grouped; prod patch only |
| pnpm lockfile | ✅ | `--frozen-lockfile` in CI |

### Health Monitoring

| Item | Status | Details |
|------|--------|---------|
| Health endpoint | ✅ Enhanced | `GET /health` — checks DB, Redis, Twilio, SMTP, Firebase |
| Service status | ✅ | Returns `connected`/`disconnected`/`not_configured` per service |
| Uptime | ✅ | Reports `process.uptime()` |
| Degraded mode | ✅ | Returns 503 if database is down |

### Logging

| Item | Status | Details |
|------|--------|---------|
| Structured logging | ✅ | Pino JSON logger across all services |
| Request logging | ✅ | Method, URL, status, duration |
| Pretty dev logs | ✅ | `pino-pretty` in development |

### Code Quality

| Item | Status | Details |
|------|--------|---------|
| Prettier | ✅ | `pnpm format` / `pnpm format:check` |
| TypeScript strict | ✅ | `tsconfig.base.json` strict mode |
| PR template | ✅ Added | `.github/PULL_REQUEST_TEMPLATE.md` |
| Turborepo | ✅ Added | `turbo.json` — build/dev/lint/test/typecheck pipelines |

---

## 5. Improvement Connectors

### Error Tracking (Sentry — recommended)

| Item | Status | Details |
|------|--------|---------|
| Env vars | ✅ Documented | `SENTRY_DSN`, `SENTRY_ENVIRONMENT` in `.env.example` |
| SDK integration | 🔲 Not yet | Install `@sentry/node` and wrap Express error handler |

### Analytics (recommended additions)

| Item | Status | Details |
|------|--------|---------|
| PostHog / Mixpanel | 🔲 Not yet | Product analytics for feature usage tracking |
| Web Vitals | 🔲 Not yet | Next.js built-in `reportWebVitals` |

### Feature Flags (recommended)

| Item | Status | Details |
|------|--------|---------|
| LaunchDarkly / Unleash | 🔲 Not yet | Gradual rollouts, A/B testing |

---

## Environment Variables Summary

```bash
# ─── Required ───
DATABASE_URL=                    # PostgreSQL connection string
JWT_SECRET=                      # JWT signing secret
ENCRYPTION_MASTER_KEY=           # AES-256 document encryption key

# ─── Optional (graceful degradation) ───
REDIS_URL=                       # Redis for Bull queue + caching
TWILIO_ACCOUNT_SID=              # SMS, WhatsApp, Voice
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_FROM=
TWILIO_WHATSAPP_FROM=
SMTP_HOST=                       # Email notifications
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
FIREBASE_PROJECT_ID=             # Push notifications (FCM)
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
SENTRY_DSN=                      # Error tracking
SENTRY_ENVIRONMENT=

# ─── App Config ───
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50
```

---

## Quick Start (Development)

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Configure
cp .env.example .env
# Edit .env with your values

# 3. Setup database
pnpm db:generate && pnpm db:push

# 4. Run everything
pnpm dev

# 5. Run tests
docker compose -f docker-compose.test.yml up -d
pnpm test
```
