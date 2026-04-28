# Connectors for End-to-End Flow

This document maps every connector needed across the **Development → Testing → Deployment → Maintenance → Improvement** lifecycle of Family Nudge.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT                                     │
│  Docker Compose (Postgres + Redis) · pnpm workspaces · Turborepo      │
│  ESLint · Prettier · TypeScript · Prisma Studio                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          TESTING                                       │
│  Vitest (unit + integration) · Supertest (API) · Playwright (E2E)     │
│  GitHub Actions CI · Coverage reports (Codecov)                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                                      │
│  Vercel (Web) · Render (API) · Neon (Postgres) · Upstash (Redis)      │
│  Expo EAS (Mobile) · GitHub Actions CD · Docker                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       MAINTENANCE                                      │
│  Dependabot · Health checks · Pino structured logging · Sentry        │
│  Uptime monitoring · Backups                                           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       IMPROVEMENTS                                     │
│  Feature flags · Analytics · Performance monitoring · A/B testing     │
│  GitHub Issues / Projects · Codecov trends                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Development Connectors

| Connector | Purpose | Status |
|-----------|---------|--------|
| **pnpm workspaces** | Monorepo package management | ✅ Implemented |
| **Turborepo** | Build pipeline orchestration | ✅ Added (`turbo.json`) |
| **Docker Compose** | Local Postgres 16 + Redis 7 | ✅ Implemented |
| **Prisma ORM** | Database schema, migrations, client generation | ✅ Implemented |
| **TypeScript** | Static type checking across all packages | ✅ Implemented |
| **Prettier** | Code formatting | ✅ Implemented |
| **ESLint** | Linting (Next.js lint for web) | ✅ Partial (web only) |
| **Prisma Studio** | Visual database browser | ✅ Available via `pnpm db:studio` |
| **Environment files** | `.env.example` templates | ✅ Implemented |

---

## 2. Testing Connectors

| Connector | Purpose | Status |
|-----------|---------|--------|
| **Vitest** | Unit and integration test runner for API | ✅ Added (config + sample tests) |
| **Supertest** | HTTP assertion library for Express routes | 🟡 Recommended (add as devDependency) |
| **Playwright** | End-to-end browser testing for web app | 🟡 Recommended for later |
| **GitHub Actions CI** | Automated lint + typecheck + test on PRs | ✅ Added (`ci.yml`) |
| **Codecov** | Test coverage tracking and trends | 🟡 Recommended (add reporter to CI) |
| **Testing Library** | React component testing for web/mobile | 🟡 Recommended for later |

---

## 3. Deployment Connectors

| Connector | Purpose | Status |
|-----------|---------|--------|
| **GitHub Actions CD** | Automated deployment pipelines | ✅ Added (`deploy.yml` improved, `deploy-api.yml` added) |
| **Vercel** | Web app hosting (auto-deploys on push) | ✅ Documented, workflow present |
| **Render** | API hosting with `render.yaml` blueprint | ✅ Implemented |
| **Neon** | Managed PostgreSQL (free tier) | ✅ Documented |
| **Upstash** | Managed Redis (free tier) | ✅ Documented |
| **Expo EAS** | Mobile app builds (iOS + Android) | ✅ Configured (`eas.json`) |
| **Docker** | API containerization | ✅ Dockerfile present |
| **Prisma Migrate** | Production database migrations | ✅ Available via scripts |
| **GitHub Pages** | Static site hosting (landing page fallback) | ✅ Workflow present |

---

## 4. Maintenance Connectors

| Connector | Purpose | Status |
|-----------|---------|--------|
| **Dependabot** | Automated dependency update PRs | ✅ Added (`.github/dependabot.yml`) |
| **Health check endpoint** | `/health` with DB + Redis connectivity check | ✅ Enhanced |
| **Pino structured logging** | JSON logs for production observability | ✅ Implemented |
| **Scheduler service** | Cron jobs for reminders, policies, maintenance | ✅ Wired into `main.ts` |
| **Sentry** | Error tracking and alerting | 🟡 Recommended (add `@sentry/node`) |
| **UptimeRobot / Betterstack** | External uptime monitoring | 🟡 Recommended (free tier available) |
| **pg_dump / Neon branching** | Database backups | 🟡 Neon handles automatically |

---

## 5. Improvement Connectors

| Connector | Purpose | Status |
|-----------|---------|--------|
| **GitHub Issues + Projects** | Feature tracking and sprint planning | 🟡 Recommended |
| **Vercel Analytics** | Web performance and visitor metrics | 🟡 Free tier available |
| **PostHog / Mixpanel** | Product analytics and feature usage | 🟡 Recommended |
| **Feature flags (Unleash/LaunchDarkly)** | Gradual feature rollouts | 🟡 Recommended for later |
| **Codecov trends** | Track test coverage improvement over time | 🟡 Ties into CI |
| **Lighthouse CI** | Performance regression detection | 🟡 Recommended |

---

## 6. Notification Channel Connectors (Application-Level)

These are the external service integrations for the notification escalation feature:

| Connector | Purpose | Status |
|-----------|---------|--------|
| **Firebase Cloud Messaging** | Push notifications (mobile + web) | 🔴 Stub only — needs `firebase-admin` |
| **Twilio SMS** | SMS notifications | 🔴 Stub only — needs `twilio` package |
| **Twilio WhatsApp** | WhatsApp messages | 🔴 Stub only — needs `twilio` package |
| **Twilio Voice** | Automated phone calls | 🔴 Stub only — needs `twilio` package |
| **Nodemailer / SMTP** | Email notifications | 🔴 Stub only — needs `nodemailer` |
| **Bull + Redis** | Background job queue for notifications | 🔴 Dependencies present but unused |

> These are intentionally left as stubs until third-party credentials are configured.
> See `DEPLOYMENT.md` → "Pending Configuration" for setup instructions.

---

## Connector Dependency Map

```
GitHub Actions ─── triggers ───▶ Vercel (web deploy)
      │                         ▶ Render (API deploy)
      │
      ├── runs ──▶ Vitest (tests)
      ├── runs ──▶ TypeScript (typecheck)
      ├── runs ──▶ ESLint/Prettier (lint)
      │
Dependabot ─── creates PRs ───▶ GitHub Actions CI (auto-validates)
      │
Health Check ◀── monitors ──── UptimeRobot (external)
      │
Prisma ─── connects ──▶ Neon PostgreSQL
Bull ──── connects ──▶ Upstash Redis
Pino ──── outputs ───▶ Render logs / Sentry
```

---

## Quick Start for New Contributors

1. **Clone + Install**: `git clone ... && pnpm install`
2. **Start infra**: `docker compose up -d` (Postgres + Redis)
3. **Setup DB**: `pnpm db:generate && pnpm db:push`
4. **Run dev**: `pnpm dev` (starts API on :4000, Web on :3000)
5. **Run tests**: `pnpm test`
6. **Push code**: CI runs automatically on PR

All CI/CD pipelines are defined in `.github/workflows/`. See `DEPLOYMENT.md` for production setup.
