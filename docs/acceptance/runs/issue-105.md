# Issue 105：本轮验收记录

日期：2026-11-07（Asia/Shanghai）。结论：**PASS**。按本轮矩阵定义的 P1 请求合同和交付门禁，#105 可以验收通过。

来源与范围见 [验收矩阵](../issue-105.md)。本轮已补充 GitHub #105 的 AC-01～AC-13；没有修改业务实现。验收执行时 ticket 保持开放，新增验收矩阵和本记录尚未提交；验收后的提交、推送与关票授权见文末。

## 最终候选

- 分支：`feature/refactor`；testedHead：`15e99ef197307e0e2e8486043721c8bf20cb5b33`。
- 内容 SHA-256：`8199a67e325b97b61f0444881bf6947761ebcd5e9aa766a7a86f0e3dd3c45b0c`。
- diff SHA-256：`7f67484abde35b628dd10f8b90a1d1ddc547ab50cc39fda10699a04f44cc06dc`。
- 锁文件 SHA-256：`3a766941faf96120db64ba56750176e204b3a83d4734c779a1fd0150e295e86f`。
- 正式门禁时间：2026-11-07 17:24:57 CST 至 2026-11-07 17:38:23 CST。
- 所有正式门禁、原生摘要、JUnit、包与负载证据绑定同一候选。需求矩阵计入指纹，本运行记录按既有规则排除；写入记录不改变受验候选。

## 实际命令与门禁

冻结前已运行 `bun run types:modules:generate`，退出 0，生成物没有工作区差异，日志 `.artifacts/testing/issue-105/generate.log`；正式 verify 和 verify:sdk 又分别对最终候选执行 types:modules:check。

| 命令                                  | 退出码 | 结果摘要                                                                                     | 主日志                                      |
| ------------------------------------- | ------ | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `bun run verify`                      | 0      | 3532 pass、0 fail、0 skip；类型、lint、拼写、格式和文档构建全部通过                          | `.artifacts/testing/issue-105/verify.log`   |
| `bun run verify:sdk`                  | 0      | 32 pass、0 fail、0 skip；构建、publint、attw、消费者及其余门禁全部通过                       | `.artifacts/testing/issue-105/sdk.log`      |
| `bun run verify:fixtures`             | 0      | 扫描 915 份录制，761 份完成返回体结构验证，0 failures；4 份没有 ModuleBody，不在结构审计范围 | `.artifacts/testing/issue-105/fixtures.log` |
| `bun run test:load:smoke`             | 0      | 专项 87 pass、0 fail、0 skip；500 次 loopback 请求，failures=[]，资源归零                    | `.artifacts/testing/issue-105/smoke.log`    |
| `bun run test:load:soak`              | 0      | 600202.524ms、30201 次 loopback 请求，failures=[]，资源归零                                  | `.artifacts/testing/issue-105/soak.log`     |
| `bun scripts/mutation-test.mts --all` | 0      | 实际 mutation 模式，5/5 有效 killed，无 survived/invalid/timeout/tool-error；原工作区未变    | `.artifacts/testing/issue-105/mutation.log` |

每个命令的实际参数、起止时间、退出码和前后指纹见 `.artifacts/testing/issue-105/commands.json`；STDOUT/STDERR 同时单独保留。顶层 summary 为门禁进程记录，测试数量以以下原生报告为准。

## 原生报告与包证据

| 集合  | 结果                                  | schemaVersion 1 原始摘要                                                                   |
| ----- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| local | 3532 pass、0 fail、0 skip，107 个文件 | `.artifacts/testing/local/1794043538600-45ee3b21-aa6f-4cef-b6c0-64bc4b793f8d/summary.json` |
| sdk   | 32 pass、0 fail、0 skip，3 个文件     | `.artifacts/testing/sdk/1794043654035-a837230a-a445-4d56-95c8-d475b42419d2/summary.json`   |
| smoke | 87 pass、0 fail、0 skip，7 个文件     | `.artifacts/testing/smoke/1794043684377-b3cdc8d9-a4d0-49cc-a266-dfc2eff9d902/summary.json` |

已经独立解析上述原生 JUnit：testcase 数量与 summary 一致，没有失败或 skipped case。歌单 SDK 行为 17 项、HTTP 1 项、响应回放 5 项分别执行；具体标题与文件见 `.artifacts/testing/issue-105/ac-test-titles.json`，审计见 `junit-audit.json`。回放不作为请求或真实账号证据。

本轮复用测试系统重构后已有的单测、行为测试、回放、包消费者和定向变异，没有新增或修改测试。本轮验证既有实现，不将其记录为一次先写失败测试、再实现到通过的 TDD 开发。

Oxlint JSON 诊断为空，934 个文件扫描后为 0 warning、0 error；没有修改检查配置或禁用规则。输出见 `.artifacts/testing/issue-105/lint-diagnostics.json`。

最终候选包摘要：`.artifacts/testing/package/da0e4a10-3d52-4921-a340-02671d212913/summary.json`。
tarball SHA-256：`08d9446c5f1dc5d630d2bbb9879c06c399992a28fa5e7705def8acaf6af077cc`。
tarball：`.artifacts/testing/package/da0e4a10-3d52-4921-a340-02671d212913/hana-music-api-3.2.0.tgz`。
两个消费者使用同一 tarball，均实际从安装后的根入口调用 playlistSubscribe 并返回 status 200；Node 26.13.0 与 Bun 1.4.4 的退出码均为 0。包内对应的 711 份发布文件内容 hash 又与最终文件逐项核对。没有把历史 Node 24 CI 称为本轮 runtime 运行。

构建日志另有 tsdown 的 TypeScript 7.0 tsgo generator 弃用提示，以及 VitePress 的大分块提示。两项均保留在原始日志中；它们属于构建工具提示，不属于 Oxlint 诊断，对应构建命令实际退出 0。本轮没有关闭提示或降低 lint 规则。

## 负载与定向变异

| 模式  | 实际请求 | 时长         | p95      | upstreamActive | inflight | failures | 原始摘要                                                   |
| ----- | -------- | ------------ | -------- | -------------- | -------- | -------- | ---------------------------------------------------------- |
| smoke | 500      | 1354.016ms   | 72.590ms | 0              | 0        | []       | `.artifacts/testing/load/smoke-1794043687857/summary.json` |
| soak  | 30201    | 600202.524ms | 56.387ms | 0              | 0        | []       | `.artifacts/testing/load/soak-1794044288573/summary.json`  |

soak 的 rssGrowth 为 0。压力拒绝按负载脚本合同判定，`failures=[]` 表示负载门槛全部通过，不声称所有请求都是成功响应。

变异摘要：`.artifacts/testing/mutation/1794044289073-5acbeae0-6fd5-4125-9960-d59507237691/summary.json`。三个组的有限正常基线均非空、无失败/skip；变异类型检查通过后，预期标题下出现原生断言失败才计为 killed。每个变异 XML 和真实失败标题已重新解析核对，详见 `.artifacts/testing/issue-105/final-audit.json`。

| 故障                                    | 分类   | 预期断言                                                                                                 |
| --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `playlist-wrong-address`                | killed | playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header |
| `playlist-missing-body-token`           | killed | playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header |
| `playlist-os-contamination`             | killed | playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header |
| `shared-last-waiter-not-aborted`        | killed | controlled shared waiters keep independent deadlines and cancel the last upstream                        |
| `upload-commits-after-failed-pre-check` | killed | public voiceUpload stops after a failed strict stage 4                                                   |

正常回归的零失败与变异中预期的断言失败分别判定，后者没有被当作正常回归通过。

## 源码与证据复核

本轮由主任务直接核对实际源码、完整测试边界、命令退出码、原生 JUnit 和结构化摘要，没有复用历史审查结论。

规范复核：本轮无业务代码改动；生成物无差异；所有适用门禁通过；lint 为零诊断，未缩小扫描范围。需求、测试标题和各层边界按矩阵逐项对应。未发现遗留阻断项。

需求复核：playlist_subscribe 只选择 subscribe/unsubscribe 动作并提供 id；moduleActions 声明 optional/none、write、cache none、retry never。requestEffect 统一取 token、清理冲突头并在正文/头同值放置；request-plan 清理受控身份字段，Call 冻结用户会话和动作。Call 的 write 分支绕过 ReadStore，retryDecision 禁止写及 token 能力重放。SDK registry 和动态 loader 使用同一声明；profile 中没有 MUSIC_U/MUSIC_A。单执行链和 351 项待迁移列表由架构/发现测试及源码共同核对。ADR、接口说明和 patch changeset 齐全。未发现本票范围内的缺项或遗留阻断项。

## 逐项结论

| AC ID | 当前结论 | 决定性证据                                                                                                |
| ----- | -------- | --------------------------------------------------------------------------------------------------------- |
| AC-01 | 通过     | local 原生 strict public、named、invoke、HTTP loader 用例；同候选 package 根入口消费者                    |
| AC-02 | 通过     | local 原生 token provider/optional/none/空值用例及逐次发送次数                                            |
| AC-03 | 通过     | local 原生阶段同步、TestClock deadline、预先取消和迟到 token 用例                                         |
| AC-04 | 通过     | local 原生 complete web identity；解密正文、最终 URL/协议/UA/Cookie 断言                                  |
| AC-05 | 通过     | 同值正文/头、取消无 token、HTTP checkToken 输入拒绝；遗漏正文 token 变异被检出                            |
| AC-06 | 通过     | 冲突配置/大小写字段断言与并发 MUSIC_U/MUSIC_A/token 冻结快照用例                                          |
| AC-07 | 通过     | 原文成功/401/405 回放、单次发送及重复调用；loader 写动作绕过旧缓存名单；Call/retry 策略复核               |
| AC-08 | 通过     | module-discovery 原生声明/待迁移/别名导出用例、loader 动态边界、最终生成物检查                            |
| AC-09 | 通过     | 单 Effect 链和模块 lazy 架构用例；module、profile、Call、request、loader 实际源码复核                     |
| AC-10 | 通过     | 同 tarball 的 Node/Bun 安装后根入口调用、类型/导出/Standard Schema/serverless，包 SHA-256 与文件内容核对  |
| AC-11 | 通过     | 本票三个变异全部有效 killed；正常基线/类型检查通过，关联原生 JUnit 预期断言失败；其他两组另有回归证据     |
| AC-12 | 通过     | 生成器及最终 check 均成功；接口说明、架构文档、ADR-0001、changeset 齐全                                   |
| AC-13 | 通过     | 六个门禁退出 0 且指纹未变；JUnit 无普通失败/skip，资源归零，变异与 lint 合格；本记录格式/拼写检查均退出 0 |

## 不适用项与边界

| 项目                                 | 本轮状态及理由                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真实账号登录/收藏 E1                 | 未执行，本轮不适用。原票默认不连真实账号，本轮验收请求合同；没有本次身份、token、目标和写入/恢复授权，也没有把历史 E1 当本次通过。若将其新增为必验条件，缺条件必须记为阻塞。 |
| 匿名 live                            | 不适用。本票为账号写请求合同，不以匿名查询证明收藏；本地 live 控制样本已包含在完整集合。                                                                                     |
| 独立 CI 上传故障演练、发布 preflight | 不适用。本轮不验收测试系统部署或发布流程；历史 PR 119 结果不替代本次本地证据。                                                                                               |

内存替身证明 SDK/HTTP 请求编排，回放证明返回合同，loopback 证明 socket/取消/清理；它们不声称网易云当前接受 token 或真实账号状态已改变。没有扩大其他模块的 profile 验收范围。

## 验收准备与归档

准备过程的第一轮因澄清回归/变异的结果分类而更改矩阵，第二轮因修正未生效的状态引用而更改矩阵，分别保存在 `.artifacts/testing/issue-105-attempt-1/` 与 `issue-105-attempt-2/`。第二轮六条命令自身均通过，但不将该旧候选结果混入最终候选。本轮全部六条门禁再次从头运行后通过；矩阵的状态列现在统一链接到运行记录，记录更新不再改动需求指纹。

本记录已通过格式与拼写检查，日志为 `.artifacts/testing/issue-105/final-fmt.log` 和 `final-spell.log`；写入最终结论后再次运行相同检查，通过后已同步远端 13 项勾选。验收结束时，两份文档尚未提交，ticket 保持开放。

用户于 2026-11-07 在确认验收结果及测试复用情况后，明确要求提交并推送两份验收文档，再关闭 #105。需求矩阵保留验收执行时的范围；该后续授权用于本次归档收尾。

归档提交只包含验收矩阵与本记录，文档收尾检查执行 `bun run fmt:check`、`bun run spell` 和差异检查。完整门禁的 testedHead、内容指纹和实际运行时间保留为上文所记，不将提交后的 HEAD 冒充为重新执行过完整门禁。最终提交与关票状态可从 [GitHub #105](https://github.com/nonhana/hana-music-api/issues/105) 的收尾记录追溯。
