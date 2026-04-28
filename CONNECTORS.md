# Connectors for End-to-End Flow

This document maps every connector (integration, tool, or service) needed to support the full software lifecycle: **Development → Testing → Deployment → Maintenance → Improvements**.

---

## Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ DEVELOPMENT  │───▶│   TESTING    │───▶│  DEPLOYMENT  │───▶│ MAINTENANCE  │───▶│ IMPROVEMENTS │
│              │    │              │    │              │    │              │    │              │
│ Monorepo     │    │ CI Pipeline  │    │ Vercel       │    │ Dependabot   │    │ GitHub       │
│ Docker       │    │ Vitest       │    │ Render       │    │ Sentry       │    │ PR Templates │
│ Prisma       │    │ Lint         │    │ Neon DB      │    │ Health Check │    │ Analytics    │
│ pnpm + Turbo │    │ Type Check   │    │ Upstash      │    │ Logging      │    │ Feature Flags│
│ Redis        │    │ E2E (future) │    │ EAS (mobile) │    │ Backups      │    │ A/B Testing  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## Phase 1: Development

These connectors support local development and coding workflows.

| Connector | Status | Purpose | Config File |
|-----------|--------|---------|-------------|
| **pnpm Workspaces** | ✅ Active | Monorepo package management | `pnpm-workspace.yaml` |
| **Turborepo** | ✅ Added | Build orchestration, caching, parallel tasks | `turbo.json` |
| **Docker Compose** | ✅ Active | Local PostgreSQL 16 + Redis 7 | `docker-compose.yml` |
| **Prisma ORM** | ✅ Active | Database schema, migrations, type-safe queries | `apps/api/prisma/schema.prisma` |
| **TypeScript** | ✅ Active | Type safety across all packages | `tsconfig.base.json` |
| **Prettier** | ✅ Active | Code formatting | root `package.json` format script |
| **ESLint / Next Lint** | ✅ Active | Web app linting | `apps/web` |
| **Hot Reload (tsx)** | ✅ Active | API dev server with file watching | `apps/api` dev script |
| **Expo Dev Server** | ✅ Active | Mobile app development | `apps/mobile` |

### Still Needed for Development

| Connector | Priority | Purpose |
|-----------|----------|---------|
| **Husky + lint-staged** | Medium | Pre-commit hooks to enforce lint/format |
| **Commitlint** | Low | Enforce conventional commit messages |
| **Docker Dev Container** | Low | Reproducible dev environment via `.devcontainer/` |

---

## Phase 2: Testing

These connectors validate code correctness before it reaches production.

| Connector | Status | Purpose | Config File |
|-----------|--------|---------|-------------|
| **GitHub Actions CI** | ✅ Added | Automated lint, build, test on every PR | `.github/workflows/ci.yml` |
| **Vitest** | ✅ Added | Unit/integration tests for the API | `apps/api/vitest.config.ts` |
| **CI Postgres Service** | ✅ Added | Ephemeral test database in CI | `.github/workflows/ci.yml` |
| **CI Redis Service** | ✅ Added | Ephemeral Redis for queue tests in CI | `.github/workflows/ci.yml` |

### Still Needed for Testing

| Connector | Priority | Purpose |
|-----------|----------|---------|
| **Playwright / Cypress** | High | End-to-end browser tests for `apps/web` |
| **Supertest** | High | HTTP-level API integration tests |
| **Detox / Maestro** | Medium | Mobile E2E tests for `apps/mobile` |
| **Codecov / Coveralls** | Medium | Test coverage reporting and tracking |
| **GitHub Actions Matrix** | Low | Test across Node 20 and Node 22 |

---

## Phase 3: Deployment

These connectors ship code to production environments.

| Connector | Status | Purpose | Config File |
|-----------|--------|---------|-------------|
| **Vercel** | ✅ Configured | Web frontend hosting with preview deploys | `apps/web/vercel.json` |
| **GitHub Pages** | ✅ Active | Static export fallback deploy | `.github/workflows/deploy.yml` |
| **Render** | ✅ Configured | API backend hosting (with DB migration) | `render.yaml` |
| **Neon** | 📝 Documented | Managed PostgreSQL (free tier) | `DEPLOYMENT.md` |
| **Upstash** | 📝 Documented | Managed Redis (free tier) | `DEPLOYMENT.md` |
| **Expo EAS** | ✅ Configured | Mobile app builds and store submissions | `apps/mobile/eas.json` |
| **Docker** | ✅ Available | API containerization | `apps/api/Dockerfile` |

### Still Needed for Deployment

| Connector | Priority | Purpose |
|-----------|----------|---------|
| **Prisma Migrate (production)** | ✅ Done | Safe schema migrations (now in `render.yaml` start command) |
| **GitHub Environments** | Medium | Environment-level secrets and approvals for staging/prod |
| **Staging Environment** | Medium | Pre-production validation environment |
| **CDN (CloudFront/Cloudflare)** | Low | Edge caching for API responses and static assets |
| **Container Registry** | Low | Push API Docker images for Kubernetes/ECS |

---

## Phase 4: Maintenance

These connectors keep the running system healthy and secure.

| Connector | Status | Purpose | Config File |
|-----------|--------|---------|-------------|
| **Dependabot** | ✅ Added | Automated dependency updates (npm + GitHub Actions) | `.github/dependabot.yml` |
| **Health Check Endpoint** | ✅ Enhanced | `/health` now validates DB connectivity | `apps/api/src/main.ts` |
| **Sentry (Error Tracking)** | ✅ Scaffolded | Capture & report production errors | `apps/api/src/lib/error-tracking.ts` |
| **Pino Logging** | ✅ Active | Structured JSON logging | `apps/api/src/main.ts` |
| **Background Scheduler** | ✅ Fixed | Cron jobs for reminders, policies, maintenance | `apps/api/src/services/scheduler.service.ts` |

### Still Needed for Maintenance

| Connector | Priority | Purpose |
|-----------|----------|---------|
| **Uptime Monitor (UptimeRobot/Checkly)** | High | External health monitoring and alerting |
| **Log Aggregation (Datadog/Logtail)** | High | Centralized log search and dashboards |
| **Database Backups** | High | Scheduled backups for Neon/PostgreSQL |
| **Renovate** | Medium | Alternative to Dependabot with more config flexibility |
| **Security Scanning (Snyk/Trivy)** | Medium | Vulnerability detection in dependencies and Docker images |
| **Rate Limiting** | Medium | Protect API from abuse (express-rate-limit) |
| **Key Rotation Automation** | Medium | Rotate JWT_SECRET and ENCRYPTION_MASTER_KEY periodically |

---

## Phase 5: Improvements

These connectors support iterative development and feature evolution.

| Connector | Status | Purpose | Config File |
|-----------|--------|---------|-------------|
| **PR Template** | ✅ Added | Structured pull request descriptions | `.github/PULL_REQUEST_TEMPLATE.md` |
| **GitHub Issues/Projects** | 📝 Available | Task tracking and roadmap management | GitHub UI |

### Still Needed for Improvements

| Connector | Priority | Purpose |
|-----------|----------|---------|
| **Feature Flags (LaunchDarkly/Unleash)** | Medium | Toggle features without deploying |
| **Analytics (PostHog/Mixpanel)** | Medium | User behavior tracking for data-driven decisions |
| **A/B Testing** | Low | Experiment with UI/UX changes |
| **GitHub Discussions** | Low | Community feedback and feature requests |
| **Changelog Generator** | Low | Auto-generate changelogs from conventional commits |
| **Performance Monitoring (Web Vitals)** | Medium | Track and improve web performance |
| **API Documentation (Swagger/OpenAPI)** | Medium | Auto-generated interactive API docs |

---

## Notification Connectors (Cross-Cutting)

These are critical for the product's core feature — escalating notifications.

| Connector | Status | Purpose | Env Vars |
|-----------|--------|---------|----------|
| **Firebase Cloud Messaging** | 🔲 Stub | Push notifications (mobile + web) | `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` |
| **Twilio SMS** | 🔲 Stub | SMS notifications | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_FROM` |
| **Twilio WhatsApp** | 🔲 Stub | WhatsApp messages | `TWILIO_WHATSAPP_FROM` |
| **Twilio Voice** | 🔲 Stub | Automated phone calls | Same as SMS |
| **SMTP (Nodemailer)** | 🔲 Stub | Email notifications | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| **Web Push API** | 🔲 Not started | Browser push notifications | VAPID keys |

To activate any notification connector:
1. Install the required package (`twilio`, `firebase-admin`, `nodemailer`, `web-push`)
2. Set the environment variables listed above
3. Uncomment the integration code in `apps/api/src/services/notification.service.ts`

---

## Quick Reference: What's Configured vs What Needs Work

### ✅ Configured and Working
- pnpm workspaces, Turborepo, Docker Compose, Prisma, TypeScript
- GitHub Actions CI (lint + build + test pipeline)
- Vitest test runner with test setup
- Vercel deployment config, Render deployment config
- Dependabot for dependency updates
- Health check with database validation
- Scheduler (now wired into server startup)
- Error tracking scaffold (Sentry-ready)
- PR template for structured contributions

### 🔲 Needs Implementation (High Priority)
- **Twilio integration** — uncomment code and add credentials
- **Firebase push** — install `firebase-admin` and implement
- **E2E tests** — add Playwright for web, Supertest for API
- **Uptime monitoring** — set up external health check pings
- **Log aggregation** — route Pino logs to a central service

### 📝 Documented, Ready to Activate
- Neon (managed PostgreSQL) — needs `DATABASE_URL` swap
- Upstash (managed Redis) — needs `REDIS_URL` swap
- EAS mobile builds — needs project ID and Apple credentials
- Sentry error tracking — needs `SENTRY_DSN`
- SMTP email — needs mail server credentials
