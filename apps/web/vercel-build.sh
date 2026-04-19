#!/bin/bash
set -e

# Navigate to monorepo root and install all dependencies
cd ../..
corepack enable
pnpm install --frozen-lockfile || pnpm install

# Build the web app
pnpm --filter @family-nudge/web build
