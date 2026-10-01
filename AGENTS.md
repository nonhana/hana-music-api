# hana-music-api

A TypeScript rewrite/evolution of `netease-cloud-music-api` / `UnblockNeteaseMusic` legacy.
Ships a Promise-based Node.js SDK (`"private": false`) and a Bun/Hono HTTP server.

## Commands

- Dev: `bun run dev` (bun --watch)
- Start: `bun run start`
- Test: `bun test tests/unit tests/contract tests/integration` (bun:test); live suite: `bun run test:live` (gated by `LIVE_UPSTREAM`)
- Lint: `bun run lint` (oxlint)
- Format: `bun run fmt` (oxfmt)
- Type check: `bun run typecheck` (tsc --noEmit)
- Spell: `bun run spell` (cspell; dictionary in `.cspell/project-words.txt`)
- Full verify: `bun run verify`

## Stack

- Runtime: **Bun** (dev & prod)
- HTTP: **Hono** (routing, middleware, request/response)
- Lang: **TypeScript 7** (strict: `noUncheckedIndexedAccess`, `noImplicitOverride`; ESNext target)
- Core: **Effect 4.0.0-rc.117**, internal only; public SDK contracts remain Promise-based
- Tooling: **oxlint** + **oxfmt** (no ESLint / Prettier)
- Testing: **bun:test** + `tests/_kit` (Effect-native helpers; `Effect.run*`/`provide` converge at the kit single point)

## Project Structure

```txt
index.ts          — Public entry point (exports programmatic API)
src/app/          — CLI, server startup, config generation
src/server/       — Hono app, routes, module dispatching, cookie/body parsing
src/core/         — Crypto (weapi/eapi/linuxapi), HTTP request, runtime state, cache, config
src/modules/      — Netease API modules (one file per endpoint)
src/plugins/      — Plugin capabilities (e.g. song upload)
src/types/        — Shared TS types
tests/            — Layered test suite:
                    tests/_kit/        — shared Effect test kit (runEffect/runExit, clientLayer, assertions)
                    tests/contract/    — SDK/module contract tests
                    tests/unit/        — unit tests (crypto, request, core)
                    tests/integration/ — server & module integration tests
                    tests/live/        — live upstream tests (gated by LIVE_UPSTREAM; not in verify, not a regression baseline)
                    tests/load/        — load tests; tests/fixtures/ — shared fixtures
```

## Architecture Constraints

1. **Hono is the HTTP layer** — routing, middleware, cookie/header coordination. Do **not** let Hono leak into `src/core/`; core must stay testable without Hono context.
2. **Module pattern** — each endpoint in `src/modules/` declares a local `ModuleInput`, exports `decodeModuleInput`, and exports a default `ModuleEffect<ModuleInput>` using `RequestCapability`. Responses use dynamic `ModuleResponse` bodies. Legacy cookie behavior (header Cookie → query/body override → HTTPS SameSite=None;Secure) is preserved in `src/server/routes.ts`.
3. **Rewrite priorities** — (1) crypto & request core, (2) Hono server layer, (3) high-frequency modules, (4) rest. **Behavior alignment with legacy is more important than abstraction elegance.**

## Boundaries

- `index.ts` is the public API surface — don't dump implementation there
- Never modify `.codegraph/`, `.omx/` state files, or `node_modules/`
- Never commit `.env` files
- No mock databases in tests — use test database

## Done criteria

- `bun run verify`, `bun run verify:sdk`, and `bun run build:check` pass. Run these serially because packaging shares output paths.
- For request/traffic changes, run `bun run test:load:smoke`; final traffic acceptance also requires the 10-minute `bun run test:load:soak` against loopback only.
- Commit only when explicitly authorized by the user, using conventional commit messages.
- Crypto/request tests pass (highest risk area)

## Simplicity Rules

- **WRITE THE MINIMAL SOLUTION.** A feature should be implemented in the simplest way that works. Do not add abstractions, configurability, or indirection that is not needed right now.
- **ONE CALLER = NO ABSTRACTION.** Do not extract a function/class/interface until there is at least 3+ callers requiring it.
- **NO DEFENSIVE CODING BEYOND THE SPEC.** Do not add null checks, type guards, error recovery, or fallback logic for cases not described in the requirements.
- **NO UNREQUESTED FEATURES.** Every line of code must be justified by the current task. Do not "future-proof".
- **NO REFORMATTING / RENAMING SIDE EFFECTS.** Only touch the lines that need to change.
- **TARGET DIFF SIZE: < 50 lines per feature.** If the diff is larger, you are over-engineering.
- **BEFORE CODING:** State your plan in 2-3 sentences. If it sounds like too much, it is.
