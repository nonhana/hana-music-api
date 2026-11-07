# Soak 手动测试当次验收

状态：完成。所有适用门禁通过，工作区需求与规范复核无阻断项。

分支 `feature/refactor`，HEAD `3cadd31682143dbb4109da142fba25d09474cbcd`。起始工作区干净；本次修改仅涉及 soak workflow 删除、发布前检查、相关进程控制测试、当前测试文档与本轮验收记录。未提交、推送或发布。

最终候选内容 SHA-256：`7ab61d2bd53f91b837fcebfe619c1ffd2e9a790f246869198abff8079cc062c6`。local、SDK、smoke 三份摘要与负载原始报告均匹配该指纹；未用执行生成检查时的临时文件指纹作为验收证据。实际环境为 Bun 1.4.4、命令行 Node 26.13.0。

证据根目录 `.artifacts/testing/soak-manual/`。

| 实际命令                                                                                                                                     | 退出码与结果                                                                                                                       | 日志或报告                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `bun test tests/behavior/tooling/release-preflight.test.ts --reporter=junit --reporter-outfile=.artifacts/testing/soak-manual/preflight.xml` | 0；16 pass、0 fail                                                                                                                 | `preflight.log`、`preflight.xml` |
| `bun run verify`                                                                                                                             | 0；默认回归 3563 pass、0 fail、0 skip；生成、Schema、构建、类型、lint、拼写、格式与文档构建通过                                    | `verify.log`；local 摘要见下文   |
| `bun run verify:sdk`                                                                                                                         | 0；SDK 集合 32 pass、0 fail、0 skip；包规范、类型和静态检查通过                                                                    | `verify-sdk.log`；SDK 摘要见下文 |
| `bun run test:load:smoke`                                                                                                                    | 0；专项 100 pass、0 fail、0 skip；实际 500 次 loopback 请求，failures 为空，upstreamActive/inflight 均为 0                         | `smoke.log`；负载原始报告见下文  |
| `bun .artifacts/testing/soak-manual/audit.mts`                                                                                               | 0；剩余 5 个 workflow 均解析成功且无 soak 引用，复用 workflow 目标存在；发布 preflight 无 soak，手动命令和负载脚本与 HEAD 完全相同 | `audit.json`                     |
| `git diff --check`                                                                                                                           | 0                                                                                                                                  | 工作区差异检查                   |

报告补充后另执行 `bun run fmt:check`、`bun run spell`，均退出 0，日志为 `final-fmt.log`、`final-spell.log`。

原生 JUnit、子进程日志与摘要：

- local：`.artifacts/testing/local/1794060882145-14ead3b6-8212-46a9-8289-5326ec84125c/summary.json`。
- SDK：`.artifacts/testing/sdk/1794061005194-e1b4f690-2991-4c27-9b6c-a1ee352deffe/summary.json`。
- smoke：`.artifacts/testing/smoke/1794061039763-e901c94b-f498-4bde-bcbf-f86dac9a1c28/summary.json`。
- 负载原始报告：`.artifacts/testing/load/smoke-1794061043470.json`；500 请求耗时约 1.36 秒，p95 约 74.41ms。

| AC        | 结论 | 证据                                                                                                                                          |
| --------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| MANUAL-01 | PASS | package script 与十分钟负载脚本均无改动，手动命令保留；本次不执行 soak                                                                        |
| MANUAL-02 | PASS | 删除 load.yml；剩余 workflow 检查与发布命令进程 trace 均无 soak                                                                               |
| MANUAL-03 | PASS | 原有进程控制测试验证六项正确性门禁顺序、包一致性和发布调用；六项门禁或包/源码一致性失败时发布次数为零；5 个剩余 workflow 保留失败退出码和日志 |
| MANUAL-04 | PASS | TESTING、BUILD 和测试导航已同步；完整验证与 SDK 验证中的格式、拼写均通过                                                                      |

工作区复核确认：手动 soak 的持续时间、请求场景、内存和资源阈值未改变；发布路径只移除 soak，smoke、mutation、匿名 live、包一致性及失败阻断继续保留。历史验收记录未重写，新需求文档明确本次规则取代历史 soak 门禁要求。

lint 0 warning、0 error。构建仍有既有 TypeScript 声明生成器弃用提示和 VitePress chunk 大小建议；所有适用命令均退出 0，未调整规则或阈值。

按实施前约定，fixtures、定向 mutation、真实上游与十分钟 soak 专项本次不适用；远端 CI 未运行，发布命令只在隔离项目中通过进程探针验证。最终报告补充后另执行格式、拼写和候选指纹复核。
