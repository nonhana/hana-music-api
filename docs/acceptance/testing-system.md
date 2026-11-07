# 测试系统验收矩阵

来源：用户 2026-11-07 的实施指令与 `_notes/testing-architecture/implementation-plan.md`；上一 Session 的只授权计划状态已被本次实施授权更新。

基线：`feature/refactor`，`fb10b0052f05627307310cb307995f77762211a4`，工作区干净，98 个测试与 3 个类型文件，无漂移。允许仓库内实施与验证、有限匿名只读 live；未授权提交、推送、PR、关票、合并、发布、远端配置或真实账号操作。

范围为 Slice 1–11；非目标和架构方向沿用计划。

| AC ID | 来源与期望                                                                                                                                                   | 入口和证据                                                                                                              | 适用性                 | 必要条件                                       | 状态                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- | ----------------------------------------------- |
| AC-01 | 七类测试目录与 _kit/fixtures 职责清楚；98 个原测试文件、3 个类型文件逐项迁移，新增/拆分有记录，既有断言责任无缺失。                                          | suites.ts、testing-migration.md；baseline/inventory.json 的 101 项与最终逐标题 JUnit 映射，纯迁移源码比较               | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-02 | 默认 test/verify 执行完整本地集合；无未归类文件、only/todo/必要 skip、空集合或失败退出被报为 pass。                                                          | unit/testing/runner：inventory/empty/only/todo/skip/child/JUnit 控制样本；local 全集 summary                            | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-03 | strict scenario 的错路径、额外请求、未消费期待、被产品捕获的 fake 错误、清理失败都能稳定令测试失败。                                                         | unit/testing/upstream：错 URL/方法、额外/未消费请求、捕获异常、取消、清理同时失败；withScenario 独立 ledger             | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-04 | 收藏、共享读取、上传三个试点通过；请求内容、返回结果、副作用与生命周期均有证据，未把内部 capability 测试冒充完整请求链。                                     | behavior/modules/playlist/subscribe、runtime/shared-reads、modules/upload/voice-upload；HTTP 对应入口与失败点、发送次数 | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-05 | HTTP 真实 loader 使用实例级内部 transport；公开 SDK wiring 保留直接测试；时钟/熵注入不进入公开类型或 HTTP 输入。                                             | HTTP playlist discovers declarations；root/named/invoke 公共 wiring、package/types 的内部依赖负向断言、generator check  | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-06 | 账号、fetcher、期限、并发结果和清理状态隔离；写请求仍不缓存、不合并、不重放；所有受影响架构边界检查通过。                                                    | 并发账号/token/不同 fetcher 与 TestClock 期限、独立与最后等待者取消；架构 boundaries、写请求单次回归                    | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-07 | 原始录制与 gzip 内容/来源保持；新合成数据和请求证据明确区分；verify:fixtures 通过。                                                                          | 915 原 JSON/gzip SHA-256、replay 原文与 request-evidence 规则、synthetic/upload；verify:fixtures 原始输出               | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-08 | 真实 socket 的慢 headers/body、断流、取消、代理和重定向边界通过；smoke/soak 结束时 upstreamActive 与 inflight 归零。                                         | transport/http/lifecycle 与 proxy/node-proxy；smoke/soak 原始报告的资源归零与目标/发送记录                              | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-09 | 同一候选 tarball 在 Node/Bun 消费者通过；根导出、类型、Standard Schema 和 serverless 无文件访问合同保持。                                                    | package/release 的同 tarball Node/Bun、strict TS、root denylist/Standard Schema/serverless 零 FS；package summary       | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-10 | 三个试点的定向变异能识别预期错误；已知存活样本能存活；无效/超时/工具错误不冒充断言 kill；原工作区未被改写。                                                  | unit/testing/mutation 八个进程控制；mutation/targets 五故障、expectedFailures 与原生 JUnit assertion；原工作区指纹      | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-11 | 匿名 live 从候选包获得有效、与请求对应的数据；没有使用替身；报告绑定 tarball/源码/身份类别/时间。                                                            | live/anonymous search-to-detail/catalog；安装后的 tarball，实际 6 请求含匿名注册，live summary/JUnit/包 hash            | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-12 | E1：在用户提供当次账号、token、对象与授权后，登录身份确认、一次收藏/读回/取消/恢复有真实证据；失败停止且恢复状态可确认。缺条件就是阻塞，不能回退为本地通过。 | live/authenticated/account 与 writes/playlist-subscribe-cycle；控制测试不替代当次真实身份/目标/恢复 E1                  | 适用，测试系统整体实施 | E1：当次账号、身份、token、目标和写入/恢复授权 | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-13 | PR 实际 CI 执行完整本地门禁；定期/手动 live、mutation、soak 独立运行并保留失败 artifacts；最终候选的发布前检查不能被旧版本报告替代。                         | 六个 workflow、release-preflight、11 PATH 进程控制与 manifest/hash；真实远端 job/失败 artifact 仍待授权执行             | 适用，测试系统整体实施 | 授权的远端运行                                 | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-14 | hana-implement 对 ticket、plan、提示词产生同样完整的验收表；无强制开票、无全局 skill 绝对依赖；审查覆盖所有任务改动。                                        | hana-implement 及 review/input-cases；skill/{ticket,plan,prompt}/recheck.md、comparison.json 的原始来源与五核心 AC 对照 | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-15 | skill 的仅计划、缺凭据、未提交改动、用户既有改动、文档任务与已有授权演练全部符合预期。                                                                       | 九项桌面演练的实际矩阵/决策；隔离 Git 四类 diff、草稿/index/status/hash 保持；文档/计划/凭据/提交边界                   | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-16 | 当前候选 verify、verify:sdk、fixtures、smoke、soak 和适用专项均通过，lint 0 warning/0 error；双轴审查无阻断项。                                              | 冻结候选后串行 types check + preflight 七门禁与 manifest；独立 standards/requirements/migration 审查、修复/重验         | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |
| AC-17 | 验收记录可追溯到源码与包；历史资料、计划命令、skip、未运行项不被当作本次通过；提交/推送/关票/发布仅在对应授权范围执行。                                      | evidence schemaVersion1、内容指纹/HEAD/锁文件/命令/包 hash；逐片 runs 与最终 AC 结论；外部未执行明确阻塞                | 适用，测试系统整体实施 | 本地候选与计划所列 Verification                | [当次结论](runs/testing-system.md#最终逐项结论) |

三个试点分别检查完整请求与结果：收藏 URL、身份和同值 token；共享读取发送次数、隔离、取消和期限；上传各阶段及失败后零后续发送。mutation 独立检查断言辨别力，响应回放不充当请求或当次 live 证据。

门禁：每切片按计划运行；最终依次运行 types:modules:check、verify、verify:sdk、verify:fixtures、smoke、soak、三个 mutation 目标、匿名 live 与 skill 演练。登录/写专项及远端 CI 缺条件时保持阻塞。

## PR 119 独立远端验收补充

用户已授权在未合并分支补齐独立 live/mutation、故意失败 job 的 artifact 上传，提交推送并跟进 PR CI，明确不合并。沿用 AC-13 和 AC-16，通过既有 release-rehearsal 手动入口调用同一提交的实际 workflow；不改变普通 PR 的网络依赖，也不重跑已完成的账号写入。

| 子项  | 通过条件                                                                                                       | 决定性证据                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| CI-01 | release 默认行为与普通 PR 门禁保持；testing/failure 仅由显式手动模式启用，同提交复用实际 job                   | 工作流源、进程控制、实际 PR 与手动 run                                  |
| CI-02 | 独立匿名 live 使用安装后的候选包，预算内完成全部场景，无替身或账号 Secrets                                     | live 原生 JUnit、请求摘要、源码/包 hash、可下载 artifact                |
| CI-03 | 独立 mutation 三目标五故障由登记标题下的真实断言检出，无无效/存活/工具错误冒充 killed                          | mutation 原生 XML、逐项分类、同候选摘要与 artifact                      |
| CI-04 | 同一 verify job 中真实测试断言失败，job 和 run 保持 failure，原上传步骤仍保存日志/JUnit/候选；正常模式恢复成功 | failure 与 testing 两份同源 run、失败 job 步骤、下载的原生 JUnit 与日志 |

实际状态与剩余项继续写入 [PR CI 记录](runs/testing-system-ci.md)，原始运行证据保存 `.artifacts/testing/ci-acceptance/`；成功上传、预期缺 gate 的控制子进程均不能替代 CI-04。
