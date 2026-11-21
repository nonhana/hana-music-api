# ADR 0005: Unbundled Subpaths, Scoped Client, Pure Body Declarations, and Optional Peers

- Status: Accepted (Superseded in part by [ADR-0006](./0006-zero-optional-peers-and-protocol-boundary.md) on optional `peerDependencies`)
- Date: 2026-11-20

## Context

Prior to v7.0.0, `hana-music-api` built its Node/Bun ESM surface with `tsdown` bundling into monolithic chunks (`dist/client.generated-*.js` at 773.3 KB and `dist/client.generated-*.d.ts` at 8.59 MB / 124,943 lines) and exposed only two package entrypoints (`.` and `./watchman`). Several compounding problems affected Serverless consumers (such as Vercel functions), bundlers, and TypeScript editor performance:

1. **Broken tree-shaking and eager initialization**: Every generated module function went through `sdkModuleRegistry` and top-level `createEffectModuleInvoker(...)` calls inside one shared barrel, while runtime state (`runtime.ts`) and `SchemaIssue.makeFormatterDefault()` initialized eagerly at module load. Importing a single pure helper such as `generateDeviceId` pulled 391 files (~2.8 MB).
2. **Oversized dependency tree**: `package.json#dependencies` listed `hono` (only used by the repository's self-hosted HTTP server, never exported by the SDK), `undici` (only used for Node HTTP proxy dispatching), `music-metadata` (only used by `cloud` audio tag extraction), and `qrcode` (only used by `login_qr_create` with `qrimg` and `verify_getQr`).
3. **Excessive Effect tracing**: Published source files imported from the `'effect'` root barrel (`import { Effect, Schema } from 'effect'`), causing static file tracers such as `@vercel/nft` to trace the entire `effect` package (~247–254 files / ~5.2–5.5 MB).
4. **Declaration bloat and internal type leakage**: All 315 `ModuleBody` exports exposed raw Effect `Schema` types (`Schema.StructWithRest`, `Schema.middlewareDecoding`, `MutableJson`) at the root entrypoint, inflating emitted declarations to >8 MB and leaking internal Effect schema ASTs into public `.d.ts` files.

## Decision

As a major breaking release (v7.0.0), restructure the package build, public exports, schema declarations, and dependency boundary around five coordinated invariants:

1. **Unbundled ESM output with compile-time version injection**:
   - Switch `tsdown.config.ts` to `unbundle: true`, emitting discrete ESM `.js` and `.d.ts` files aligned with `package.json#exports`.
   - Inject `__HANA_SERVICE_VERSION__` via `tsdown` `define` so `dist/` contains zero runtime `package.json` imports and single-file Serverless bundles continue performing zero filesystem accesses at cold start.
   - Keep `tsdown.browser.config.ts` and `dist/watchman.{js,d.ts}` unchanged under [ADR-0003](./0003-browser-watchman-boundary.md).
2. **Seven public `package.json#exports` groups and composable `createClient`**:
   - Open `.`, `./api/*`, `./schemas`, `./schemas/*`, `./core`, `./utils`, and `./watchman`.
   - Generate 352 standalone `src/sdk/api/<id>.ts` entrypoints directly referencing their single module and `src/sdk/invoker.ts` (never `sdkModuleRegistry`), wrapped in `/* @__PURE__ */ createStandaloneModuleInvoker(...)` with lazy default context and lazy per-module action validation.
   - Attach each standalone function's `ModuleDefinition` on a non-enumerable internal `Symbol` so `createClient(modules, config)` (exported from `.` and `./core`) binds only the passed module subset with shared `ReadStore`, `identityPool`, and default config, throwing `TypeError` synchronously on invalid config or non-SDK functions.
   - Split zero-Effect utilities (`createOption`, `generateDeviceId`, `isNcmApiResponse`, `getNcmFailureInfo`) into pure modules (`src/core/failure-guards.ts`, `src/core/option-builder.ts`, `src/core/utils.ts`) re-exported by `./utils`, `./core`, and `.`.
3. **Root type/value split and pure Standard Schema v1 declarations**:
   - Root `.` exports all 315 `*Body` schemas and `LoginCellphoneRiskBody` as TypeScript types only (`export type`); runtime Standard Schema v1 validators move to `./schemas`, `./schemas/<id>`, and `./api/<id>`.
   - Wrap every `ModuleBody` in `/* @__PURE__ */ defineModuleBody(...)` returning `BodySchema<CleanUpstreamType<...>>` (a zero-Effect Standard Schema v1 type in `src/types/standard-schema.ts`), storing the underlying Effect Schema in an internal `WeakMap` for `decodeUpstreamBody`. This prevents Effect schema internals (`StructWithRest`, `middlewareDecoding`, `MutableJson`) from leaking into `.d.ts` while preserving exact field types and strict `tsc --strict --skipLibCheck false` compatibility.
4. **Exact `effect/*` subpath imports across the published source graph**:
   - All files under `index.ts`, `src/core/`, `src/modules/`, `src/plugins/`, `src/sdk/`, and `src/types/` must import exact `effect/*` subpaths (e.g., `effect/Effect`, `effect/Schema`) rather than the `'effect'` root barrel, enforced by architecture boundary tests and `dist/` static audits.
5. **Minimal dependency tree with lazy optional `peerDependencies`**:
   - Keep only `effect` in `package.json#dependencies`.
   - Move `hono` to `devDependencies` (self-hosted server remains a repository concern, not an SDK runtime dependency).
   - Move `undici`, `music-metadata`, and `qrcode` to optional `peerDependencies` (`peerDependenciesMeta: { optional: true }`, also retained in `devDependencies` for repository tests and self-hosted runs) and load them dynamically via `src/core/optional-dependency.ts` using a parameterized `import(specifier)` so bundlers do not fail or eagerly inline them when absent:
     - Missing `undici` on Node with `proxy`: rejects with `InvalidRequest` (`status: 400`, `failure.kind === 'invalidRequest'`), instructing installation of `undici`.
     - Missing `qrcode` on `login_qr_create` with `qrimg` or `verify_getQr`: rejects with `ModuleInvariantFailed` (`failure.kind === 'unknown'`), instructing installation of `qrcode` (`login_qr_create` without `qrimg` still succeeds with `qrimg: ''`).
     - Missing `music-metadata` on `cloud`: gracefully falls back to filename and default album/artist metadata.

## Consequences

### Positive

- Unpacked npm tarball shrinks from ~9.56 MB to ~4.01 MB; largest single `.d.ts` drops from 8.59 MB to ~89 KB; largest `.js` chunk drops from 773.3 KB to ~123 KB (and is unused by `./api/*` and `createClient`).
- Pure utility consumers (`hana-music-api/utils` or root `import { generateDeviceId } from 'hana-music-api'`) bundle to ~1.5 KB with zero `effect` files and ~2.6 ms Node cold import.
- Single-endpoint consumers (`hana-music-api/api/song_detail` or root `import { songDetail } from 'hana-music-api'`) pull only the target module and core runtime (~361 KB single-file bundle, ~53 ms Node cold import), eliminating all other 351 modules and all optional heavy dependencies.
- Clean `npm install hana-music-api` installs only `effect`, with zero `hono`, `undici`, `music-metadata`, or `qrcode` in `node_modules`.

### Trade-offs and breaking changes (v7.0.0)

- Consumers that imported runtime `*Body` or `LoginCellphoneRiskBody` values from the root `hana-music-api` entrypoint must update those imports to `hana-music-api/schemas`, `hana-music-api/schemas/<module>`, or `hana-music-api/api/<module>` (`import type` from the root remains valid).
- Consumers using Node HTTP proxies (`proxy`), QR code PNG rendering (`loginQrCreate({ qrimg: true })`, `verifyGetQr`), or audio tag extraction in `cloud` must explicitly install `undici`, `qrcode`, or `music-metadata` respectively.
- Unbundled output increases file count in `dist/` (~2,115 files) while halving total unpacked bytes and dramatically cutting per-entrypoint parse and trace cost.

## Verification

- `bun run build:check` (`publint --strict` and `attw --pack . --profile esm-only`) validates all 7 export groups.
- `tests/behavior/architecture/boundaries.test.ts` enforces exact `effect/*` subpath imports and zero-Effect boundaries.
- `tests/behavior/sdk/scoped-client.test.ts` and `tests/unit/runtime/optional-dependencies.test.ts` verify `createClient` and optional peer fallbacks/errors.
- `tests/package/release.test.ts` verifies both Stage A (clean install with zero optional peers, tree-shaking metafiles, `dist/` static audits, strict `--skipLibCheck false` consumer typechecks across all 7 exports, and zero-FS Serverless bundle) and Stage B (with `music-metadata`, `qrcode`, and `undici` installed, covering full consumer suites and Node proxy forwarding).
