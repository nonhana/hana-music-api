# 歌单曲目分步执行 512 后备请求

来源：[issue #140](https://github.com/campanula-music/hana-music-api/issues/140)，以及 #115 的 512 业务分支、#137 的 web 目标、ADR-0001/0003；本次用户明确要求完整实施，验收按当前 TESTING.md。旧票里的建票限制、历史提交/账号授权不继承。

基线：从干净的 `fix/issue-137-web-endpoints`（`2b7deb9`）切到最新 `origin/master`，新建 `feat/issue-140-playlist-steps`；固定 base/HEAD 为 `7b8fdd5d5cef9059420b4d196d996625e699c8bd`，版本 6.0.0，无既有用户改动。根 GLOSSARY.md 不存在；沿用现有 ADR 与模块术语，不额外建立领域文档。

目标：应用先获取一枚 token，首次调用确实返回 512 后，再获取另一枚并单独发送后备请求。

接口：`playlistTracks({ op, pid, tracks, step? }, config)`；`step` 仅接受 `initial` 或 `fallback`，省略保留默认自动模式。它选择本模块的业务步骤，属于业务输入；会话、设备、token、signal 和期限继续属于 config。client、具名函数、invokeModule、内部动态入口与 HTTP 共用模块 decoder。HTTP 只新增步骤输入，不开放通用 checkToken 配置；应用自己的服务端通过 SDK 转交当次 token。无新增根导出或通用动作执行器，兼容新增按 minor changeset 记录。

范围仅限 playlist_tracks 的步骤选择、生成物、必要测试和接入说明。SDK 不保存跨调用状态，不替应用判断前一步是否执行、不抓取 token、不建立浏览器回连或 Cookie jar。默认自动模式、web 目标/身份、返回校验、失败分类和请求内核保留。不改 Campanula，不发布、不操作真实账号。

| AC ID | 来源与内容摘要     | 入口与预期                                                                             | 测试标题或独立证据                                                      | 适用性与理由                                       | 必要条件                | 最终状态   |
| ----- | ------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- | ---------- |
| AC-1  | 首次成功只消费一次 | initial 200：一次请求/provider，无后备取值                                             | playlist steps initial success consumes one provider                    | behavior：公开 SDK 到严格 fetcher                  | 本地 Bun                | 见当次结果 |
| AC-2  | 首次 512 原样失败  | initial 512：一次请求，getNcmFailureInfo 为 business/512，保留 Cookie                  | playlist steps initial exposes business 512                             | behavior：合成响应证明失败合同                     | 本地 Bun                | 见当次结果 |
| AC-3  | 独立后备编码       | 原始 op/pid/tracks 加 fallback：直接重复数组一次，原数组不变                           | playlist steps defer a fresh token until business 512；entry coverage   | behavior/package：实际解密请求，不靠录制猜请求     | 本地 Bun/Node           | 见当次结果 |
| AC-4  | 后备停止条件       | 200/512/其他业务失败各一次；provider 失败、取消和期限后不再发送                        | playlist steps fallback stops；provider and execution failures          | behavior：覆盖 provider 等待及已发送的取消/超时    | 本地 Bun                | 见当次结果 |
| AC-5  | token 合同         | 无 token/固定字符串/provider；两次独立调用各自消费；头正文一致、无 URL/Cookie/日志泄漏 | playlist steps token modes；existing check-token regressions            | behavior：token 编码仍在同一内核                   | 合成 token              | 见当次结果 |
| AC-6  | 默认兼容           | 不传 step：200 一次，512 一次后备，其他失败停止；字符串不复用，provider 按实际请求取值 | existing special-actions/special-chains/web-endpoints/check-token       | behavior/replay：复用有效回归，不人为制造 red      | 本地 Bun                | 见当次结果 |
| AC-7  | 独立身份与执行配置 | 设备、会话、token、signal/期限独立，web 目标/安全边界/外壳保持                         | playlist steps isolated calls；failure and cancellation cases           | behavior：相同 client 的独立 config + 现有安全回归 | 本地 Bun                | 见当次结果 |
| AC-8  | 公开包和说明       | 类型接受合法 step、拒绝非法值及 config 错放；所有入口执行正确；同包 Node/Bun 验证      | public-entry types；installed special-chains consumer；HTTP entry cases | package/typecheck；生成器更新，无 Schema 变更      | 本地依赖/浏览器         | 见当次结果 |
| AC-9  | 同候选门禁与审查   | 当前 TESTING 门禁通过、独立 reviewer 双轴审查                                          | 最终运行日志、JUnit、hash 和 runs 记录                                  | 见下文门禁；不照抄票中复选框作为通过证据           | 本地工具及独立 reviewer | 见当次结果 |

实施顺序：先登记并观察 initial/fallback 的真实行为 red，再实现模块选择与生成；补齐失败/隔离/入口/包与类型证据，更新文档和 minor changeset；最后冻结候选串行执行门禁并独立审查。

适用门禁：`bun run verify`（含生成、输入、失败清单、schema、build、local、typecheck、lint 0 warning/error、spell、fmt 和 docs:build），`bun run verify:sdk`（内含 `build:check` 和 `test:sdk-contract`，不重复运行等价子命令），`bun run test:load:smoke`（请求步骤改变，loopback 500 请求，资源归零），`bun scripts/mutation-test.mts --target special-chains` 与 `--target check-token`（新增步骤选择/重复编号/停止条件及保留 token 规则）。新行为用 behavior red/green；decoder 用现有输入合同正反样本。不新增纯规则 unit 层。

`verify:fixtures` 不作为额外门禁：本次不改返回 Schema 或录制，已有 replay 随 verify 运行。transport 由 load/socket 既有回归证明，未修改适配器。不需要 live：仅增加调用方选择步骤的离线可验证能力，不声称上游或真实账号接受；本次无账号/匿名 live 授权。soak、远端 workflow、发布/部署不属于本次门禁。提交、推送、PR、关票和发布未获本次授权，保留可审查工作区。

当次结果：[runs/issue-140.md](./runs/issue-140.md)。
