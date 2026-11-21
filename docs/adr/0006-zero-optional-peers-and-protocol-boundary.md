# ADR 0006: Zero Optional Peers and Strict Protocol Boundary

- Status: Accepted
- Date: 2026-11-21
- Updates: [ADR-0005](./0005-unbundled-subpaths-and-optional-peers.md) (supersedes §5 optional `peerDependencies` design)

## Context

In v7.0.0 ([ADR-0005](./0005-unbundled-subpaths-and-optional-peers.md)), `undici`, `music-metadata`, and `qrcode` were moved from `dependencies` to optional `peerDependencies` loaded dynamically via `src/core/optional-dependency.ts` using parameterized `import(specifier)`. While this kept `effect` as the sole required runtime dependency, operating experience with real downstream Serverless bundlers (such as Vite/Rollup/Nitro/@vercel/nft on Vercel) exposed four structural flaws:

1. **Non-protocol responsibilities inside an HTTP protocol SDK**:
   - `qrcode` encoded Base64 PNG images (a UI/presentation concern) inside protocol modules (`login_qr_create`, `verify_getQr`), even though NetEase's protocol only supplies or constructs the login/verification URL (`qrurl`) and ticket (`qrCode`).
   - `music-metadata` parsed binary audio ID3/FLAC frames locally inside `cloud`, pulling a large parser tree and failing silently/opaquely for tags callers often already know or extract in media pipelines.
   - `undici` implemented Node-only HTTP `ProxyAgent` transport branching inside `src/core/transport.ts`, even though `hana-music-api` already exposes `config.fetcher` for full transport dependency injection.
2. **Bundler tracer friction**: Static dependency tracers (`@vercel/nft`, Vite SSR externalization) treat parameterized `import(specifier)` inside `dist/` cautiously, requiring downstream apps to invent bundler plugins, `noExternal` overrides, or virtual stubs to ensure optional peers are either pruned or traced correctly in standalone Serverless outputs.
3. **Peer dependency noise**: Package managers (`npm`, `pnpm`, `yarn`, `knip`) surface optional peer resolution rules and peer tree variance for packages the majority of SDK consumers never use.
4. **Hidden runtime divergence**: `proxy` behaved differently across Bun (`Bun.fetch` non-standard `{ proxy }`) and Node (`undici` `ProxyAgent` created/destroyed per attempt).

## Decision

Remove all optional `peerDependencies`, `peerDependenciesMeta`, and `src/core/optional-dependency.ts` completely, establishing a strict protocol-and-transport boundary:

1. **Zero `peerDependencies` (`effect` only in `dependencies`)**:
   - Delete `src/core/optional-dependency.ts`.
   - Remove `peerDependencies` and `peerDependenciesMeta` from `package.json`.
   - Remove `music-metadata`, `qrcode`, and `undici` from `tsdown.config.ts` `neverBundle` (leaving `['bun', 'effect']`).
   - Remove `music-metadata` from `devDependencies`. Retain `undici` (repository test offline guard and Node proxy `fetcher` verification) and `qrcode` / `@types/qrcode` (repository demo route `GET /demo/qr-login/image` only, never imported in `dist/`).
2. **Transport injection replaces built-in `proxy` (`undici`)**:
   - Remove `proxy` from `ModuleCallConfig`, `CreateRequestOptions`, `createOption`, `ExecutionScope`, `TransportOptions`, and `src/core/transport.ts`.
   - Move `'proxy'` into `removedModuleConfigKeys` and keep `'proxy'?: never` in `DisallowExecutionKeys`, plus reject `Object.hasOwn(options, 'proxy')` in `createRequest`, so any runtime or type-level caller still passing `proxy` receives an explicit `400` / `InvalidRequest` (`InvalidRequest` / `TypeError` in client constructors) rather than silently connecting directly without a proxy.
   - Proxies, connection pooling, custom TLS, and custom dispatchers are injected uniformly through `config.fetcher`.
3. **Explicit metadata inputs replace `music-metadata` in `cloud`**:
   - Remove `music-metadata` parsing from `src/modules/cloud.ts`.
   - Add optional string fields `song`, `artist`, and `album` to `cloud`'s `ModuleInput` / `inputSchema`, falling back to normalized filename, `'未知艺术家'`, and `'未知专辑'` when omitted.
4. **URL-only QR outputs replace `qrcode` rendering ("Pure Path A")**:
   - Remove `qrimg` from `login_qr_create` inputs and `ModuleBody`, returning `{ code: 200, data: { qrurl } }`. Passing `qrimg` now fails schema validation as `InvalidRequest` (`400`).
   - Remove `qrimg` from `verify_getQr` `ModuleBody`, returning `{ code: 200, data: { qrCode, qrurl } }`.
   - Keep `ModuleInvariantFailed` in `src/core/errors.ts` as part of [ADR-0004](./0004-public-failure-classification.md), while noting QR modules no longer throw it.
   - Render QR codes in the repository's self-hosted demo UI via a demo-only SVG endpoint (`GET /demo/qr-login/image`), outside the published `dist/` SDK surface.

## Consequences

### Positive

- `hana-music-api` has a single runtime dependency (`effect`) and zero `peerDependencies` / `peerDependenciesMeta`.
- `dist/` contains zero dynamic `import(specifier)` calls and zero references to `undici`, `qrcode`, `music-metadata`, or `hono`, eliminating Serverless tracer ambiguity and downstream peer workarounds.
- Separation of concerns is crisp: `hana-music-api` handles NetEase protocol encoding/decoding and request lifecycle; transport concerns live in `config.fetcher`; audio metadata extraction and QR image rendering live in the caller.

### Breaking Changes (v8.0.0)

- `config.proxy` / `options.proxy` is removed across all module calls and `createRequest` (rejected with `400` / `invalidRequest` at runtime, `TypeError` on client construction). Callers configure proxies via `config.fetcher`.
- `loginQrCreate` no longer accepts `qrimg` or returns `data.qrimg`; `verifyGetQr` no longer returns `data.qrimg`. Both return `data.qrurl` for application-side rendering.
- `cloud` no longer auto-parses audio tags via `music-metadata`; callers pass optional `song`, `artist`, and `album` fields or rely on filename/default fallbacks.

## Verification

- `tests/unit/runtime/dependency-boundary.test.ts` verifies `package.json` dependency fields, absence of `src/core/optional-dependency.ts`, and zero imports of `undici`/`qrcode`/`music-metadata`/`hono` in published source trees.
- `tests/behavior/runtime/module-config.test.ts` and `tests/transport/proxy/node-proxy.test.ts` verify runtime rejection of `proxy` and real Node 24 proxy forwarding via custom `fetcher`.
- `tests/package/release.test.ts` validates the packed tarball under a single zero-peer `effect`-only consumer install across Node 24 and Bun.
