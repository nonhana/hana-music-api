# #109 当次验收

来源：[#109](https://github.com/nonhana/hana-music-api/issues/109) 的 AC-01 至 AC-16、父票 #80；完整快照保存在 `.artifacts/testing/issue-109/source-109.json`、`source-80.json`，矩阵见 [issue-109.md](../issue-109.md)。

基线：`feature/refactor` / `6b0b9f8bc8e4ca34351be6c6945fe8fb35a0d1fb`，初始工作区干净。真实账号操作由用户在当前聊天明确授权，见后文记录；验收完成后，用户另行确认本任务完成并授权提交、推送及关闭 #109。

最终结论：完成。AC-01 至 AC-16 均通过，所有适用门禁通过，独立审查规范轴 PASS、需求轴 PASS，无未解决的阻断项。旧通过记录不作为当前证据。

## 候选

- testedHead：`6b0b9f8bc8e4ca34351be6c6945fe8fb35a0d1fb`
- 源码内容 SHA-256：`1d1e7e3064f97d2e834806efc3e103cf5947f727e121210651a6e56384e899be`
- diff SHA-256：`faa63dda3c774af6a97bd09390e0b7993921f90cc9536a059658ece8ea73b0a2`
- 同候选门禁元数据：`.artifacts/testing/issue-109/gates.json`；初始指纹：`candidate.json`。每条命令后重新核对指纹。
- 原始日志和 JUnit 保存在各 runner 的 `.artifacts/testing/<selection>/<run>/`；门禁顶层日志统一在 `.artifacts/testing/issue-109/`。报告和本 runs 不进入候选内容指纹，需求矩阵计入。

## 行为证据

| 切片             | red 的具体原因                                                                                      | green / 复用证据                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 通用 token       | red-token.log：1 pass / 14 fail，读取/未迁移模块未携带显式 token、缓存跳过 provider、多请求规则缺失 | check-token.log；最终完整 local 再执行                                                                      |
| 专辑/歌手 web    | red-collection.log：4 pass / 16 fail，旧 Cookie、可覆盖协议及目标不满足声明                         | collection-actions.log；21 个行为用例与八份回放                                                             |
| 传输脱敏         | red-redaction.log：19 pass / 1 fail，传输异常和事件含合成 token                                     | transport failures and request events redact the configured token                                           |
| 隐式注册         | red-anonymous-token.log：20 pass / 1 fail，身份初始化提前消费业务 token                             | implicit anonymous initialization never consumes or forwards the module token                               |
| 低层兼容         | red-low-level.log：21 pass / 1 fail，createRequest 原始正文/头被模块清理误删                        | low-level createRequest preserves explicit raw token body and headers                                       |
| plain 与目标安全 | red-plain-target.log：32 pass / 5 fail，网易云 plain token 被丢弃；无 Cookie 时 token 可被外域带走  | 两个批准 plain GET 仅头传递；外域、HTTP 和异常端口零业务发送                                                |
| 头值同值         | red-header-value.log：37 pass / 8 fail，首尾空格/TAB 被 HTTP 头改写，CR/LF 无有效头值               | 字符串/provider 各四类非法头值发送前 400；45 个 token 专项通过                                              |
| 既有责任         | 不人为破坏旧代码制造 red                                                                            | playlist provider 取消/期限/并发快照，四读取五分支无 token 原合同；新增五分支字符串/provider 最终 wire 回归 |

新增普通检查使用 runner 原生 JUnit，曾出现的测试语法/类型错误仅作工具失败，不计作行为 red；修正后重跑，最终结果另列。

## 逐项结论

| AC    | 当前证据                                                                                 | 状态                           |
| ----- | ---------------------------------------------------------------------------------------- | ------------------------------ |
| AC-01 | 矩阵、来源快照、必要条件与预选门禁                                                       | 通过                           |
| AC-02 | 三公开入口、待迁移模块、配置类型与取消/读取传值                                          | 通过                           |
| AC-03 | provider 错误/空值、独立取值、取消、总期限与迟到结果                                     | 通过                           |
| AC-04 | 四 API 协议独立解码、eapi 加密内头、plain 仅 HTTP 头                                     | 通过                           |
| AC-05 | cache/inflight 绕过、零重试、固定字符串一次、provider 多请求及失败停止                   | 通过                           |
| AC-06 | 四动作三配置、HTTP loader、POST/URL/业务正文、单次写入                                   | 通过                           |
| AC-07 | web Cookie 变化、冲突配置、专辑/歌手交错完成时身份与输入快照                             | 通过                           |
| AC-08 | 八份原录制，包含专辑重复取消的 rejected 404；既有非法输入/结构/业务拒绝回归              | 通过                           |
| AC-09 | 外部 NOS 零 token/会话、纯本地零取值、HTTP 拒绝、事件/错误脱敏、目标安全与 Watchman 回归 | 通过                           |
| AC-10 | 同包 Node/Bun 四动作/三配置，声明、导出、serverless、DOM/CSP                             | 通过                           |
| AC-11 | suites/kit/严格 ledger 与完整 runner 控制样本                                            | 通过                           |
| AC-12 | check-token 十一个故障及原五组登记目标                                                   | 通过                           |
| AC-13 | 当前授权身份、两枚 fresh token、四次写操作、完整读回及两个目标恢复                       | 通过                           |
| AC-14 | 生成物、七模块声明、指南/接口/ADR/agent-docs 和 major changeset                          | 通过                           |
| AC-15 | 同候选串行六条命令，lint 零警告零错误，smoke 资源归零                                    | 通过                           |
| AC-16 | 独立 reviewer 核对完整工作区、最终日志、同包关联及真实恢复                               | 通过，规范轴 PASS、需求轴 PASS |

## 最终门禁与原始产物

| 命令                                  | 退出码 | 指纹保持 | 原始日志                                           |
| ------------------------------------- | ------ | -------- | -------------------------------------------------- |
| `bun run verify`                      | 0      | 是       | `.artifacts/testing/issue-109/verify.log`          |
| `bun run verify:sdk`                  | 0      | 是       | `.artifacts/testing/issue-109/verify-sdk.log`      |
| `bun run verify:fixtures`             | 0      | 是       | `.artifacts/testing/issue-109/verify-fixtures.log` |
| `bun run test:load:smoke`             | 0      | 是       | `.artifacts/testing/issue-109/load-smoke.log`      |
| `bun run build:check`                 | 0      | 是       | `.artifacts/testing/issue-109/build-check.log`     |
| `bun scripts/mutation-test.mts --all` | 0      | 是       | `.artifacts/testing/issue-109/mutation-all.log`    |

以下所有自动检查摘要的 candidate.contentSha256 与最终候选一致，原生 JUnit 位于摘要旁。旧轮次仅保留历史，不计入此轮通过。

- local：3637 pass / 0 fail / 0 skip；`.artifacts/testing/local/1794068841487-70c37159-79ad-4243-90e3-7cf7fb8de2bf/summary.json`。
- sdk：32 pass / 0 fail / 0 skip；`.artifacts/testing/sdk/1794068976166-4d0c3d99-f7a6-40c5-8f66-be481eb8dc13/summary.json`。
- package：1 pass / 0 fail / 0 skip；`.artifacts/testing/package/65738afe-ae0f-456f-95bf-208f5511fe7c/summary.json`。
- smoke：145 pass / 0 fail / 0 skip；`.artifacts/testing/smoke/1794069009118-e84016ab-69a7-4956-b50a-16e2d52a1013/summary.json`。
- load：1 pass / 0 fail / 0 skip；`.artifacts/testing/load/smoke-1794069012938/summary.json`。
- mutation：24 pass / 0 fail / 0 skip；`.artifacts/testing/mutation/1794069019967-b5ce9676-8f58-4349-a436-ee3605485097/summary.json`。

同包 tarball SHA-256：`519d0da695553fde2da1e2dc75804e8a0b6b1c8a61a10f3249a79722ca402a2c`。实际消费者为 node 26.13.0（exit 0）、bun 1.4.4（exit 0）；同包浏览器/CSP、两类声明和单文件 serverless 通过。

smoke 为 500 次 loopback 请求，按既有预期拒绝/取消/超时判定通过，`upstreamActive=0`、`inflight=0`、`failures=[]`。这不是网易云可用性证据。

全量变异 24/24 有效 killed，包括本票 11 项及既有五组；无 survived/invalid/timeout/tool-error。基线和普通变异类型检查通过，关联 JUnit 出现预期原生断言失败；浏览器类型控制按专用规则判定。原工作区指纹保持。

## 独立审查

review_109 未参与实施，只读检查完整工作区：base...HEAD、cached、工作区 diff，以及全部非忽略 untracked 原文；规范以 AGENTS/agent-docs/ADR 为准，需求以来源快照和矩阵为准。已反馈并修复低层原语兼容、共享读取五分支证据、回放 resolved/rejected、批准 plain 传值和无 Cookie 的 token 外送边界。reviewer 已独立通过本地 fetcher 重现并确认实现问题消除；最终 reviewer 已直接复核原始日志、原生 JUnit、关联变异断言、完整工作区、同候选指纹与当次真实恢复：规范轴 PASS，需求轴 PASS，无未解决的 actionable findings。最终复核记录保存在 `.artifacts/testing/issue-109/review-final.md`。上一候选五条常规门禁通过，但 mutation 的两项因未到原生断言而 invalid，不计通过；原始结果归档到 `.artifacts/testing/issue-109/attempt-1/`。改为 settle 后执行原生成功断言，保留严格 ledger；补头值校验后，当前 check-token 十一个故障已全部有效 killed。

## AC-13 当次授权与真实上游证据

需求矩阵中的条件按本节记录本次实际状态。用户明确指定 `_notes/credential/` 的凭据供本次使用，允许 agent 选择专辑和歌手，确认预期 UID，并在两次收藏前分别通知 fresh checkToken 已更新。授权只用于这两个目标的收藏/取消及必要恢复，不继承为以后账号操作权限。账号标识只记录 SHA-256，Cookie/token 正文不进入报告或仓库。

真实调用时源码指纹为 `981ceeb789b9cdef801aedc9566df8e08c9d7b93aaf5c4171e7e91f71f9440b4`，原始记录保持该值。之后仅同步需求矩阵的授权/条件说明，产品代码未变化；最终通过同一 tarball SHA-256 关联到新候选，不重复账号写入。

真实调用使用已通过 Node/Bun 消费者的同一安装 tarball，SHA-256 为 `519d0da695553fde2da1e2dc75804e8a0b6b1c8a61a10f3249a79722ca402a2c`。本机 Bun 1.4.4；地区 unknown。登录状态 account/profile 与用户确认的身份一致；Cookie 文件从登录到写入保持同一内容指纹。收藏使用两枚不同的当次字符串，取消明确不配置 token；未复用 token，不生成 token，也没有自动业务写入序列。每次 SDK 写调用由 agent 在观察前一步结果后单独调度。

浏览器页面读取曾被站点安全策略禁止，随后结束 CUA，没有通过其他浏览器、CDP 或脚本绕过；fresh token 均由用户手动更新文件提供。旧单枚 token 未用于测试，也不将这次文件传值写成官方 origin/抓包证据。

| 对象                                              | 初始状态       | 收藏与完整读回                    | 取消与完整读回                      | 最终恢复                |
| ------------------------------------------------- | -------------- | --------------------------------- | ----------------------------------- | ----------------------- |
| 专辑 110646：The Chopin Collection: The Nocturnes | 未收藏；58 张  | HTTP/SDK 200，58 → 59，目标存在   | HTTP/SDK 200，59 → 58，目标不存在   | 全列表基线 SHA-256 相同 |
| 歌手 33737：肖邦                                  | 未收藏；237 位 | HTTP/SDK 200，237 → 238，目标存在 | HTTP/SDK 200，238 → 237，目标不存在 | 全列表基线 SHA-256 相同 |

共 14 次实际请求（10 次读取、4 次正常写入），低于 30 次业务预算；四次写各发送一次，四次读回各一次即可确认。恢复额度实际使用 0/6，没有失败窗口、自动重试或未确认恢复。两个列表均在每轮完整读取，除目标的临时加入外，其余 ID 集合哈希与初始一致。最终 `phase=complete`，两个 `restored=true`。

原始脱敏证据另含 `.artifacts/testing/issue-109/live-commands.json` 的十条实际命令及 gate 环境、`live-summary.json` 的当次汇总。原始脱敏证据：`.artifacts/testing/issue-109/live-identity.json`、`live-authorization.json`、`live-state.json`；单次调用脚本位于 `live-consumer/` 目录，仅本次人工调度，不作为新增自动 live suite/CI 入口。日志保留每次上游路径、web UA/os、是否带 token、HTTP 状态、SDK 返回、列表完整性和资源预算；不保存 Cookie/token 正文。

未运行匿名 live、十分钟 soak、远端 workflow 或发布；它们按实施前范围不适用，不计作通过。本次真实成功只证明本账号、两目标和本时段的兼容性，不扩成未来任意账号/接口可用保证。

## 提交与关票

用户已确认本任务完成，授权按项目约定提交、推送并关闭 #109。实际提交、远端分支与关闭回执记录在 [#109](https://github.com/nonhana/hana-music-api/issues/109)。本报告保留实际测试 HEAD、候选内容指纹和包哈希，不将提交后的 HEAD 改标为测试基线。
