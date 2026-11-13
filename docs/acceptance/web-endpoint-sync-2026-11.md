# 按官方配置同步网页目标与 EAPI 迁移

来源：[Issue #137](https://github.com/nonhana/hana-music-api/issues/137)，2026-11-13 当前用户授权先更新 AC 再完整实施。基线 master / `472dbc5c46ecd9cfed075b47c8f5a1aad0b006e1`，干净工作区，无已有用户改动；实施分支 `fix/issue-137-web-endpoints`。

目标与范围：S1 固定审计，S2 三个 web 改址动作，S3 23 个读取与 Banner PC，S4 27 个账号/社交动作，S5 11 个写入/上传动作，S6 生成、文档、验收。非目标：Campanula、自动 Watchman、全局协议降级、真实账号、部署、提交/推送/关票或发布。

## 四、最终验收

验收以当前仓库 `agent-docs/TESTING.md` 为准。需求矩阵保存为 `docs/acceptance/web-endpoint-sync-2026-11.md`，运行记录保存在同名 `runs/` 文件；每项列出实际入口、断言、证据边界、适用门禁及结果。以下离线证据不等于真实网易云或 Campanula 已验证。

- [ ] **AC-01 审计可复现**：保存公共配置的有日期快照、来源/hash、30 条有序规则及 224 个去重路径，最短网页调用摘录和全部动作处置矩阵。`bun scripts/audit-upstream-endpoints.mts` 默认零网络，直接读取生产导出动作，逐动作输出 profile、逻辑目标、域名、固定/动态/批量分类、规则匹配顺序与最终 businessId。基线 352 模块/389 动作、35 个固定交集、153 个实际 EAPI 动作全部有唯一去向；新增 Banner 分支后显式解释数量变化。工具测试覆盖后规则覆盖、尾斜杠前缀、旧别名、动态实际路径、batch 子路由、外域反例，以及缺少/重复/多余处置条目的失败；不建第二份生产 registry，不在生产链加载远端配置。
- [ ] **AC-02 地址与编码**：最终 fetcher 的独立解密断言证明 like.like/unlike → `/weapi/song/like`，comment.reply → `/weapi/v1/resource/comments/reply`，playlist_tracks.manipulate/fallback → `/weapi/v1/playlist/manipulate/tracks`；comment.add/delete 保持原路径。user_followeds 使用固定 `/weapi/user/getfolloweds/`，userId 留在正文；user_event 仍受 uid 路径边界限制。playlist_update 仅一次 `/weapi/batch`，三个固定子路由值为对象，保留 name/tags/desc 的原业务值、子结果和部分失败。既有 id/like、trackIds、imme、分页、alg/time 兼容字段保持；不新增必填 userid、token 别名或补账号请求。
- [ ] **AC-03 完整迁移与保留**：逐条执行本票 61 个完整动作迁移及 Banner 默认/type=0 的 PC 分支迁移；type=1/2/3 仍走 EAPI，clientType 分别保持 android/iphone/ipad，默认/0 仍为 pc。song_url_v1 普通/sky、search 普通/voice、playlist_track_all 两次读取、cloud 各阶段均按动作判定。保留的 91 个动作及 Banner 移动分支有独立 EAPI 断言或审计合同，其中 sky 的 level/immerseType、song_order_update 的 update、通用 batch、cloud.check/information、scrobble 专用 clientlog 域名明确受保护。期望来自固定矩阵/请求差异 fixture，禁止从被测 moduleActions 动态推导期望。
- [ ] **AC-04 身份与 token**：迁移请求均在最终 HTTP 边界断言 music.163.com、WEAPI、WEB UA、os=web、平台残留字段清除；不同 MUSIC_U/MUSIC_A、__csrf、显式设备仍按调用隔离。覆盖未配置/字符串/provider：未配置不附加、不本地强制；正文 checkToken 与 HTTP 头同值；provider 每个 API 阶段取新值；固定字符串第二次 API 发出前拒绝；provider 空值/失败/取消后零发送，带 token 不共享/缓存/自动重试。外部 plain 上传不携带 Cookie/token，不消费 provider；根 SDK 不加载 Watchman，业务 token 字段保持原义。
- [ ] **AC-05 业务与执行合同**：保留公开输入、status/body/cookie、响应 Schema 收紧/宽松及失败分类；301/405/-460 原样失败且写入仅一次，无协议 fallback；缓存/retry/semantic 不扩大。共享 lyric/playlist_detail 的并发等待者、单个与最后等待者取消、期限和身份隔离继续通过。playlist_tracks 的 512 后备仅按既有条件发送、两动作同时用 web v1；批量子失败不吞掉。上传 API/外部字节阶段顺序、请求数、completedStages/partialCompletion、取消与失败停止继续通过；历史原文响应完整回放，不以宽松解码掩盖行为变化。
- [ ] **AC-06 实际入口和候选包**：client、具名函数、invokeModule、真实 HTTP loader 均走模块→请求链→严格 fetcher；本次改址分支和迁移动作有 URL/解密正文断言。`tests/package/release.test.ts` 对同一当前 tarball 实际安装后的 Node/Bun 消费者核对相同迁移期望（含多请求与保留分支），记录 SHA-256。历史请求/响应 fixture 的来源、时间和 hash 不改写；当前差异另存，合成数据标注 synthetic。全部自动化零真实账号操作。
- [ ] **AC-07 测试辨别力**：先记录新行为在旧实现上的具体原生断言 red，再记录 green；已有有效回归不人为破坏。新增有限定向变异，至少检出恢复红心/回复旧地址、只迁一个 playlist_tracks 分支、迁移 profile 回 EAPI、Banner 分支选错、batch 回字符串，以及 token 处理退化。执行既有 library-playback/account-social/search-discovery/check-token/shared-reads/request-identity/special-chains/upload 适用 mutation 目标并同步旧注入点。每组绿色基线有效，注入必须命中，指定原生断言失败才算 killed；编译/导入错误、空选择、only/skip/超时不能算检出。
- [ ] **AC-08 同候选门禁与审查**：冻结内容后串行完成 `bun run types:modules:check`、`bun run verify`、`bun run verify:sdk`、`bun run verify:fixtures`、`bun run test:load:smoke` 与 AC-07 目标。verify:sdk 包含 build:check/test:sdk-contract；lint 为 0 warning/0 error；load 500 请求只用 loopback，upstreamActive/inflight 最终归零。保存命令、退出码、时间、原生 JUnit、testedHead、源码候选指纹和包 hash；修复后刷新受影响证据。独立 reviewer 直接读取完整工作区和日志，分别核对规范与 AC，无未解决阻断项才完成。适用门禁失败即未完成，缺条件即阻塞，不以历史报告/skip 替代。
- [ ] **AC-09 文档与授权边界**：通过生成器更新必要生成物；major changeset、ADR-0001、PUBLIC_API、config-reference 明确区分改址、默认身份变化、保留 EAPI 理由与调用方 token 责任。说明源码/离线/历史回放/过去账号探针各自能证明什么。本次 live、真实登录/写入、远端 workflow、十分钟 soak、Campanula 配套、提交/推送/关票/发布/部署均不自动执行；这些不属于本票当前离线验收门禁，后续应用验收不能被本票代替。

## 需求与证据矩阵

| AC    | 实际入口与预期                                  | 决定性测试/证据                                                               | 适用性与条件                          |
| ----- | ----------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| AC-01 | audit CLI → 导出动作；快照与处置唯一完整        | tests/behavior/tooling/upstream-endpoints.test.ts；inventory；离线 audit JSON | unit/behavior；公共快照已具备         |
| AC-02 | SDK/HTTP → fetcher；新 URL 与对象 batch         | web-endpoints.test.ts；library/account/special-chain wire assertions          | behavior；先 red 后 green             |
| AC-03 | 逐动作实际请求与保留分支                        | 固定 changes fixture + library/search/account/special 请求集；审计合同        | behavior/package；独立期望            |
| AC-04 | prepareRequest → transport；身份/token/隔离     | check-token/request-identity/shared-reads/upload 与迁移请求解密               | behavior；无真实凭据                  |
| AC-05 | 真实模块返回/失败/阶段与取消                    | 既有 replay、各领域 policy、shared-reads、upload                              | replay/behavior/transport；旧原文保留 |
| AC-06 | client/具名/invoke/HTTP 和安装后的同包 Node/Bun | web-endpoints；release.test.ts 和 consumers                                   | package；Bun/Node/Chromium 本机检查   |
| AC-07 | 故障注入后指定原生断言 red                      | web-endpoints 与 8 个既有 mutation target                                     | mutation；有效绿色基线与完整 JUnit    |
| AC-08 | 同一最终候选串行质量门禁                        | verify、verify:sdk、verify:fixtures、smoke、mutation 与独立双轴 review        | 全部适用；失败不可豁免                |
| AC-09 | 生成器与用户迁移文档                            | types:modules:check；ADR/PUBLIC_API/config-reference/major changeset          | 文档随 verify 校验；无 live/发布授权  |

## 门禁与证据边界

必需：types:modules:check、verify、verify:sdk（含 build:check、test:sdk-contract）、verify:fixtures、test:load:smoke；mutation 的 library-playback、account-social、search-discovery、check-token、shared-reads、request-identity、special-chains、upload 以及新增 web-endpoints。全部按 TESTING 串行封存，lint 零警告。SDK 默认行为有 major 变化，因此包门禁适用；请求改变因此 smoke 适用；既有 raw fixtures 全量审计。无新增响应 Schema/录制，不猜字段。

不适用：真实 live/账号写入（票内已明确停止，当前无授权，且不用于本次离线验收）、远端 workflow、发布、十分钟 soak。离线源码/响应回放/同包消费者不证明真实网易云的当前权限或反作弊接受结果。

当次结果与审查包：[runs/web-endpoint-sync-2026-11.md](runs/web-endpoint-sync-2026-11.md)。
