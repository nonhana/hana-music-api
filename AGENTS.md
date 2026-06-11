# hana-music-api

A TypeScript rewrite/evolution of `netease-cloud-music-api` / `UnblockNeteaseMusic` legacy.
Runs as an HTTP API server, **not** an npm library (`"private": true`).

## Commands

- Dev: `bun run dev` (bun --watch)
- Start: `bun run start`
- Test: `bun test` (bun:test)
- Lint: `bun run lint` (oxlint)
- Format: `bun run fmt` (oxfmt)
- Type check: `bun run typecheck` (tsc --noEmit)
- Full verify: `bun run verify`

## Stack

- Runtime: **Bun** (dev & prod)
- HTTP: **Hono** (routing, middleware, request/response)
- Lang: **TypeScript 6** (strict: `noUncheckedIndexedAccess`, `noImplicitOverride`; ESNext target)
- Tooling: **oxlint** + **oxfmt** (no ESLint / Prettier)
- Testing: **bun:test**

## Project Structure

```txt
index.ts          — Public entry point (exports programmatic API)
src/app/          — CLI, server startup, config generation
src/server/       — Hono app, routes, module dispatching, cookie/body parsing
src/core/         — Crypto (weapi/eapi/linuxapi), HTTP request, runtime state, cache, config
src/modules/      — Netease API modules (one file per endpoint)
src/plugins/      — Plugin capabilities (e.g. song upload)
src/types/        — Shared TS types
tests/            — Crypto, request, server, module integration
```

## Architecture Constraints

1. **Hono is the HTTP layer** — routing, middleware, cookie/header coordination. Do **not** let Hono leak into `src/core/`; core must stay testable without Hono context.
2. **Module pattern** — each file in `src/modules/` exports a default async `(query, request) => NcmApiResponse` using `normalizeLegacyModuleResponse`. Legacy cookie behavior (header Cookie → query/body override → HTTPS SameSite=None;Secure) is preserved in `src/server/routes.ts`.
3. **Rewrite priorities** — (1) crypto & request core, (2) Hono server layer, (3) high-frequency modules, (4) rest. **Behavior alignment with legacy is more important than abstraction elegance.**

## Boundaries

- `index.ts` is the public API surface — don't dump implementation there
- Never modify `.codegraph/`, `.omx/` state files, or `node_modules/`
- Never commit `.env` files
- No mock databases in tests — use test database

## Done criteria

- `bun run verify` passes (`types:modules:check && test && typecheck && lint && fmt:check && docs:build`)
- Changed files committed with conventional commit messages
- Crypto/request tests pass (highest risk area)

## Simplicity Rules

- **WRITE THE MINIMAL SOLUTION.** A feature should be implemented in the simplest way that works. Do not add abstractions, configurability, or indirection that is not needed right now.
- **ONE CALLER = NO ABSTRACTION.** Do not extract a function/class/interface until there is at least 3+ callers requiring it.
- **NO DEFENSIVE CODING BEYOND THE SPEC.** Do not add null checks, type guards, error recovery, or fallback logic for cases not described in the requirements.
- **NO UNREQUESTED FEATURES.** Every line of code must be justified by the current task. Do not "future-proof".
- **NO REFORMATTING / RENAMING SIDE EFFECTS.** Only touch the lines that need to change.
- **TARGET DIFF SIZE: < 50 lines per feature.** If the diff is larger, you are over-engineering.
- **BEFORE CODING:** State your plan in 2-3 sentences. If it sounds like too much, it is.
