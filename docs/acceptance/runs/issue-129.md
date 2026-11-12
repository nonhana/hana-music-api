# #129 当次运行记录

来源与授权：GitHub issue [#129](https://github.com/nonhana/hana-music-api/issues/129)；用户 2026-11-12 确认按实施者理解完成本票。仅授权本地实现、测试、文档与验证；未提交、推送、发布或执行真实账号操作。

基线：`master`，HEAD `2e14409946db785501dba2e45108a4f78861de18`，开工时工作区干净，无既有用户改动。

最终候选：未提交工作区，内容指纹 `672e497a284498d46dee5e2476ecd7f311a698bf6ad8cc77e8d42e7c97dcc536`，diff 指纹 `9bdc167d7d1d84ad80d8896f1aedeb441327b4ed4aa8ec528487ee58e99fe659`。以下结果均对应这一候选；`docs/acceptance/runs/` 按 TESTING 规则不进入内容指纹。

## 实施切片

- 内核：`NcmFailureInfo`/`NcmApiFailure`、严格守卫、`getNcmFailureInfo`、`normalizeFailure` 八类映射、`interpretResponse` 业务码事实、`ProtocolFailed.reason`、根导出和服务端守卫统一。
- 证据：新增 `tests/behavior/runtime/failure-contract.test.ts`、`tests/behavior/http/failure-boundary.test.ts`、`tests/unit/runtime/failure-metadata.test.ts`；更新形状 helper 与 86 处精确拒绝断言；扩展 5 个包消费者与公开类型正负向用例。
- 清单：`scripts/check-failure-contract.mts`、`docs/acceptance/issue-129/failures/*.json`、生成的 `failures.md`，核对 352 模块、18 领域、模块事实、特殊分支和内部错误类映射。
- 文档：PUBLIC_API、API_CONVENTIONS、ARCHITECTURE、TESTING、programmatic-api、response-bodies、sdk-package-contract、ADR-0004、changeset。
- 迭代中修复：精确断言补 `failure`；空正文 HTTP 400 的既有 resolve 行为保持不变（撤销不必要的 special 映射改动）；负向类型指令位置；mutation 去掉已知 code 时避免未使用变量。
- 独立审查后修复：`isNcmApiResponse`/`isFailureInfo` 对 revoked Proxy 的 `Array.isArray` 移入 try，守卫和读取函数不再抛 `TypeError`，并新增正反用例；生成报告不再声称每个模块都能产生全部内核来源，改为说明实际可达来源取决于是否发起网络请求。

## 门禁结果

| 命令                                                      | 结果   | 证据                                                                                            |
| --------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| `bun run types:modules:check`                             | PASS   | 生成表面 up to date                                                                             |
| `bun run failures:check`                                  | PASS   | 352 modules / 18 domains；包含在 `verify` 内                                                    |
| `bun run verify`                                          | PASS   | build、8329 tests / 0 fail、Bun/Node 与 DOM typecheck、oxlint 0 warning、spell、fmt、docs build |
| `bun run verify:sdk`                                      | PASS   | build:check（publint/attw）、34 sdk tests / 0 fail、typecheck、lint、spell、fmt、docs build     |
| `bun run verify:fixtures`                                 | PASS   | 765 ok、150 rejected、761 validated、4 skipped（no ModuleBody）、0 failures                     |
| `bun run test:load:smoke`                                 | PASS   | 142 tests / 0 fail；500 请求，p99 75.8ms，`upstreamActive=0`、`inflight=0`                      |
| `bun scripts/mutation-test.mts --target failure-contract` | PASS   | 5/5 killed                                                                                      |
| `bun run docs:build`                                      | PASS   | 包含在 `verify`/`verify:sdk`                                                                    |
| live 上游                                                 | 不适用 | 本票不改变真实上游成功码、不执行账号读写；不以 live 替代离线证据                                |

## 证据位置

- 最终 local suite：`.artifacts/testing/local/1794489787039-c82c8911-b8f9-4c68-ae4c-71c825889819/summary.json`（`pass`，8329/0/0）；完整命令输出：`.artifacts/testing/issue-129/verify.log`。
- 最终 SDK suite：`.artifacts/testing/sdk/1794489926235-39e4c380-5235-40f8-9c76-93791b9bc35b/summary.json`（`pass`，34/0/0）；完整命令输出：`.artifacts/testing/issue-129/verify-sdk.log`。
- 最终 smoke：`.artifacts/testing/smoke/1794489972004-99ee5139-8aff-4a46-a21e-30488c0a1f49/summary.json` 与 `.artifacts/testing/load/`；完整输出：`.artifacts/testing/issue-129/smoke.log`。
- 最终 mutation：`.artifacts/testing/mutation/1794489981332-0850feb1-262a-4da7-bd7b-b9f83d8e9379/summary.json`；完整输出：`.artifacts/testing/issue-129/mutation.log`。
- fixtures 日志：`.artifacts/testing/issue-129/verify-fixtures.log`。
- 需求矩阵与清单：`docs/acceptance/issue-129.md`、`docs/acceptance/issue-129/failures.md`。

## 审查

独立 reviewer 对同一候选执行规范轴与需求轴审查，发现两项问题：revoked Proxy 会让公开守卫抛异常（P2），生成报告过度声称全部内核来源（P3）。两项均已修复并重新运行全部门禁；最终候选同上。审查确认其余 AC（AC-01/02/03/05/06/07/08/09）与规范轴通过，修复后 AC-04 由新增的 revoked Proxy 用例覆盖。
