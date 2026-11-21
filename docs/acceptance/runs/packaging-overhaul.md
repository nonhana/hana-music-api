# packaging-overhaul 运行记录

- 起始基线：分支 `feat/issue-140-playlist-steps`，HEAD `59ee947b08f1806c5a6ada0a010473af8e7dbfe4`，受控工作区干净。
- 需求矩阵：[packaging-overhaul.md](../packaging-overhaul.md)
- 授权范围：完整实施 Slice 1–7、全部本地离线门禁、量化对比与独立双轴审查；未获用户再次明确授权前不执行 `git commit`、`git push`、`npm publish` 或 live 写入。

## 最终候选指纹

- `head`: `59ee947b08f1806c5a6ada0a010473af8e7dbfe4`
- `contentSha256`: `6d542f47387e0ce9d848e5077b20679fbaf56df0d623e7c29a8a65b87d3a43fb`（全部 6 项门禁首尾一致）
- `diffSha256`: `cb6827210a71ccc6053d9167e8fdbbd766edc6b7a0f8f8f86464af4cf95b6109`
- 候选包 tarball：`.artifacts/testing/package/b67bc7e3-9920-4f3e-8c89-260cdbde582c/hana-music-api-6.0.0.tgz`
- `tarballSha256`: `d9f0833c088a2fd3d975d468743c1663edb936ed7db662efba2ad502e75553bc`
- `integrity`: `sha512-d/xoergPp077t1fV1SOzbbEUt/cTSfasw67lx9wQP9HAwqjRoHb41pisJxGK/rckQwG7qKlOdsEHaWKbDa2Tuw==`

## 切片进展

- **Slice 1**（已完成）：拆分零 Effect 纯模块 `src/core/failure-guards.ts`、`src/core/option-builder.ts`；懒初始化 `runtime.ts`、`upstream-body.ts` 与编译期 `__HANA_SERVICE_VERSION__` 注入；修复 `generateDeviceId()` 在固定 `Math.random = () => 0` 时的死循环隐患并补单元测试；更新 `failure-contract` 变异目标锚点。
- **Slice 2**（已完成）：将发布图全部 370 份源码由 `'effect'` 根 barrel 迁移至精确 `effect/*` 子路径；以 pipe 风格修复全部 332 条 `effecttsgo(missed-pipeable-opportunity)` 提示（0 warning / 0 error，未放宽任何规则）；新增架构边界守卫测试（先 red 后 green）。
- **Slice 3**（已完成）：新增 `src/core/optional-dependency.ts` 动态按需加载 `undici`、`music-metadata`、`qrcode` 并精确匹配缺失目标 specifier（不误判已安装 peer 的传递依赖缺失）；`package.json#dependencies` 收敛至仅 `effect`，`hono` 移入 `devDependencies`，三项重依赖转为可选 `peerDependencies` 并同步 `bun.lock`；新增 `tests/unit/runtime/optional-dependencies.test.ts`（先 red 后 green）。
- **Slice 4**（已完成）：新增零 Effect `src/types/standard-schema.ts`（`StandardSchemaV1`、`BodySchema<Output>`）；`defineModuleBody` + `CleanUpstreamType` 消除 `StructWithRest` / `middlewareDecoding` / `MutableJson` 声明泄漏并满足 `--skipLibCheck false`；全量迁移 315 个 `src/modules/*.ts` `ModuleBody` 及 `LoginCellphoneRiskBody`。
- **Slice 5**（已完成）：新增 `src/sdk/invoker.ts`（脱离 `sdkModuleRegistry`、懒默认上下文、懒单模块动作校验与非枚举内部 `Symbol`）、`src/sdk/client.ts`（`createClient(modules, config)`，绑定时即刻校验冻结 `actions` 并使用 `Object.defineProperty` 防止原型污染）、`src/sdk/core.ts`、`src/sdk/utils.ts`、`src/sdk/schemas.ts`；升级 `scripts/gen-module-types.mts` 生成 352 个独立 `src/sdk/api/<id>.ts`、315 个 `src/sdk/schemas/<id>.ts` 与 `src/sdk/generated/bodies-types.generated.ts`；根入口 `index.ts` 将 `*Body` 与 `LoginCellphoneRiskBody` 改为纯类型导出；迁移 53 个测试文件至 `src/sdk/schemas.ts`；新增 `tests/behavior/sdk/scoped-client.test.ts`（含 `ReadStore`、`identityPool`、非法配置/模块及 `__proto__` 隔离验证）。
- **Slice 6**（已完成）：`tsdown.config.ts` 切换 `unbundle: true` + `__HANA_SERVICE_VERSION__`；`package.json#exports` 开放 7 组公开子路径；升级 `tests/package/release.test.ts`（Stage A 干净安装零可选依赖、全量 `*Body` 根入口排除、摇树/严格单模块排他 `Bun.build` metafile、`dist/` 静态审计、无可选依赖单文件云函数零 FS 读取、严格消费端 TS 检查；Stage B 安装可选依赖后跑通全量套件、二维码 PNG、`music-metadata` ID3v2 真实标签解析与 Node 代理转发）与 `tests/package/types/public-entry.typecheck.ts`。
- **Slice 7**（已完成）：新增 `docs/adr/0005-unbundled-subpaths-and-optional-peers.md`、`website/guide/migrating-to-v7.md`、`.changeset/v7-packaging-overhaul.md`；更新 `agent-docs/{BUILD,PUBLIC_API,ARCHITECTURE,API_CONVENTIONS}.md`、`website/guide/{sdk-package-contract,programmatic-api,getting-started,response-bodies}.md`、`website/.vitepress/config.ts` 与 `.cspell/project-words.txt`。

## 最终候选串行门禁结果

| 顺序 | 门禁命令                  | 退出码 | 关键结果与证据路径                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---- | ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `bun run verify`          | 0      | `types:modules:check`（673 文件）、`inputs:check`（352/352）、`failures:check`（352 模块/18 域）、`schema:audit check` ok、`build` ok、`local` **8,426 pass / 0 fail / 0 skip**（`.artifacts/testing/local/1795200267467-70825dbc-50d9-4ef6-84c9-c0fedca89dd6/summary.json`）、`typecheck` ok、`lint` 0w/0e、`spell` 1,911 文件 0 问题、`fmt:check` ok、`docs:build` 11.68s ok                                                                                                                                                                                     |
| 2    | `bun run verify:sdk`      | 0      | `build:check`（`publint --strict` + `attw --pack . --profile esm-only` 0 错误/0 警告）、`sdk` **39 pass / 0 fail / 0 skip**（`.artifacts/testing/sdk/1795200374118-12573d85-cff6-4442-a9cd-022839e6ca12/summary.json`、包证据 `.artifacts/testing/package/b67bc7e3-9920-4f3e-8c89-260cdbde582c/summary.json`）、`typecheck`/`lint`/`spell`/`fmt:check`/`docs:build` 全绿                                                                                                                                                                                           |
| 3    | `bun run verify:fixtures` | 0      | `schema:audit check` ok + `tests/fixtures/netease` 全部录制结构校验通过                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4    | `bun run build:check`     | 0      | `tsdown` 服务端 + 浏览器双构建通过，`publint --strict` All good，`attw --pack . --profile esm-only` No problems found                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 5    | `bun run test:load:smoke` | 0      | `smoke` **143 pass / 0 fail / 0 skip**（`.artifacts/testing/smoke/1795200423662-e2d28673-5f1f-4360-97b5-019f7cd060ec/summary.json`）；负载冒烟 `failures: []`，全场景 `upstream.active === 0`、`reads.inflight === 0`（`.artifacts/testing/load/smoke-1795200428112.json`）                                                                                                                                                                                                                                                                                        |
| 6    | 4 组定向变异测试          | 0      | `failure-contract` **5/5 killed**（`.artifacts/testing/mutation/1795200428401-6cdfc20c-b8e5-4e92-9b8b-cf5387e18036/summary.json`）；`module-config` **25/25 killed**（`.artifacts/testing/mutation/1795200443553-25c3d6c5-b7ce-423f-8029-53383838fe94/summary.json`）；`browser-types` **2/2 killed**（`.artifacts/testing/mutation/1795200528219-5f54fe9f-cce2-47bd-a465-14e285702281/summary.json`）；`candidate-package` **2/2 killed**（`.artifacts/testing/mutation/1795200535442-e92662fa-a34e-452d-bb46-efd28981db79/summary.json`），总计 **34/34 killed** |

## AC 验收结论

| AC ID | 状态 | 实测证据摘要                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | 通过 | `package.json#exports` 开放 7 组入口；`publint --strict` 与 `attw --pack . --profile esm-only` 零报错；Node 26.13.1、Bun 1.4.4 与 `tsc --strict --skipLibCheck false --types node` 全绿                                                                                                                                                                                                                                                                                                  |
| AC-2  | 通过 | 根入口保留全部 352 函数、`createHanaMusicApi`、`createClient`、`invokeModule`、`createRequest`、`createOption`、`generateDeviceId`、`isNcmApiResponse`、`getNcmFailureInfo` 及全量纯类型导出；运行时 `Object.keys(entry).filter(k => k.endsWith('Body'))` 为 `[]`；`./schemas`、`./schemas/*`、`./api/*` 校验通过                                                                                                                                                                        |
| AC-3  | 通过 | `dependencies` 仅含 `effect`；`hono` 在 `devDependencies`；`undici`/`music-metadata`/`qrcode` 为可选 `peerDependencies`；Stage A 干净安装消费者 `node_modules` 不含这 4 个包                                                                                                                                                                                                                                                                                                             |
| AC-4  | 通过 | `isMissingOptionalDependencyError` 严格匹配缺失 specifier（不误判已安装 peer 的传递依赖缺失）；Stage A 验证缺 `undici` Node 代理返回 `invalidRequest`、缺 `qrcode` 时 `qrimg: false` 成功而 `qrimg: true` / `verifyGetQr` 返回 `unknown`、缺 `music-metadata` 时 `cloud` 优雅回退且无可选依赖单文件云函数零 FS 读取；Stage B 安装三包后 `account-social`、`special-chains`、二维码 PNG、`cloud` 真实 ID3v2 标签解析（`Parsed Title`/`Parsed Artist`/`Parsed Album`）与 Node 代理转发全绿 |
| AC-5  | 通过 | `boundaries.test.ts` 与 `dist/` 审计确认零 `'effect'` 根 barrel、零 `package.json` 运行时引用；`Bun.build` metafile 证实 `./utils` 与根入口 `generateDeviceId` 零 `effect`/业务模块，`./api/song_detail`、根入口 `songDetail` 与 `./schemas/song_detail` 各自仅含 1 个业务模块（`song_detail.js`）且零其余 351 模块/`registry.generated`/可选重依赖                                                                                                                                      |
| AC-6  | 通过 | 最大单 `.d.ts` 从 8.59 MB 降至 89.4 KB，总 `.d.ts` 2.74 MB；零 `StructWithRest` / `middlewareDecoding` / `MutableJson` 泄漏；`verify:fixtures` 与全部类型契约（含 `Equal<SongDetailBody['unverified'], Json>`）通过                                                                                                                                                                                                                                                                      |
| AC-7  | 通过 | `scoped-client.test.ts` 与 `release.test.ts` 验证 `createClient` 仅绑定传入模块子集、共享 `ReadStore` 与 `identityPool`（`register/anonimous` 仅调用一次并在不同模块间复用）及默认配置、绑定时冻结 `actions`、防范 `__proto__` 污染、非法配置（含 `identityPool: { size: 0 }`）或非法模块同步抛 `TypeError`                                                                                                                                                                              |
| AC-8  | 通过 | 6 项交付门禁对同一冻结候选全绿；ADR-0005、agent-docs（含 `API_CONVENTIONS.md`）、用户向指南（含 `migrating-to-v7.md` 与 `response-bodies.md`）、major changeset 落盘；第 2 轮独立双轴审查均 `PASS`（0 Blocker / 0 Warning）                                                                                                                                                                                                                                                              |

## 优化前后量化对比

| 指标                                                | 优化前（v6.0.0 打包基线）                                  | 优化后（v7.0.0 候选）                                                                                                    | 变化幅度                                      |
| --------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `npm pack` 解压包体大小                             | 9.56 MB（713 文件）                                        | **4.01 MB**（2,118 文件；压缩 `.tgz` 396.9 KB）                                                                          | **-58.1%**                                    |
| 最大单体 `.d.ts` 文件                               | 8.59 MB（124,943 行）                                      | **89.4 KB**（`homepage_block_page.d.ts`）                                                                                | **-99.0%**（96× 缩小）                        |
| `dist/` 全部 `.d.ts` 总大小                         | ~8.6 MB（单体为主）                                        | **2.74 MB**（1,055 文件）                                                                                                | **-68.1%**                                    |
| 最大单 `.js` 文件 / chunk                           | 773.3 KB（`client.generated-*.js`）                        | **122.8 KB**（`registry.generated.js`，`./api/*` 与 `createClient` 不加载）                                              | **-84.1%**                                    |
| `generateDeviceId` 单文件打包（`Bun.build`）        | 2,796 KB / 391 文件                                        | **`./utils`：1.45 KB / 3 文件**；**根入口摇树：1.45 KB / 3 文件**（零 `effect`）                                         | **-99.95%**（1,925× 缩小）                    |
| `songDetail` 单文件打包（`Bun.build`）              | ~2,800 KB / 391+ 文件                                      | **`./api/song_detail`：362.6 KB / 87 文件**；**根入口摇树：362.6 KB / 88 文件**（零其余模块/可选依赖）                   | **-87.1%**                                    |
| `SongDetailBody` 独立校验器打包（`Bun.build`）      | 与全量根包绑定                                             | **`./schemas/song_detail`：222.2 KB / 56 文件**（零请求/传输链）                                                         | 独立可裁剪                                    |
| 静态 ESM 依赖图追踪 `effect` 文件数（AST NFT 模拟） | 247–254 文件 / 5.22–5.48 MB                                | **`./utils`：0 文件 / 0 B**；**`./api/song_detail`：147 文件 / 3.18 MB**                                                 | **`./utils` -100%**；**单接口 -42.1%**        |
| Node 冷导入耗时（7 次中位数）                       | ~151–280 ms                                                | **`./utils`：2.62 ms**；**`./api/song_detail`：52.81 ms**；**`./schemas/song_detail`：50.34 ms**；**`./core`：51.40 ms** | **`./utils` 快 ~58–107×**；**单接口快 ~3–5×** |
| 干净安装 `node_modules` 顶层依赖                    | `effect` + `hono` + `undici` + `music-metadata` + `qrcode` | **仅 `effect`**（零 `hono`/`undici`/`music-metadata`/`qrcode`）                                                          | 移除 4 个直接依赖                             |

## 独立双轴审查记录

### 第 1 轮审查与修复闭环

- **规范轴**（Pass 1）：`PASS`（0 Blocker，3 Warning，2 Note）。
- **需求轴**（Pass 1）：`FAIL`（2 Blocker，3 Warning，1 Note）。
- **已闭环修复**：
  1. `src/core/optional-dependency.ts` + `tests/unit/runtime/optional-dependencies.test.ts`：改为严格正则匹配缺失 specifier（排除 `imported from` 路径误判）并补齐传递依赖/路径子串回归测试。
  2. `tests/behavior/sdk/scoped-client.test.ts`：新增 `createClient` 共享 `identityPool`（断言 `register/anonimous` 仅调用一次并在不同模块间复用）与 `identityPool: { size: 0 }` 同步抛 `TypeError` 及 `__proto__` 隔离测试。
  3. `src/sdk/client.ts`：绑定时 upfront 执行 `validateModuleActions(definition.actions)` 冻结动作快照（保留 `{ cause: error }`），并用 `Object.defineProperty` 写入绑定属性。
  4. `tests/package/release.test.ts`：Stage B 新增含真实 ID3v2.3 标签的合成 MP3 缓冲正向验证 `music-metadata` 解析出 `Parsed Title`/`Parsed Artist`/`Parsed Album`；收紧 `verifyConsumerTreeShaking` 为严格单模块排他断言（`src/modules/*.js` 仅含 `song_detail.js`）；根入口全量断言 `Object.keys(entry).filter(k => k.endsWith('Body'))` 为 `[]`。
  5. `website/guide/response-bodies.md` 与 `agent-docs/API_CONVENTIONS.md`：更新 v7 导出约定、`defineModuleBody` + `BodyType<typeof ModuleBody>` 规范与示例代码。
  6. `src/core/upstream-body.ts`：内联单调用点 `getFormatIssue`。
  7. `.cspell/project-words.txt`：补充 `TALB` 词条。

### 第 2 轮独立复审（最终冻结候选 `6d542f47...`）

- **需求轴**（Pass 2）：**`PASS`** — 无新增发现（0 Blocker / 0 Warning / 0 Note）；AC-1 至 AC-8 全部通过，9 份门禁摘要与当前工作区实时指纹完全一致。
- **规范轴**（Pass 2）：**`PASS`** — 0 Blocker / 0 Warning，全部 3 项 Pass 1 Warning 与 `upstream-body.ts` Note 已验证关闭，9 份门禁摘要与实时指纹完全一致；保留 2 条非阻塞 `NOTE` 供后续可选优化：
  1. `src/core/optional-dependency.ts:6-7`：单调用点 `escapeRegExp` 后续可内联。
  2. `src/types/runtime.ts:1` → `dist/src/types/runtime.d.ts:7`：类型声明传递保留了空副作用 `import "effect/Effect"`（对 `./utils` 运行时零影响且严格 `--skipLibCheck false` 通过，后续如需声明层零 Effect 可拆分纯公共类型文件）。

## 授权内交付状态

- 已完成 Slice 1–7 全部代码、生成物、测试、ADR、文档、major changeset、6 项串行交付门禁与 2 轮独立双轴审查。
- 经用户再次明确授权后，已基于 `origin/master`（`dec8490eb166bd75b8dfb2b8e5548bbc0ca72f9b`，版本 `6.1.0`）切出新分支 `feat/v7-packaging-overhaul`，复验 `bun install --frozen-lockfile`、`bun run build:check` 与 `bun run test:sdk-contract`（39 pass / 0 fail / 0 skip，report `.artifacts/testing/sdk/1795233057174-9ebcf596-a30c-48e8-9d9e-34050a3ae8f3/summary.json`）全绿，按 7 个语义 commit 提交并推送发起 PR。
