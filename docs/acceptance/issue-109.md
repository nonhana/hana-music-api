# #109：统一可选 checkToken，迁移专辑与歌手收藏

来源：[#109](https://github.com/nonhana/hana-music-api/issues/109) 的 AC-01 至 AC-16；父合同 [#80](https://github.com/nonhana/hana-music-api/issues/80) 2026-11-07 更新。完整来源保存在 `.artifacts/testing/issue-109/source-109.json`、`source-80.json`。

基线：`feature/refactor`，HEAD `6b0b9f8bc8e4ca34351be6c6945fe8fb35a0d1fb`，初始工作区干净。目标为统一可选 token 接缝和 album_sub/artist_sub 四动作，不执行 P12 全量公开配置移除。

实施范围包括代码、测试、验收与独立审查；提交、推送、PR、关票及发布需另有明确授权。当次账号身份、凭据来源、两个目标及写入/恢复授权记录在 runs，不继承旧票许可；必要条件缺失时阻塞，其余工作继续。

## 验收矩阵

| AC    | 要求              | 入口与证据                                                           | 决定性预期                                                      | 条件/状态                                    |
| ----- | ----------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| AC-01 | 验收映射          | 本矩阵和 runs                                                        | 来源、入口、seam、证据与状态完整                                | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-02 | 公开配置          | behavior/runtime/check-token；package/types                          | 三入口、迁移与未迁移模块支持三种配置                            | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-03 | provider 生命周期 | check-token；playlist/subscribe                                      | 独立取值、失败零请求、受控取消/期限与迟到结果                   | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-04 | 协议编码          | check-token；独立 wire 解密                                          | weapi/eapi/api/linuxapi 的最终 token 位置                       | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-05 | 流量边界          | check-token；shared-read-actions                                     | 带 token 绕过 ReadStore/重试，provider 按请求取值，字符串仅一次 | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-06 | 专辑/歌手四动作   | collection-actions；HTTP                                             | 四 URL、POST、正文、声明及次数                                  | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-07 | 身份隔离          | collection-actions；playlist/subscribe                               | web Cookie 变化、冲突配置、并发身份快照                         | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-08 | 返回合同          | replay/library；解码/输入回归                                        | 八份历史录制与合成拒绝/形状边界，保留来源                       | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-09 | 安全边界          | check-token；upload；watchman                                        | HTTP 拒绝、外部无会话/token、本地零取值、日志脱敏               | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-10 | 候选包            | package/release；package/types                                       | 同包 Node/Bun 四动作与类型/导出/serverless/DOM                  | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-11 | 测试系统          | suites.ts；runner/kit 自测                                           | 分类与选择登记，网络边界替换及 ledger 清理                      | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-12 | 定向故障          | mutation 新目标与既有相关目标                                        | 六类新故障及旧目标有效 killed                                   | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-13 | 真实兼容          | 作者当次手动验证或获授权的候选包专项                                 | 初始状态、四次正常写操作、完整读回与恢复                        | 必需；[当次结论](runs/issue-109.md#逐项结论) |
| AC-14 | 回归与文档        | generate/check；local/sdk；ADR/website/changeset                     | 旧限制移除，两个迁移模块和新策略公开说明一致                    | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-15 | 最终门禁          | verify → verify:sdk → fixtures → smoke → build:check；mutation --all | 同候选串行，lint 零告警，负载资源归零                           | [当次结论](runs/issue-109.md#逐项结论)       |
| AC-16 | 审查与交付        | 独立只读 reviewer；runs                                              | 完整工作区与真实日志，分别判断规范和 AC                         | [当次结论](runs/issue-109.md#逐项结论)       |

## 实施前确定的策略

- 所有模块沿既有执行链处理可选 token；移除 action.token 和 profile.tokenPlacement 的业务禁用逻辑。纯本地与外部 plain 上传不取值、不携带。
- 带 token 调用绕过 ReadStore，禁自动重试。provider 在每个 API 请求准备前分别取值；字符串只允许同一次模块调用的一次 API 请求，再次需要时明确失败，不自动复用。无 token 的流量策略保持。
- weapi：加密正文 checkToken 与 HTTP X-antiCheatToken；eapi：加密正文 checkToken、加密 header.X-antiCheatToken 与 HTTP 同值，不进入 Cookie。依据 #77 的官方网页/Mac 调查。
- api：表单 checkToken 与 HTTP 头；linuxapi：加密转发 params.checkToken 与 HTTP 头。这是统一可选编码合同，沿用各协议容器，不声称已有对应官方抓包或真实接受证据。
- 字符串/provider 的值先通过标准 Headers 原样校验；空值、首尾空白和非法头字符在发送前明确拒绝，保证正文/头同值。
- 已批准网易云 plain 请求只在 HTTP 头传 token，保留 GET URL 和原始正文；外部 NOS 不取值、不携带。显式 token 无论有无账号 Cookie 都必须通过 HTTPS 网易云 API/已批准特殊目标边界。低层 createRequest 保留原始正文/头，模块专用清理只在模块 Call 执行。
- 两迁移模块采用已有 web：weapi、music.163.com、浏览器 UA、os=web，清除桌面字段；与旧默认 PC Cookie 有公开行为变化，按 major changeset 记录。

## 测试选择与门禁

behavior 从公开 SDK/HTTP 经真实模块、加密和请求链到严格假上游；replay 沿用八份历史响应，只证明返回；package 使用同一当前 tarball；transport 复用现有默认适配器/socket 回归和 500 次 smoke。纯规则确有缺口时用 unit，不机械新增重复测试。live AC-13 必需，状态单独记录，新增自动账号写入执行器不是实施前提，提供候选包手动验收流程。mutation 新增有限目标并维护旧目标。

顺序：最窄行为 red/green → 生成与相关回归 → 同候选 verify、verify:sdk、verify:fixtures、test:load:smoke、build:check → mutation --all → 独立双轴审查。修改候选后重跑受影响检查。原始产物在 `.artifacts/testing/`，当次结果在 [runs/issue-109.md](runs/issue-109.md)。

soak 不作门禁；匿名 live、远端 workflow、发布 preflight 和 registry 发布不属于本票验收。真实账号兼容不由离线测试或旧录制替代。

## AC-13 的有限手动验证流程

只能使用同一已通过 Node/Bun 消费者的候选包；源码、tarball SHA-256 与时间记录到 runs。当次凭据、预期 UID、专辑 ID、歌手 ID、fresh token 来源及两个目标的写入/恢复授权须在执行前具备，实际状态以 runs 为准；缺条件时阻塞。

具备条件后先调用 loginStatus，账号与预期 UID 一致才继续。读取 albumSublist/artistSublist，limit=1000、每类最多五页，列表不完整或任一目标已收藏即停止。关闭缓存和重试，每请求期限 30 秒，业务预算 30 次实际请求（含登录与初始读取），独立恢复预算 6 次；正常业务写入最多四次，每个 sub/unsub 各一次。每次写后最多两次读回，间隔 1500ms；验证目标出现或消失且无其他测试副作用，再进入下一步。

先专辑收藏→读回→取消→读回，再歌手同样执行。任一步失败立即停止后续业务，保留失败窗口与实际尝试数；不确定的写入结果先读回，禁止盲目重发。恢复仅在当前目标的当次授权内执行，最多各一次取消并在恢复预算内确认状态；无法确认单列失败。每次需要 token 都由调用者现取，不保存或重放旧值。账号 Cookie 和 token 只从安全本机文件/应用通道读取，不写命令正文、仓库、日志或公开票据。

本轮不新增自动 live 写执行器；若以后改为自动专项，必须沿用 LIVE_UPSTREAM/writes 显式门控、零请求阻塞、预算/失败停止/恢复的严格假上游自测，再独立执行真实账号验收。
