# #129 SDK 失败：统一全模块公开失败契约与分类

来源：GitHub issue [#129](https://github.com/nonhana/hana-music-api/issues/129)，用户 2026-11-12 确认按实施者理解完成本票。基线：分支 `master`，HEAD `2e14409`，开工时工作区干净，无既有用户改动。

目标：在唯一公开 Promise 失败边界保留失败来源，根入口公开 `NcmApiFailure`、`NcmFailureInfo`、`isNcmApiResponse` 和 `getNcmFailureInfo`；八类失败由掌握来源的内核路径产生；既有 resolve/reject、status/body/cookie、未知字段和部分完成信息保持。

非目标：不导出 Effect/内部错误类；不改变成功码、缓存、限流识别、重试次数或 resolve 非 2xx 的模块；不决定 Campanula 的 HTTP 映射；不补猜 8821；不执行真实账号操作、发布或提交。

已确认的实施口径（用户 2026-11-12 授权“按你的理解来”）：

- `ModuleInvariantFailed` 归 `unknown`，并在文档说明它是 SDK 本地执行失败，不属于输入/配置/目标拒绝。
- `business` 以“正文里已确认的数字业务码”为事实，不以 HTTP 状态补猜；HTTP 500 + `code: 405` 仍是 business，HTTP 502 且无业务码是 transport。
- `normalizeFailure` 包过的历史三字段响应补 `failure.kind: 'unknown'`；读取函数对没有元数据的原始对象返回 `undefined`。
- changeset 使用 `minor`，正文写明新增顶层字段对严格形状消费者的影响。

## AC 与证据

| AC ID | 来源与内容摘要                                                                                         | 入口与预期                                              | 测试标题或独立证据                                                                                                                                                                                            | 适用性与理由       | 必要条件 | 最终状态 |
| ----- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------- | -------- |
| AC-01 | 根入口真实导出类型、守卫和读取函数，成功/失败运行形状、文档、声明、tarball 一致                        | 根入口、`dist`、同包消费者                              | `tests/behavior/runtime/failure-contract.test.ts`；`tests/unit/runtime/failure-metadata.test.ts`；`tests/package/types/public-entry.typecheck.ts`；`tests/package/release.test.ts`；`bun run verify:sdk`      | 公开表面变更       | 无       | 通过     |
| AC-02 | 八类失败由掌握来源的路径产生；同状态业务/限流/传输可区分；历史响应为 unknown                           | 具名函数、client、`invokeModule`、`createRequest`、HTTP | `tests/behavior/runtime/failure-contract.test.ts`；`tests/behavior/http/failure-boundary.test.ts`；`tests/unit/runtime/failure-metadata.test.ts`                                                              | 代码变更           | 无       | 通过     |
| AC-03 | 既有 resolve/reject、status/body/cookie、未知字段与部分完成保持；成功无 failure；HTTP body 不被污染    | 同上                                                    | `tests/behavior/runtime/failure-contract.test.ts`；`tests/behavior/modules/upload/*`；既有 replay/HTTP 回归                                                                                                   | 代码变更           | 无       | 通过     |
| AC-04 | 展开和 JSON 往返后可读取；普通 Error、无效对象、无元数据旧响应不被猜成已知分类；守卫校验字段类型       | 公开守卫与读取函数                                      | `tests/unit/runtime/failure-metadata.test.ts`                                                                                                                                                                 | 纯规则             | 无       | 通过     |
| AC-05 | 公开入口覆盖超时、取消、业务、限流、校验、配置/目标、传输和部分完成；分类不新增请求/重试，资源释放回归 | 四个 SDK 入口与 HTTP                                    | `tests/behavior/runtime/failure-contract.test.ts`；`tests/behavior/runtime/request.test.ts`；`tests/behavior/sdk/enhance.test.ts`；`tests/behavior/modules/upload/traffic.test.ts`；`bun run test:load:smoke` | 请求边界变更       | 无       | 通过     |
| AC-06 | 新增元数据和日志不泄漏凭据、token、手机号、验证码、设备值、cause/stack/头                              | 失败元数据与事件                                        | `tests/behavior/runtime/failure-contract.test.ts` 敏感值哨兵用例                                                                                                                                              | 代码变更           | 无       | 通过     |
| AC-07 | 同包 Node/Bun 与正负向类型消费者通过；生成物、门禁、fixtures、smoke、mutation 通过并记录原始证据       | 仓库命令                                                | `bun run types:modules:check`、`bun run verify`、`bun run verify:sdk`、`bun run verify:fixtures`、`bun run test:load:smoke`、`bun scripts/mutation-test.mts --target failure-contract`                        | 公开表面与请求变更 | 无       | 通过     |
| AC-08 | PUBLIC_API、programmatic-api、响应指南、changeset、ADR 同步；提供旧 catch 迁移示例；不自动发布         | 文档                                                    | `bun run docs:build`、`bun run spell`、`bun run fmt:check`；人工对照                                                                                                                                          | 文档变更           | 无       | 通过     |
| AC-09 | 全 SDK 模块/失败路径清单与注册表一致，所有已知来源正确分类，特殊分支有证据                             | `docs/acceptance/issue-129/failures*`、注册表           | `bun run failures:check`；清单由脚本生成并与 352 模块注册表比对                                                                                                                                               | 代码变更           | 无       | 通过     |

## 全量口径

- 内核通用来源（全部 352 模块）：`invalidRequest`、`timeout`、`cancelled`、`rateLimited`、`business`（请求层非特殊业务码）、`transport`。
- 312 个模块通过 `decodeUpstreamBody` 额外产生 `business`（特殊码）和 `upstreamShape`；手工结构检查的模块另计。
- 37 个无 `ModuleBody` 的模块保持原样返回，不新增结构校验。
- 模块特有分支：`playlist_tracks` 512 fallback、`cloud_import`/`playlist_track_all`/`scrobble` 多请求、`voice_upload`/`avatar_upload`/`cloud`/`playlist_cover_update` 与两个上传 plugin 的部分完成、`login_qr_create`/`verify_getQr` 的本地不变式失败、`inner_version` 纯本地。
- 独立 Watchman 继续使用 `WatchmanError`，不属于本票。

## 门禁与授权

- 按 TESTING：`types:modules:check`、`failures:check`、`verify`、`verify:sdk`、`verify:fixtures`、`test:load:smoke`、`mutation --target failure-contract`；命令串行，结果绑定同一候选。
- live 不适用：本票不改变真实上游成功码、不执行账号读写，也没有新增真实上游观测需求；不以其替代离线证据。
- 本次授权：在本地完成实现、测试、文档与验证；不提交、不推送、不发布、不执行真实账号写入。

当次运行记录：`runs/issue-129.md`。
