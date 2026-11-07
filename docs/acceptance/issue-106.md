# #106：共享读取迁移

来源：[P2 #106](https://github.com/nonhana/hana-music-api/issues/106)，父合同 [#80](https://github.com/nonhana/hana-music-api/issues/80)。前置 #105 已关闭，当前树已具备动作合同、生成器和唯一请求链。

基线：`feature/refactor`，HEAD `eb8f8616b986549e6b510b71849fd207a89d4efa`，工作区干净，无需保护的既有用户改动。

目标与范围：仅迁移 search（普通/语音两个动作）、lyric、song_detail、playlist_detail；复用 ReadStore 和既有执行链。默认协议保持：search/lyric/playlist_detail 为 eapi，song_detail 为 weapi。操作声明拥有 cache/retry；profile 只拥有协议、目标和身份。迁移后的模块受声明约束，不再使用调用者的协议/域名/UA 覆盖；公开配置类型的统一删除留在 P12，本次运行时兼容变化记 major changeset。

非目标：不扩大共享读取名单，不改 Schema、业务参数或 Promise 错误合同，不重写 ReadStore，不切换三个 eapi 模块到 web，不验证真实网易云可用性、不做账号操作或发布。

本次授权：本地实施、生成、测试、文档及独立 agent 审查；未授权提交、推送、PR、关票、真实上游或发布。

| AC ID | 来源与内容摘要      | 入口与预期                                                                                                                               | 测试标题或独立证据                                                                     | 适用性与理由                                        | 必要条件                 | 最终状态   |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------ | ---------- |
| AC-01 | P2 AC 1、要求 1/5/6 | 四模块经 SDK/HTTP 执行本地动作；五个请求分支保持目标和默认协议；profile 不含缓存/重试                                                    | shared-read-actions 的线级请求/正文、HTTP；module-discovery 声明与 pending；源码及 ADR | behavior，实际请求链；不以 replay 证明请求          | 严格 fake，真实 loader   | 见当次记录 |
| AC-02 | P2 AC 1/2、要求 2/3 | 同身份同请求合并；启用 TTL 后命中并克隆；身份、有效参数、profile/目标和 fetcher 隔离；默认不缓存完成结果；其他 read 不自动共享或扩大重试 | shared-read-actions；shared-reads 现有回归；module-loader 动作 retry 回归              | behavior + unit；沿用既有 ReadStore                 | 当前实例与发送次数       | 见当次记录 |
| AC-03 | P2 AC 3、要求 4     | 等待者分别取消/超时，剩余者可成功；最后离开中断完整正文；最终 inflight=0                                                                 | shared-read-actions 正文阶段；shared-reads controlled shared waiters；load             | behavior + transport；TestClock/阶段信号及 loopback | 确认进入正文消费         | 见当次记录 |
| AC-04 | P2 AC 4 与非目标    | 限频、业务失败不入成功缓存；连接重试和显式读取重试保留；非读取不自动重放                                                                 | shared-read-actions 错误/重试；endpoint-policy、module-loader、request 回归            | behavior + unit + 定向 mutation                     | 有限发送期待，无真实上游 | 见当次记录 |
| AC-05 | P2 AC 5、父 Testing | smoke/十分钟 soak 结束 upstreamActive/inflight 均为 0                                                                                    | load 原始 JSON 与判定                                                                  | transport，必需                                     | loopback                 | 见当次记录 |
| AC-06 | 交付与父合同        | 生成物一致、旧路径更新、包消费者兼容、文档/ADR/changeset 同步                                                                            | types:modules:generate/check；verify:sdk 同包 Node/Bun；fixtures 原文兼容              | package + replay；原响应不改来源                    | 当前 tarball/源码指纹    | 见当次记录 |
| AC-07 | TESTING 与用户门禁  | 同候选 verify、verify:sdk、verify:fixtures、smoke、soak、登记 mutation 通过；lint 0 warning/0 error；独立双轴审查无阻断                  | 原始日志/JUnit/summary 与审查记录                                                      | 全部适用，不豁免基线失败                            | 当前候选，独立 reviewer  | 见当次记录 |

旧票测试路径映射：`tests/contract/module-runtime.test.ts` → `tests/behavior/runtime/shared-reads.test.ts`；`tests/contract/effect-module-read.test.ts` → `tests/behavior/modules/library/read-modules.test.ts`；`tests/unit/call-runtime.test.ts` → `tests/behavior/runtime/call-runtime.test.ts`。新证据登记到 `tests/suites.ts`，不恢复旧路径或新增兼容 shim。

切片依赖：先声明与真实请求（red/green），再隔离与保留边界、正文生命周期（缺口先 red/green，已有绿回归直接复用），最后生成、包消费者、文档、全门禁与独立审查。每片以对应 AC 行有决定性证据为完成条件。

最终门禁串行：`bun run verify` → `bun run verify:sdk` → `bun run verify:fixtures` → `bun run test:load:smoke` → `bun run test:load:soak` → `bun scripts/mutation-test.mts --all`。verify:sdk 已包含 build:check 和 test:sdk-contract，不重复构建。真实 live、账号读写、远端 CI 演练及发布 preflight 不适用：本票未切换上游协议，不要求这些外部验收，也没有本次真实上游授权。

当次运行记录：[runs/issue-106.md](runs/issue-106.md)。
