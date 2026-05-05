# Project: erichugy-portfolio

## Package Manager

**pnpm** — this is a pnpm workspace monorepo. Never use `npm` or `yarn`.

- Install deps: `pnpm install` (root) or `pnpm add <pkg> --filter web` (workspace)
- The `packageManager` field in `package.json` enforces pnpm@10.11.0
- Lockfile: `pnpm-lock.yaml` (root) — never commit `package-lock.json` or `yarn.lock`

## Structure

```
apps/web/          Next.js frontend (deployed to Vercel)
apps/gateway/      Go API gateway
services/          Backend services
```

## Build & Deploy

- Build: `pnpm run build` (runs turbo)
- Dev: `pnpm run dev`
- Deployed on Vercel — builds use `pnpm install`

## Agents

See `apps/web/AGENTS.md` for web app coding conventions, directory structure, and type patterns.
