# #106 当次实施与验收

需求矩阵：[issue-106.md](../issue-106.md)。基线：`feature/refactor`，HEAD `eb8f8616b986549e6b510b71849fd207a89d4efa`；起始工作区干净，无既有用户改动。范围和授权以矩阵为准，未执行提交、推送、PR、关票、真实上游或发布。

## 实施与 TDD

新行为 red：公开 createHanaMusicApi.search 配置冲突的协议、域名、UA 和身份时，应按本地操作声明发出 eapi 请求。迁移前实际发送 `https://music.163.com/weapi/search/get`，严格 fake 拒绝错误 URL；1 fail、退出 1，证据 `.artifacts/testing/issue-106/red-profile.log` 与原生 `red-profile.xml`。这是请求行为 red，不是导入、环境或类型错误。

green：四模块导出五个本地动作，经 buildActionRequestIntent 和既有链执行。search（普通/语音）、lyric、playlist_detail 使用明确的 eapi profile；song_detail 使用已有 web profile。生成 registry 和 pending 清单由生成器更新，已迁移共 5 个模块，待迁移 347 个。profile 无 cache/retry 或用户会话，未改 ReadStore 与唯一执行器。首条用例 green 为 1 pass、退出 0，见 `green-profile.log/xml`。

保留行为复用：既有 shared-reads、call-runtime、endpoint-policy、read-modules、module-loader、replay 和 transport 责任继续执行；不故意破坏产品制造 red。补充的 13 个用例从实际 SDK/HTTP/网络边界检查五个分支的正文、有限发送、缓存/克隆、身份/输入/fetcher 隔离、错误与重试、完整正文期间等待者取消/超时/最后中断。动作键的 profile/target 隔离与 read 资格规则通过 runCall 内部合同边界验证，明确区别于公开配置覆盖。

窄回归：`bun test tests/behavior/runtime/shared-read-actions.test.ts tests/behavior/modules/library/read-modules.test.ts tests/unit/testing/live-runner.test.ts tests/behavior/architecture/module-discovery.test.ts --preload ./tests/fixtures/consumers/offline.ts --reporter=junit --reporter-outfile=.artifacts/testing/issue-106/focused.xml`，66 pass、0 fail、退出 0，见 `focused.log/xml`。旧 capability 测试增加动作名断言；SDK/程序化入口与 live 控制样本改为新声明的实际协议，保留原业务/失败/恢复断言。初次全回归的 26 项失败已记录在 `full-early.log` 及其 local summary，不作为最终候选结果。

定向变异预验：`bun scripts/mutation-test.mts --target shared-reads` 退出 0，四故障均有效 killed：动作键遗漏、read 语义错误授予共享、搜索重试关闭、最后等待者未中断。非空正常基线与变异均通过类型检查，对应原生 JUnit 的预期断言确实失败；见 `mutation-early.log` 指向的 summary。最终同候选仍执行全登记目标。

兼容变化：四模块不再接受普通调用覆盖协议、目标域名、UA、e_r 或 acceptGzip，记入 major changeset；需要低层控制时用 createRequest。默认协议没有切换；song_detail 使用完整 web 身份。三个 eapi 接口的既有身份组合、来源与证据限制在 ADR-0001 列明，不将本地 fake、解密或原响应录制宣称为官方请求验证。

## 最终候选与门禁

最终正式证据根：`.artifacts/testing/issue-106/final-3/`（此前失败保留于根目录、final、final-2，不能计作最终通过）。`candidate.json` 固定源码内容与 diff 指纹，`commands.json` 记录命令数组、起止时间、退出码和每条前后候选比对；`gate-N/summary.json` 为 schemaVersion 1 摘要，`gate-N.log` 与 `.stderr` 保留完整原始输出。独立测试 runner 保留每文件原生 JUnit、日志及汇总；包验证保留 tarball SHA-256。

首轮正式 verify 在 3544 pass、1 fail 时停止：`request.test.ts` 的超时用例未等待 rejects 断言，随即检查 fetcher 信号；1ms 总期限也可能在准备阶段耗尽。修复测试的等待、使用 1000ms 总期限并断言实际 abort；不改变产品期限实现。日志保留在首轮 local summary（`1794048048625-3ba94177-9b78-43a2-afe3-17c43422f87b`）。正文阶段信号另设 highWaterMark=0，确保 pull 由 reader.read 触发；独立 reviewer 同意该补强。reviewer 的配置参考/加密模式文档问题已修复，随后刷新候选并完整重跑。

第二轮 verify 在 3545 pass 后因 Bun rejects matcher 的非 Thenable 类型被 lint 拒绝；改用现有 settle 等待真实结果，随后 lint/typecheck/格式/拼写预检通过。final-2 的 verify、SDK、fixtures 已通过，但负载 CLI 揭露 search 手工装配未带动作合同和严格 loopback 未登记 eapi 路径，返回 HTTP 400。补齐两处路径消费者后 smoke 预验：100 pass，500 次 loopback，99% 同请求合并率，upstreamActive/inflight 均 0；独立 reviewer 核对修复未放宽断言或未知路由限制。最终刷新候选完整重跑，以上旧结果只作过程证据。

最终候选：testedHead `eb8f8616b986549e6b510b71849fd207a89d4efa` 加本次未提交工作区；内容 SHA-256 `de97bfcd6d6798f789027f88fe985d4ec4ce6f93a57c62b2e0c6a96839c235cd`，diff SHA-256 `7a5917bd4d08daa9328a83908b77c8a47f00d182bac893a23799bf1c83ffcc62`。运行记录按 TESTING 排除，所有需求矩阵、源码、测试、文档和 changeset 均计入指纹。

| 实际命令                              | 退出码 / 状态 | 结果与原始证据                                                                                                                                                                                  |
| ------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run types:modules:generate`      | 0 / PASS      | `../generate.log`；正式 verify 与 verify:sdk 的 check 再次确认生成物一致                                                                                                                        |
| `bun run verify`                      | 0 / PASS      | 3545 pass、0 fail、0 skip；typecheck、lint、spell、fmt:check、docs:build 通过；`gate-0.log` / `.stderr`，local `1794048727907-5bb0cf2a-b40c-4db5-a2be-6eb8b2c1d4ea/summary.json` 和原生 JUnit   |
| `bun run verify:sdk`                  | 0 / PASS      | 32 pass、0 fail、0 skip；build:check（publint/attw）、包消费者、公开类型及 serverless 合同通过；`gate-1.log` / `.stderr`，sdk `1794048851886-b4f6f8d5-8f50-4a21-8d31-23ad0c4d8010/summary.json` |
| `bun run verify:fixtures`             | 0 / PASS      | scanned 915，validated 761，failures 0；150 个业务拒绝、4 个无 ModuleBody 单列；`gate-2.log` / `.stderr`                                                                                        |
| `bun run test:load:smoke`             | 0 / PASS      | 100 pass、0 fail、0 skip；500 请求、合并率 0.99，upstreamActive/inflight=0；`gate-3.log` / `.stderr`，load `smoke-1794048890565.json`                                                           |
| `bun run test:load:soak`              | 0 / PASS      | 实际 600161.329666ms、30202 请求、failures=[]，upstreamActive/inflight=0，p95=58.85675ms，rssGrowth=0；`gate-4.log` / `.stderr`                                                                 |
| `bun scripts/mutation-test.mts --all` | 0 / PASS      | 8/8 有效 killed，0 survived/invalid/timeout/tool-error；`gate-5.log` / `.stderr`，mutation `1794049491861-1c8b7d07-436e-474a-aaea-46b22ef37bcc/summary.json`                                    |

同包 Node 26.13.0 / Bun 1.4.4 均退出 0、status 200，实际调用根入口的搜索（client/具名/invoke）、歌词、歌曲详情、歌单详情及既有收藏写合同。tarball：`.artifacts/testing/package/50798949-ce84-4497-90b6-f37384b83b85/hana-music-api-3.2.0.tgz`，SHA-256 `9fc7c9c1bbe3a4fbdc892203f13d3afd96130ce87afa78d399587b9b4e0213d7`，711 份文件 hash 记录于同目录 summary；独立 reviewer 已重新计算 tarball hash。

lint 使用 `oxlint . --deny-warnings`，0 warning、0 error，未调整规则、忽略范围或失败判定。构建中既有的 tsgo 弃用和 VitePress 分块提示保留于 stderr，相关构建退出 0；没有将这些提示声称为 lint 诊断。

完整审查快照在 `final-3/review/`：committed/cached/worktree diff、status 和全部非忽略未跟踪文件原文。报告本身最终另跑格式/拼写检查。

## 逐项结论

| AC    | 状态 | 决定性证据                                                                                                                                                           |
| ----- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | PASS | 五个真实分支的目标/协议/解密正文与请求头；SDK/具名/invoke/程序化/真实 HTTP loader 运行；声明与 pending 清单一致；profile 不含策略或会话                              |
| AC-02 | PASS | 公开模块的 TTL 命中、默认不缓存完成结果、同请求合并及响应隔离；跨身份/参数/实际 fetcher 隔离；同 CallServices 的有效 profile/target 独立结果；read/cache none 不共享 |
| AC-03 | PASS | highWaterMark=0 的正文读阶段同步：独立取消 499、短期限 504，剩余者成功；最后等待者离开后 reader.cancel 与上游 abort，inflight=0；旧 controlled 回归仍通过            |
| AC-04 | PASS | 连接失败三尝试、网络失败默认单次/显式两次；400/429/503 不缓存或扩张重试；既有写/轮询边界；相应 key/资格/重试/最后中断故障均有效 killed                               |
| AC-05 | PASS | smoke 500 与 soak 30202 实际 loopback 请求均结束于 upstreamActive/inflight=0，failures=[]；十分钟及全部延迟/容量/内存判定通过                                        |
| AC-06 | PASS | 生成并两次 check；同 tarball Node/Bun 实际根入口调用四模块；711 发布文件 hash 一致；915 录制审计无失败；ADR、配置/缓存指南和 major changeset 同步                    |
| AC-07 | PASS | 六条正式门禁全退出 0、全程内容指纹一致；lint 0 warning/0 error；原生 JUnit 3545/32/100 与摘要一致；独立审查最终结论见下节                                            |

最终独立审计：`bun .artifacts/testing/issue-106/audit-final.mts` 退出 0。`final-3/audit.json` 同时核对六条命令前后指纹、原生 JUnit 的非空/无失败/无 skip、smoke/soak 原始报告、tarball 与 711 份实际发布文件哈希，未将历史或修复前结果计入。soak 原始报告：`.artifacts/testing/load/soak-1794049491316.json`。定向变异三组正常基线和所有故障类型检查均通过；预期原生断言失败才计 killed，故障只发生在临时副本。

## 独立双轴审查

review_issue106 为未参与实现的独立 agent，按 hana-implement/references/review.md 只读审查原始 #106/#80、当前规范、完整已暂存/未暂存/未跟踪差异、源码和实际日志。最终结论：**规范轴 PASS、需求轴 PASS，无未解决阻断项。**

此前发现的配置指南过时、负载脚本漏装配动作合同均已修复并重新审查；正文流 highWaterMark=0 的阶段补强、超时测试使用 settle 等待及实际 abort 断言也被独立复核。reviewer 直接解析 local/sdk/smoke 原生 JUnit、soak 原始报告、变异预期断言与类型检查日志，并重新计算 tarball SHA-256；确认六条门禁、非空正常基线和最终源码同指纹。构建提示与 lint 诊断分别记录，没有规则豁免。

最终交付状态：**完成（本地 #106 范围）**。需求 AC-01～AC-07、适用门禁、独立审查均 PASS，未遗留失败或阻塞。

## 外部边界与交付

真实 live、账号专项、远端 CI 演练和发布 preflight 在实施前列为不适用；本轮未请求真实上游，没有凭据或历史账号授权的继承。loopback 负载不证明网易云当前可用性。授权内交付为可审查工作区与验收记录。

报告收尾检查：`bun run fmt:check`、`bun run spell`、`git diff --check`；结果以最终工具输出和 `final-3/final-checks.log` 为准。运行记录不计入源码指纹，收尾后再核对当前内容指纹与最终候选相同。

## 2026-11-07 关票收尾

用户在确认验收及 eapi 保留原因后，明确授权“根据验收结果更新原票的 Acceptance criteria，然后关票”。已将 #106 的原五项 AC 按实际证据细化并补充为 AC-01～AC-07，全部勾选，原票附上同候选门禁、独立审查、包与源码指纹、协议及外部验证边界。更新后读取远端正文，确认与准备内容一致，再按 completed 关闭。

远端回读：[issue #106](https://github.com/nonhana/hana-music-api/issues/106) 为 CLOSED，closedAt `2026-11-07T11:29:59Z`。关票前重新核对当前源码内容指纹与最终候选完全一致。原票已明确实现和验收文档仍在本地工作区，没有将关票声称为提交、推送、合并或发布；本轮没有执行这些动作。

## 本地提交收尾

关票后，用户明确授权按单行 `<type>: <message>` 格式提交。本次本地提交包含 #106 的实现、生成物、测试、major changeset、文档及验收记录。提交前再次核对内容指纹与上述最终候选一致；验收对应既有实际运行，不将提交本身称为重新跑过门禁。此前“未提交”均为对应阶段的状态，本次授权不包含推送或发布。
