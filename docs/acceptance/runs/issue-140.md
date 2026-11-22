# issue-140 当次实施与验收

来源：[issue #140](https://github.com/campanula-music/hana-music-api/issues/140)；[实施前接口记录](https://github.com/campanula-music/hana-music-api/issues/140#issuecomment-6889383660)。需求和门禁：[矩阵](../issue-140.md)。

基线：`feat/issue-140-playlist-steps`，base/HEAD `7b8fdd5d5cef9059420b4d196d996625e699c8bd`。从干净工作区起步，无既有用户改动。所有实现尚未提交。

## 实现与切片证据

- 新增业务输入 `step?: 'initial' | 'fallback'`；省略时默认自动模式保持。initial 将 512 交给公开失败边界；fallback 直接发送重复编号的后备请求。沿用两个现有动作及请求内核，未新增状态或根导出。
- `bun run types:modules:generate` 退出 0。生成文件本来通过类型导入引用模块的 ModuleInput，输出文本无变化；没有手改生成物。
- `bun scripts/test.mts playlist-steps` 的首次 red：0 pass / 40 fail / 0 skip，见 `.artifacts/testing/playlist-steps/1794718340030-d2a38b6b-bdab-4973-92d4-4dd781f5ebcb/`。旧 decoder 把 step 拒绝为多余字段，返回 invalidRequest/400，原生断言期待 business/512 或实际发送及重复编码；并非导入/环境失败。
- 第一轮实现后 38 pass / 2 fail：测试用无效 count 期待 shape 失败，但 count 属于现有 Loose 字段，模块正确丢弃该字段。测试改为顶层数组，以验证真正的返回结构错误，产品 Schema 未放宽。
- 完整专项 green：42 pass / 0 fail / 0 skip，见 `.artifacts/testing/playlist-steps/1794718586725-6f48d54c-fb10-488c-affb-d568eccdae25/`。涵盖公开 client/具名/invoke、内部动态入口、HTTP 的两个步骤；200/512/405/-460；无 token/新字符串/provider；provider 失败/取消/超时零发送；执行取消/超时/transport/shape 停止；不同会话/设备/期限和 Cookie 外壳。
- 既有 `bun scripts/test.mts special-chains`：349 pass / 0 fail / 0 skip，见 `.artifacts/testing/special-chains/1794718558751-a18f2b43-3c57-4f92-9bdc-ed04eed955b8/`。既有默认行为用有效回归证明，不人为破坏默认模式制造 red。web-endpoints/check-token 与其余回归纳入最终 verify。
- 同包消费者扩展现有 special-chains：每个 Node/Bun 进程以 client/具名/invoke 和三种 token 模式执行两个独立步骤，分别解密请求并确认 512。类型消费者接受两种合法步骤，拒绝非法值和 config 错放。实际 Node/Bun 均退出 0，special-chains 各 59 次请求/19 次 provider，其中分步调用各 18 次请求。
- 文档更新 PUBLIC_API、编程式调用和歌单接口页；minor changeset 说明默认兼容与分步 token 责任。接口页旧标量 tracks 示例同步改为 JSON 数组。
- 预检曾发现 typecheck 的 expect-error 放错行和 lint 的数组类型写法，均已修复；不把失败轮当最终通过证据。

所有 512 和业务返回均为合成证据；未操作真实网易云账号，也不作真实账号可用性结论。

## 最终候选门禁

冻结候选 `ab3124944bf8a58cbc02eb5fd9e09573313101193a1265f3b32e458138fa05c9`；diff SHA-256 `2bd9427aed5b1812a97bf744d0aefb626fa820c14ae6442ea325941493328248`。运行记录不计入内容指纹。外层命令日志及 before/after 指纹在 `.artifacts/testing/issue-140/1794718608056/`。

| 检查                             | 状态 | 当次证据                                                                                 |
| -------------------------------- | ---- | ---------------------------------------------------------------------------------------- |
| bun run verify                   | PASS | verify/：exit 0，local 8414 pass / 0 fail / 0 skip，lint 0 warning/error                 |
| bun run verify:sdk               | PASS | verify-sdk/：exit 0，sdk 34 pass / 0 fail / 0 skip；包含 build:check / test:sdk-contract |
| bun run test:load:smoke          | PASS | load-smoke/：exit 0，smoke 143 pass；500 请求，upstreamActive/inflight 均 0              |
| mutation --target special-chains | PASS | exit 0；17/17 killed，包括三项新增步骤选择/重复编码故障                                  |
| mutation --target check-token    | PASS | exit 0；11/11 killed，保留 token 目标/编码/取消/重放规则                                 |

`verify:fixtures` 不适用：Schema/录制无改动，既有 replay 随 verify 运行。live、soak 和远端 workflow 不适用，原因见实施前矩阵；没有缺凭据却冒称 live 通过。

同包证据：`.artifacts/testing/package/afe91cb5-6868-4787-9079-168067a6e94a/summary.json`；tarball SHA-256 `8080d9d47280c8341f85bc3f7c7f5b9569fd69028f370f0cf198233b9c028bc9`，Node/Bun 使用同一安装包。最终 local/sdk/smoke 的摘要分别在 `.artifacts/testing/local/1794718614933-78b3bfbd-61a2-459c-86cf-446aaf5453b0/`、`.artifacts/testing/sdk/1794718742014-18afa467-9aea-4bb7-abf2-e93ea4c88ea8/` 和 `.artifacts/testing/smoke/1794718779083-fc36a508-2f9f-49db-b340-e0bb3bca228c/`；各目录保留原生 JUnit、子进程日志与候选指纹。负载原始报告 `.artifacts/testing/load/smoke-1794718783291.json`。

变异外层日志与 before/after 指纹在 `.artifacts/testing/issue-140/1794718799868/`。special-chains 的绿色基线、各次原生 JUnit 与汇总在 `.artifacts/testing/mutation/1794718800151-91e02ce6-8167-468a-bf60-3c72874c0b9d/`；17 项均为登记用例的原生断言 killed，无超时/跳过冒充。

check-token 的绿色基线、各次原生 JUnit 与汇总在 `.artifacts/testing/mutation/1794718866161-018bdf62-bb19-4de1-a629-df5a12b65096/`。两组共 28 项 killed、0 fail/skip；两组摘要和外层 before/after 指纹均为上述冻结候选。

## 逐项验收

| AC   | 结果 | 决定性证据                                                                                                   |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------ |
| AC-1 | PASS | final local 的 playlist-steps：initial 200 一次请求/provider                                                 |
| AC-2 | PASS | initial 512 一次发送，公开 business/512 与 Cookie 保留；HTTP 只返回原正文                                    |
| AC-3 | PASS | 三种 token 模式两次独立调用、原始只读 tracks 不变；fetcher 独立解密后备重复编号                              |
| AC-4 | PASS | 两步逐一覆盖 200/512/405/-460；provider 及执行取消/超时/失败停止，无继续请求                                 |
| AC-5 | PASS | 无 token/新字符串/provider 的正文与头一致；URL/Cookie/事件无 token；check-token 回归和 11 项变异             |
| AC-6 | PASS | final local 的 special-actions/special-chains/web-endpoints/check-token；512 条件变异继续检出                |
| AC-7 | PASS | 两次实际发送使用各自 Cookie/设备/CSRF/token；一调用取消后另一调用独立成功并保留 Set-Cookie；共同内核安全回归 |
| AC-8 | PASS | 五类入口；源码与安装包类型消费者；同 tarball Node/Bun 三种 SDK 入口；文档和 minor changeset                  |
| AC-9 | PASS | 全部门禁同候选 PASS；独立规范轴/需求轴均 PASS，无未解决阻断项                                                |

final local 中新增步骤用例的直接原始证据是 `junit-0.xml`、`output-0.log` 和 `output-0.log.stderr`，共 42 pass / 0 fail / 0 skip。构建保留工具链 TypeScript generator 弃用与文档 chunk 体积提示；命令退出 0，lint 为 0 warning/error，未放宽任何门禁。

## 双轴审查与交付

独立 reviewer `/root/review_issue_140` 已完成只读审查：无 actionable findings，规范轴 PASS、需求轴 PASS，无未解决阻断项。完整结论保存于 `.artifacts/testing/issue-140/review.md`。reviewer 直接核对原始议题、完整工作区（含全部未跟踪文件）、门禁日志、原生 JUnit、三项新增故障、包实际 hash，并独立重算 fingerprint，确认仍为上述冻结候选。审查包包括原始 issue #140 及适用 #115/#137、AGENTS/TESTING/相关 agent-docs、矩阵、完整工作区及上述原始日志。

审查须读取 `git diff 7b8fdd5...HEAD`（当前为空）、`git diff --cached`、`git diff`，再读取 `git ls-files --others --exclude-standard` 的全部原文；新增测试、需求矩阵、changeset 和本运行记录均纳入，不只看已跟踪文件。

AC-1 至 AC-9 和全部适用门禁均 PASS；独立审查无阻断项，交付状态为完成（本地实施及验收）。提交、推送、PR、关票和发布未获本次授权，保留可审查工作区。未执行且不属于本次授权交付范围：提交、推送、PR、关票、发布、部署、Campanula 修改和真实账号操作。无适用门禁失败、未运行或阻塞。

报告收尾：`bun run spell`、`bun run fmt:check`、`git diff --check` 均退出 0；最终 fingerprint 与冻结候选一致。日志分别在 `.artifacts/testing/issue-140/run-record-spell.log`、`run-record-format.log` 和 `final-candidate.json`。审查后只修改本 runs 记录，未改变受验代码候选。

## 后续提交与 PR 授权

2026-11-15 用户明确要求：“提交并推送这些改动，创建 PR，然后跟进 CI 直到通过。”因此继续执行提交、推送、创建 PR 和跟进其 CI；上面的未授权说明保留为本地实施验收阶段的历史记录。提交前重新读取实际工作区并重算内容/diff 指纹，两者均与已验收候选一致。此次只追加本运行记录，受验代码未变。远端最终结果以该 PR 对应提交的实际检查为准；没有新增合并、关票、账号操作或发布授权。
