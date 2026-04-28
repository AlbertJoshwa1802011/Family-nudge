# Agent Memory

This file is the durable project notebook for important context learned from
conversations and implementation work. Keep it short, factual, and useful to
future agents.

## How to use this file

- Add information only when it is expected to matter beyond the current task.
- Prefer stable facts over temporary observations.
- Update or remove stale entries when the project changes.
- Do not store secrets, credentials, private user data, or raw chat transcripts.
- Preserve existing entries unless they are clearly superseded.

## Product intent

- Family Nudge is a smart family management platform for reminders, encrypted
  document storage, insurance/warranty tracking, and household maintenance.
- The product is intended to reduce recurring family admin work by combining
  reminders, documents, and policy/maintenance tracking in one place.

## Repository shape

- Monorepo managed with pnpm workspaces and Turborepo.
- Backend API: `apps/api` using Express, TypeScript, Prisma, PostgreSQL, Redis,
  and Bull.
- Web app: `apps/web` using Next.js, React, and Tailwind CSS.
- Mobile app: `apps/mobile` using React Native and Expo.
- Shared package: `packages/shared` for types, constants, and validators.
- Crypto package: `packages/crypto` for encryption, hashing, and key management.

## Commands

- Install dependencies: `pnpm install`
- Run all development servers: `pnpm dev`
- Build all packages/apps: `pnpm build`
- Lint all packages/apps: `pnpm lint`
- Run tests: `pnpm test`
- Generate Prisma client: `pnpm db:generate`
- Push Prisma schema to the database: `pnpm db:push`

## Engineering preferences

- Follow the existing TypeScript style and package boundaries.
- Prefer shared DTOs/types in `packages/shared` when behavior crosses API,
  web, or mobile boundaries.
- Keep sensitive document handling aligned with the existing encrypted vault and
  audit-log model.
- Avoid adding dependencies unless they meaningfully reduce complexity.

## User preferences

- The user wants a NotebookLM-like memory workflow where important chat-derived
  context is monitored and captured automatically for future work.

## Decisions

- Use this file as the canonical project memory notebook for coding agents.
- Use `AGENTS.md` and `.cursor/rules/agent-memory.mdc` to instruct agents to
  read and maintain this notebook during future tasks.

## Open questions

- If the product later adds an in-app chat or LLM assistant, decide whether
  user-visible memories should live in the database with explicit user controls
  for review, deletion, and privacy.
