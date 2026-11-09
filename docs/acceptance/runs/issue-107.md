# #107 当次验收

基线：`feature/refactor`，`d03260f7bf2f015311031898b689ff7340b52e6e`，起始工作区干净。

当前状态：完成。本次真实 origin 初始化与双次取值已获授权并通过，需求矩阵中的实施前外部缺项已补齐；全部适用门禁和独立双轴审查均通过。无提交、推送、账号操作或发布。

## TDD 与阶段证据

所有以下路径相对 `.artifacts/testing/issue-107/`；runner 日志中的 report 字段指向对应原生 JUnit、子进程日志与候选摘要。首次 `01-init-red.log` 是浏览器尚未安装的环境失败，不计行为 red。

| 切片                   | 实际命令                                                                                                           | red 与 green                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 初始化复用             | `bun scripts/test.mts watchman`                                                                                    | `02-init-red.log`：并发初始化应 fulfilled 却 rejected；`03-init-green.log` 通过                                                                        |
| 按次取值与默认参数     | 同上                                                                                                               | `04-token-red.log`：返回 token 错误而非两次独立值；`05-token-green.log` 通过                                                                           |
| 取值错误、脱敏和期限   | 同上                                                                                                               | `06-token-errors-red.log`：原始异常泄漏且等待无界；`07-token-errors-green.log` 通过                                                                    |
| 初始化失败恢复         | 同上                                                                                                               | `08-recovery-red.log`：脚本/初始化失败后无法恢复；`09-recovery-green.log` 通过                                                                         |
| 参数、nonce 与配置冲突 | 同上                                                                                                               | `10-configuration-red.log`：nonce 缺失且冲突被接受；`11-configuration-green.log` 通过                                                                  |
| 无效配置               | 同上                                                                                                               | `12-invalid-options-red.log`：无效配置仍加载/接受；`13-invalid-options-green.log` 通过                                                                 |
| 包导出                 | `bun test ./tests/package/release.test.ts -t 'root and isolated watchman' --reporter=junit --reporter-outfile=...` | `14-export-red.log/xml`：缺少子路径映射的断言失败；`15-export-green.log/xml` 通过，窄选择不代替最终整套                                                |
| 同页模块副本           | `bun scripts/test.mts watchman`                                                                                    | `17-page-scope-red.log`：两个实例/脚本；`18-page-scope-green.log` 通过                                                                                 |
| 变异判定修正           | `bun test ./tests/unit/testing/mutation.test.ts ...`                                                               | `22-mutation-classifier-red.log/xml`：标题文字被误判为 timeout；`23-mutation-classifier-green.log/xml` 全部 9 个控制样本通过，真实 TimeoutError 仍拒绝 |

现有 SDK 字符串/provider、optional/none、取消/期限与读接口回归直接复用，不故意破坏已有实现制造 red。补充脚本加载期限、官方抛错/无效实例、迟到回调和 token 交错回调的浏览器行为回归。加载超时恢复测试在重试前显式恢复网络边界，避免把仍未恢复的悬挂资源误当成可用上游。

`16-package.log/xml`：开发阶段同 tarball 包消费者 5 个测试通过，包括 Node/Bun DOM 访问陷阱、无 DOM/Node 声明检查、真实 Chromium/CSP 和 serverless。`24-watchman-mutation.log`：重复初始化、缓存 token、失败状态残留三项均 killed，包含编译通过和关联断言失败证据。阶段结果不代替最终候选门禁。

最初加入 DOM 全局声明的类型检查影响既有服务端类型，已改为局部浏览器边界类型，未降低编译配置。新增 Chromium 安装步骤供 verify、候选、release、mutation 和需准备包的匿名 live workflow 使用；只修改配置，不声称远端执行通过。文档新增参数/错误/SSR/权限边界、ADR-0003 和 minor changeset。

## 最终候选

源码指纹、完整未提交范围和实际门禁输出在最终执行后追加。原始目录 `.artifacts/testing/issue-107/`，候选快照 `final-candidate.json`。实施前 AC-10 曾因缺少 origin 阻塞，现已按下文当次授权与真实证据补齐；全部门禁与独立审查的最终结果见下文。

## 独立审查修复

独立 reviewer 发现 Trusted Types 页面拒绝 script URL 赋值时同步抛错，早启的计时器又读取尚未初始化的清理回调，留下悬挂状态。`25-trusted-types-red.log` 的真实 Chromium 断言确认 synchronous/unbounded 和 pageerror；修复后 `26-trusted-types-green.log` 的 16 项行为通过。所有加载 DOM 操作已在 catch 内，回调先就绪再启动计时器；错误以 script-load Promise 拒绝并清理，不增加 Trusted Types 绕过。

同次修复将旧 onload/onerror 属性检查替换为真实 DOM add/remove listener ledger，失败与恢复后活动监听均为零。浏览器期限回归使用 100ms 产品期限与 750ms 测试外层边界，给 CI 调度留出余量，断言和失败条件不变。reviewer 已读取 red/green 原生 JUnit 并确认发现修复，最终结论仍待同候选完整门禁。

第一次完整 verify 在修复前通过，但后续串行门禁已停止；相关候选和输出移至 `.artifacts/testing/issue-107/pre-review/`，不作为最终候选通过证明。下面的最终执行会重新收集全部适用结果。

## AC-10：真实 origin 当次验证

用户先明确授权本次官方脚本加载与连续两次取值，再提供 `https://campanula-test.caelum.moe/`。当次实际命令为 `LIVE_UPSTREAM=1 bun .artifacts/testing/issue-107/live-probe.mts`，退出码 0；输出 `live-origin.log`，结构化摘要 `.artifacts/testing/watchman-live/792fcfb2-c492-40b3-948e-321e0ee63b8b/summary.json`，浏览器依赖图在同目录 `browser-metafile.json`。

在隔离安装已通过 Node/Bun 消费者的同一 tarball 后，Chromium 158.0.8127.18 加载真实 origin 文档，保留其 CSP。浏览器中阻止应用其余子资源，避免引出业务或账号调用；仅在浏览器路由中提供同源候选模块，没有向服务器部署文件。官方 CDN 与 Watchman 的连接真实：共 7 次实际网络，origin 1 次、[官方脚本 CDN](https://acstatic-dun.126.net) 2 次、ac.dun.163.com 4 次，低于 40 次预算。额外阻止的 68 个应用资源不作为外部成功请求；没有账号凭据、登录或收藏写入。

官方脚本返回 200，SHA-256 为 `c34edd7444347de42869136b510600f8d53f605a2e471c42d4f2eaf99842d91d`。一次初始化，同一实例连续两次调用取得的长度均为 170，结果通过，未保存原文。身份类别 anonymous-isolated-browser，地区 unknown；时间见摘要 startedAt/endedAt。实际参数 productNumber `YD00000558929251`、protocol `https`、businessKey `bd5d2f973ef74cd2a61325a412ae54d9`，初始化和各次取值期限均 15000ms；结构化摘要按通用脱敏规则隐藏名为 tokenTimeoutMs 的数值，执行脚本与本记录保留公开超时参数。

候选指纹 `f91199fe9e4d19340433ffa9a9d56e6c501d11fc8b44ec465af7efc7ea18e835`，tarball SHA-256 `5e10f126faa253be777f4975798b60e7b0abee62261bb4bbb4bc46473356ce98`，与最终门禁及同包消费者一致。这项证明该 origin 中当前官方初始化/取值能力；Campanula 部署升级和真实账号收藏闭环属于 P14，不在本票声称完成。

## 最终门禁与同候选证据

最终 HEAD `d03260f7bf2f015311031898b689ff7340b52e6e`，内容指纹 `f91199fe9e4d19340433ffa9a9d56e6c501d11fc8b44ec465af7efc7ea18e835`，diff 指纹 `0c7ed9cc739dfe54981da95e84a51d5a7d3994edd1ece56785b6a2711d7324ed`。每个门禁执行前及全部结束后均比对指纹，完全一致，未提交范围见 `.artifacts/testing/issue-107/review-workspace-status.txt`。起始工作区干净，所有当前改动属于本票，无已有用户改动被覆盖。

| 实际命令                              | 退出码/结果 | 原始日志                                            |
| ------------------------------------- | ----------- | --------------------------------------------------- |
| `bun run verify`                      | 0 / PASS    | `.artifacts/testing/issue-107/final-verify.log`     |
| `bun run verify:sdk`                  | 0 / PASS    | `.artifacts/testing/issue-107/final-verify-sdk.log` |
| `bun run verify:fixtures`             | 0 / PASS    | `.artifacts/testing/issue-107/final-fixtures.log`   |
| `bun run test:load:smoke`             | 0 / PASS    | `.artifacts/testing/issue-107/final-smoke.log`      |
| `bun run test:load:soak`              | 0 / PASS    | `.artifacts/testing/issue-107/final-soak.log`       |
| `bun scripts/mutation-test.mts --all` | 0 / PASS    | `.artifacts/testing/issue-107/final-mutation.log`   |

`verify:sdk` 内含 `build:check`、`test:sdk-contract`。完整 local 3562 pass / 0 fail / 0 skip，SDK 32/0/0，smoke 行为集合 100/0/0。lint 为 0 warning、0 error，typecheck、spell、fmt 和文档构建均通过。VitePress 仍输出既有 >500kB chunk 体积建议，不是 lint warning，也未调整阈值或忽略规则来抹去提示。fixtures 审计 failures=0；4 份无 ModuleBody 的既有录制未做结构校验，不声称所有录制都有 Schema。

smoke 500 次，结束清零；soak 实际 600191ms、30301 次 loopback 请求，`upstreamActive=0`、`inflight=0`、`failures=[]`。详细报告 `.artifacts/testing/load/soak-1794053859731.json`。

全部登记变异 11/11 killed，无 survived/invalid/timeout/tool-error。最终摘要 `/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/mutation/1794053860190-5d97bfb4-eefc-4b0d-82ff-8e308b6df217/summary.json`；对应编译日志与原生 JUnit 在同目录。Watchman 的三个关联断言分别识别不复用初始化、缓存 token、失败状态残留，其他目标的 killed 不充当 Watchman 证据。

同候选包报告：`.artifacts/testing/package/72663f6d-1940-4944-9b04-7f782791bd4f/summary.json` 与 `.artifacts/testing/package/25da25d9-f6b3-4837-8d48-a658381c6876/summary.json`，tarball hash 一致。实际消费者 Node 26.13.0、Bun 1.4.4；Chromium 158.0.8127.18，严格 CSP 下真实 nonce 加载、按次取值，浏览器依赖图仅消费者入口和 dist/watchman.js。未声称本地用的是 Node 24，也未触发远端 CI/保护规则验收。

完整证据索引 `.artifacts/testing/issue-107/evidence-index.json`，原生 JUnit 和每文件实际命令在各 runner summary 引用的路径。运行报告不计入候选指纹，最后仍单独执行格式与拼写检查。

## 逐项验收

| AC    | 状态 | 实际证据                                                                                     |
| ----- | ---- | -------------------------------------------------------------------------------------------- |
| AC-01 | PASS | 默认/覆盖初始化参数和业务 key；运行时官方脚本，behavior 与 package 的实际标签及入参          |
| AC-02 | PASS | 并发、重复及模块副本同页复用，实际脚本/初始化计数与同一 client                               |
| AC-03 | PASS | 加载/缺接口/回调报错/抛错/无效实例/期限/Trusted Types 拒绝后恢复；监听 ledger 清零和迟到回调 |
| AC-04 | PASS | 连续与交错 token 回调独立，调用次数与业务 key，旧 token 缓存故障 killed                      |
| AC-05 | PASS | 空白/抛错/期限错误脱敏、后续取值恢复、存储/日志/网络边界与源码审查                           |
| AC-06 | PASS | 同包 Node/Bun DOM 访问陷阱导入安全，initializer 环境错误，子路径无 DOM/Node 声明消费者       |
| AC-07 | PASS | 既有公开 SDK provider、optional/none、取消/期限、单次发送与读取行为回归，完整 local 通过     |
| AC-08 | PASS | 同 tarball 安装、公开映射/声明、内部路径拒绝、负向类型与 serverless 消费者                   |
| AC-09 | PASS | 安装包真实 Chromium/CSP/nonce 执行，产物依赖图与根入口隔离                                   |
| AC-10 | PASS | 本次授权真实 origin、同候选包、官方 CDN、同实例两次长度 170；上节脱敏记录                    |
| AC-11 | PASS | suites 清单/选择、原生 JUnit 与新增三变异有效 killed；runner 正/负故障控制                   |
| AC-12 | PASS | 同一最终候选全部六门通过、lint 零警告零错误、负载清零、外部专项通过                          |
| AC-13 | PASS | 需求矩阵、TDD/原始结果、指南/公共边界/ADR/minor changeset，独立审查最终结论另记              |

### 精确的窄选择 TDD 命令

窄选择只用于 red/green 定位，最终门禁运行完整必要集合。

```bash
bun test ./tests/package/release.test.ts -t 'root and isolated watchman' --reporter=junit --reporter-outfile=.artifacts/testing/issue-107/14-export-red.xml
bun test ./tests/package/release.test.ts -t 'root and isolated watchman' --reporter=junit --reporter-outfile=.artifacts/testing/issue-107/15-export-green.xml
bun test ./tests/unit/testing/mutation.test.ts -t 'control timeout-title' --reporter=junit --reporter-outfile=.artifacts/testing/issue-107/22-mutation-classifier-red.xml
bun test ./tests/unit/testing/mutation.test.ts --reporter=junit --reporter-outfile=.artifacts/testing/issue-107/23-mutation-classifier-green.xml
```

## 独立双轴审查与交付结论

未参与实现的独立 reviewer `issue107_review` 读取完整当前工作区、所有已提交/暂存/未暂存差异及非忽略未跟踪文件，直接核对原始来源、需求矩阵、编译日志、原生 JUnit、包 hash、六门结果和真实 origin 专项。最终结论：规范轴 PASS，需求轴 PASS，整体候选 PASS，无未解决 actionable finding。先前 Trusted Types 的 P1 和监听清理证据缺口均已修复并经 reviewer 复核。

当前 13 项 AC 已有实际证据，适用门禁全部通过，没有失败、阻塞或用户豁免项。最终候选在交付报告更新后仍保持相同内容指纹；报告单独通过 `bun run fmt:check` 和 `bun run spell`。实现、验收与审查交付完成，改动保留在当前工作区；未提交、推送、创建 PR、关票、发布或变更远端配置。

## 后续调整与收尾授权

以上记录保留首次实现阶段的候选、门禁与真实 origin 证据。随后按用户要求，为浏览器入口配置完整 DOM 类型，替换手写浏览器类型与固定全局字段反射，并重新验证 typecheck、声明构建和同包消费者；该轮最终结果见 [浏览器 DOM 类型验收](browser-dom-types.md)，不将首次真实 origin 结果说成后续候选重新执行的结果。

2026-11-07，用户明确授权按项目约定提交、推送并关闭 #107。收尾前重新计算当前内容指纹，为 `1b80ea339f74ffc039667a1743470ec341de78778126dd40b553ac77a8cbb2c4`，与后续类型调整的最终门禁和独立审查候选一致；没有新增产品或测试改动。提交、推送、远端检查及关票结果以 [#107 收尾评论](https://github.com/nonhana/hana-music-api/issues/107) 为准。
