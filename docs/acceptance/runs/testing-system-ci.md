# PR 119 远端 CI 验收记录

[PR #119](https://github.com/nonhana/hana-music-api/pull/119) 从 feature/refactor 指向 master。用户本次明确授权创建 PR、持续跟进检查、失败时修复并提交/推送重跑；明确不合并。PR 当前 OPEN，自动合并未启用。

## 第一轮真实 PR 门禁

本轮 head 为 `e68274493ee861d2ecbb2bc444c97c9a1680ecb5`，base 为 `94a900b95413b1039f750c185b305db63d443855`。GitHub 测试用候选为 `fb567b8000df6059559bf21e970118a063957963`，其 tree `f86fb6c4b9d70845b40c2da5e4397ccb16e67662` 与 head 的 tree 相同；这是 PR 自动测试候选，不代表 PR 已合并。

| 检查           | 当次结果                                                                                      | 原始证据                                                                              |
| -------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 完整 PR verify | completed/success；完整仓库 verify、SDK、fixtures、smoke 与上传步骤全部成功                   | [run 42343329978](https://github.com/nonhana/hana-music-api/actions/runs/42343329978) |
| 默认回归       | 3531 pass、0 fail、0 skip；逐文件原生 JUnit 与汇总实际核对                                    | verify artifact 的 local summary/JUnit                                                |
| SDK            | 32 pass、0 fail、0 skip，Node v24.22.2 / Bun 1.4.4；当前 3.2.0 tarball 经 Node/Bun 消费者校验 | 同 artifact 的 sdk/package 原件                                                       |
| Fixtures       | 915 scanned、761 validated、4 无 ModuleBody 明确另列、0 failures                              | ci/fixtures.log                                                                       |
| Smoke          | 87 pass，加 500 次 loopback 请求；active/inflight 均 0、failures=[]                           | smoke 原生 JUnit 与 load/smoke 原始 JSON                                              |
| PR 发布演练    | completed/success；版本推进至 3.2.1 后 SDK 32 pass，同包 hash 核对；未发布                    | [run 42343332584](https://github.com/nonhana/hana-music-api/actions/runs/42343332584) |
| Netlify 预览   | deploy-preview 和 Redirect rules 成功；Header rules、Pages changed 无相关变化，为 NEUTRAL     | [预览](https://deploy-preview-119--hana-music-api.netlify.app) 与 PR checks           |

两个 Actions artifact 均已下载，SDK/默认回归/smoke 原生 JUnit 的数量、failure/error/skipped 节点、summary 退出码与候选字段一致。没有从 job 的 success 标签单独推断测试数量。

## 候选与包的边界

本机 source SHA-256 仍为 `6c045a58faf755176fb964ef5016f229a278fb1d7584429da74df692e56b2f8a`。Linux checkout 的指纹为 `b2d4bfec2a73e93dd586c16a9a7bfd3f48eec8138a17c44defd5285f8980a511`。差异仅来自 CLAUDE.md symlink 在 macOS 为 0755、Linux 为 0777；按 Linux 权限重算本机完整指纹能精确复现，文件内容与链接目标没有变化。两边 clean diff hash 都为空，远端 checkout SHA 与自动合并候选 tree 另行核对。证据为 `.artifacts/testing/delivery/ci/cross-platform-candidate.json`。

PR verify 的两个 3.2.0 tarball 均为 `7de21fe53aa02be6f1e4901c6ec9c63099d633172b5cd79b18d6824b37f7fd71`，分别在默认回归和 SDK 命令中产生，均已重算 hash。发布演练的 3.2.1 tarball 为 `1d7a62a6c493ed4f4e96aa5baeb163feec04906ba289e778bdf572ca01d61cae`，是版本步骤后的另一候选，未当作未改版本的同包。E1 使用的本机安装包、远端 PR 包和版本演练包分别保留各自 hash，没有混称同一份 tarball。

## 预期拒绝与失败状态

artifact 还保存了一份 live status=fail 报告，其原因精确为 LIVE_UPSTREAM must equal 1、preparation commands=[]。它来自已通过的原生用例 `explicit live command without gate exits nonzero with no package preparation or network`：控制子进程显式使用 LIVE_UPSTREAM=0，断言退出 1 且零包准备/网络。该负向控制不是本轮真实 live 失败，不删除报告，也不将其记作 live 通过。

本轮 CI 未出现实际失败，没有必要的代码修复或失败重跑。PR 的匿名 live 步骤仅在 workflow_dispatch 启用，PR 场景未选择它符合既定分层；独立账号写入没有重跑。

## 第一轮状态与剩余范围（历史）

本次请求的完整 PR 门禁已实际通过。先前同源提交的手动 release-rehearsal 和十分钟 soak 也已通过，详情见 `.artifacts/testing/delivery/ci/final.json`；不能把这些结果当成新建独立 live/mutation workflow 的运行证据。

整个测试系统仍有独立外部验收待办：新 live/mutation workflow 尚未在默认分支登记，独立执行待验证；故意失败 job 的 always artifact 上传尚未实测，成功 job 上传和本地故障控制不能替代。没有为触发这些项目合并 PR、修改 master 或修改远端 Secrets/保护规则。E1 真实账号专项已通过，不再作为缺账号/授权阻塞。

本文件与主记录的更新仅位于指纹排除的 runs 报告目录，不改变产品、测试、配置或包内容；记录提交推送后，仍跟进新 head 的全部 PR 检查，最终状态以 PR checks 和当次原始报告为准。

本地汇总与原件位置：`.artifacts/testing/pr/verify-evidence.json`、`rehearsal-evidence.json`、`verify-artifacts/`、`rehearsal-artifacts/` 和 `verify-job.log`。

## 独立专项与失败上传补验收

本节接续上述历史待办。用户授权必要修改、提交和推送，继续跟进 PR 119，明确不合并。实现提交为 `16e6ad87013f56d3168f6ed68cc397fe67f78ca7`，标题为 `ci: 补齐独立专项与失败上传验收`。普通 PR、显式故障、正常专项与手动 soak 的真实运行证据均已取得；没有修改 master、Secrets 或保护规则，没有发布或重新执行账号写入。

### 实现与 red/green

release-rehearsal 保留默认 release 演练，新增显式 testing/failure 模式。testing 通过相对路径调用同一提交的 verify、live、mutation 实际 workflow；failure 仅调用同一个 verify job 并启用默认关闭的故障输入。live/mutation 保留各自 schedule/workflow_dispatch，普通 PR 不选择这两个上游专项。没有复制一份宽松 job，也没有使用 continue-on-error。

故障输入让临时 Bun 测试执行真实错误断言，保存原生 JUnit 和日志；同一个 always 上传步骤在失败后继续运行。本地控制从实际 YAML 取出命令、以 Action 的 Bash 严格管道语义执行：新增行为先为 17 pass/1 fail，加入实现后为 18 pass/0 fail，内层 Bun 仍实际失败。日志为 `.artifacts/testing/ci-acceptance/probe-red.log`、`probe-green.log` 和 `controls-final.log`。

独立审查发现手动候选原本继承 verify 的 30 天保留期，已修正为手动 90 天、PR/master push 30 天；同类 load 手动候选一并修正为 90 天，定时 load 仍为 30 天。远端 metadata 的实际创建/到期时间也已核对，未只根据 YAML 判通过。两轮旧候选为修复保留期而主动停止的部分 soak 均保留中断记录，不计通过、不用于下表。

### 同一提交的远端结果

| 实际命令 / 运行                                                                      | 决定性结果                                                                                                                                                                                                           | 报告与保留期                                                                                         |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| PR verify                                                                            | [42347563456](https://github.com/nonhana/hana-music-api/actions/runs/42347563456) completed/success；verify 3532/0/0、SDK 32/0/0、fixtures 761 validated/0 failures、smoke 87/0/0 加 500 请求                        | 已下载原生 JUnit、包和负载报告；PR artifact 约 30 天                                                 |
| PR release-rehearsal                                                                 | [42347563494](https://github.com/nonhana/hana-music-api/actions/runs/42347563494) completed/success；版本步骤后 3.2.1 包重新构建、SDK 32/0/0                                                                         | 已下载、重算 tarball；约 90 天；没有发布                                                             |
| `gh workflow run release-rehearsal.yml --ref feature/refactor -f acceptance=failure` | [42347650538](https://github.com/nonhana/hana-music-api/actions/runs/42347650538) **completed/failure**；candidate/verify 真实失败；原生测试 1 项、1 个 AssertionError、0 skip；原 Upload test evidence 步骤 success | artifact 13563144719；failure-probe.log/xml/test.ts、初始候选和 checkout SHA 已下载，约 90 天        |
| `gh workflow run release-rehearsal.yml --ref feature/refactor -f acceptance=testing` | [42347915406](https://github.com/nonhana/hana-music-api/actions/runs/42347915406) **completed/success**；candidate/verify、live/live、mutation/mutation 全部 success                                                 | testing/live/mutation 三份 artifact 均下载，均约 90 天                                               |
| 独立 live/live                                                                       | 安装后的 3.2.0 候选包；先完成同包 SDK 32 项及 Node/Bun 消费，再执行匿名 2 场景、6 次实际请求（含初始化），0 fail/0 skip；没有账号 Secrets 或替身                                                                     | live 原生 JUnit、请求摘要、包/源码 hash；artifact 13564112726                                        |
| 独立 mutation/mutation                                                               | playlist-subscribe、shared-reads、upload 三目标的 5 个登记故障均 killed；每项退出 1、非超时，并在登记标题下找到原生断言失败；不是 dry-run、导入失败或普通错误冒充 kill                                               | 逐项 XML/stdout/stderr、summary；artifact 13564945317；上传阶段的组合错误中含明确 Bun AssertionError |
| `gh workflow run load.yml --ref feature/refactor`                                    | [42347653042](https://github.com/nonhana/hana-music-api/actions/runs/42347653042) completed/success；600193.46ms、30203 请求、p95 52.21ms、RSS 尾部增长 8.56%，active/inflight=0，failures=[]                        | artifact 13564865824 已下载，约 90 天                                                                |

故障 run 没有删除、改成成功或用相同 failure 输入重跑来假装恢复。随后同一提交的正常 testing run 明确关闭故障输入并全部成功。PR 实际 statusCheckRollup 也已读取：verify/rehearsal 和预览成功，无失败或等待项，两个信息检查为 NEUTRAL。普通 PR 的 candidate/live/mutation 因未选择手动模式而为 SKIPPED，testing 的 rehearsal 同理；这些未选择的模式不计为测试通过。原件为 `ci-acceptance/pr-implementation-rollup.json`。

新独立 workflow 在未合并分支通过同提交 workflow_call 实际运行，本次证明实际 job、命令和上传能力；没有声称 master 上的 cron 已触发。合并后的定时激活属于后续运维，不通过提前合并来验收。

### 当前候选与本地门禁

本地源内容 SHA-256 为 `2e7f3a2e9e9496acceb18299d9ba0fe8cf779fb2405e0a9ab5bc2337a99a50cc`，Linux 为 `8d7b334bc98d6806fdc4c37f9227fa95d526d9817a53194c10c442da6d6743e7`。已按原规则重算，差异仍仅为 CLAUDE.md symlink 的 0755/0777。PR checkout `c73f2f80452ee64e8e19eac495a2aac202b78a72` 与实现 head 的 tree 均为 `2658a3f4601592200c176d73ce1ce4c5e6b61f13`；手动 failure/testing/soak 直接 checkout 实现提交，初始候选均为同一 Linux 指纹。没有扩大指纹排除范围。

以下本地命令串行完成，完整组合退出码均为 0；原件位于 `.artifacts/testing/ci-acceptance/`：

| 实际命令                                                      | 当次结果                                                                                                  | 原始日志            |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------- |
| `bun run verify`                                              | 3532 pass、0 fail、0 skip；生成、schema、构建、类型、lint 0 warning/0 error、拼写、格式与文档构建全部通过 | local-verify.log    |
| `bun run verify:sdk`                                          | SDK 32 pass；同包 Node/Bun、导出、类型、serverless 与全部后续检查通过                                     | local-sdk.log       |
| `bun run verify:fixtures`                                     | 915 scanned、761 validated、4 无 ModuleBody 另列、0 failures                                              | local-fixtures.log  |
| `bun run test:load:smoke`                                     | 87 pass 加 500 loopback 请求，active/inflight=0，failures=[]                                              | local-smoke.log     |
| `bun run test:load:soak`                                      | 600175.53ms、30300 请求、p95 55.77ms、RSS 尾部增长 0%，active/inflight=0，failures=[]                     | local-soak.log      |
| `bun scripts/mutation-test.mts --all`                         | 三目标五故障均由登记断言检出，非超时/工具错误                                                             | local-mutation.log  |
| `LIVE_UPSTREAM=1 HANA_LIVE_SUITE=anonymous bun run test:live` | 2 pass、6 次实际请求、0 fail/0 skip，安装后的同候选包                                                     | local-anonymous.log |

本地 3.2.0 tarball 仍为 `08d9446c5f1dc5d630d2bbb9879c06c399992a28fa5e7705def8acaf6af077cc`，与 E1 使用的包逐字节相同，711 项文件路径和内容 hash 全部一致，原有真实账号结果可以绑定当前产品包。证据为 `e1-package-reuse.json`，不重用旧凭据或写入授权。Linux 3.2.0 包为 `7de21fe53aa02be6f1e4901c6ec9c63099d633172b5cd79b18d6824b37f7fd71`；版本演练后的 3.2.1 包为 `1d7a62a6c493ed4f4e96aa5baeb163feec04906ba289e778bdf572ca01d61cae`，分别保存，不混称跨平台或跨版本的同一 tarball。

仓库 hana-implement 未改变，SHA-256 仍为 `32990c5fff7632304cbef6e08d28cc2dfc263029832048b5abd9db42f95985e6`；此前九场景的独立演练与验收判断保持适用。辅助 quick_validate 对必需元数据字段的兼容性限制仍保留“原工具未通过”，没有将它写成通过或削弱仓库门禁。

### 结论与审查入口

CI-01～04、AC-13 的独立远端待办已取得实际证据。本地完整门禁、匿名专项、E1 同包关联与远端候选门禁均通过；最后的验收记录提交只修改 runs 目录，继续沿用上述源/包指纹，并跟进新 HEAD 的完整 PR CI。PR 保持 OPEN，自动合并关闭，不合并、不发布。

记录本身的 `bun run fmt:check` 和 `bun run spell` 也已退出 0。首次拼写检查在新增正文的 shell 选项名称上报 1 issue，已改为中文说明后原强度重跑通过；原失败保存在 records-spell-red.log，最终结果为 records-fmt.log、records-spell.log，没有修改字典或忽略范围。

原始索引为 `.artifacts/testing/ci-acceptance/dispatches.json`、`local-final-proof.json`、`failure-upload-proof.json`、`proof-42347563456.json`、`proof-42347915406.json`、`proof-42347653042.json`、`rehearsal-implementation-proof.json`、`candidate-platforms.json` 和 `pr-candidate-tree.json`。每个远端 run 的原始 jobs、日志、artifact metadata 和下载文件保存在同目录；两轴独立复审为 `review-standards.md`、`review-requirements.md`。最终记录提交后的检查以 PR 最新 checks 与 `.artifacts/testing/ci-acceptance/final.json` 为准。

## 文档状态同步与发版核对

用户随后要求消除文档漂移，并核对本 PR 的发版与 changeset。基线为 5ba826cd967b9adef7d9d1eba17e53e7fad9c342，工作区干净；该提交的 [verify](https://github.com/nonhana/hana-music-api/actions/runs/42348793133) 和 [发布演练](https://github.com/nonhana/hana-music-api/actions/runs/42348793126) 均 completed/success，最新原生结果为 3532 回归、32 SDK、87 smoke 检查加 500 请求，版本演练后的 SDK 为 32 项。此时所有必要外部验收已完成，PR OPEN、自动合并关闭。

本次仅修改验收文档：AC-13 不再写远端待授权；迁移表和 E1 记录同步真实登录及 CI 已通过；S7 总览同步 S11 补充后的 8 个控制样本。各切片正文和历史候选的命令、失败与阻塞仍保留当时事实，没有重跑账号写入或改写旧报告。需求矩阵与迁移台账参与原指纹规则，新文档候选的 hash 单独保存；产品、测试、构建配置、包清单及 hana-implement 均未改变。

本 PR 相对 master 含歌单收藏网页身份与 token 行为修复，需要 patch 发布；测试系统及本轮文档同步本身不追加版本变更。PR 已有 `.changeset/playlist-request-actions.md`，在本 PR 的 aef66d7 中加入，声明 hana-music-api 为 patch 并描述该用户可见修复。本次只读执行 `bun run changeset status --since=origin/master --output=.artifacts/testing/documentation-refresh/changeset-status.json`，实际计划为 3.2.0 → 3.2.1，唯一 changeset 为 playlist-request-actions。没有新加重复 changeset、提前修改 package.json 版本或调用发布。

本轮文档适用门禁为 `bun run fmt:check`、`bun run spell`；未修改文档站内容或配置。验证结果、文档候选指纹、提交与最新 PR 检查保存 `.artifacts/testing/documentation-refresh/`，最终入口为 final.json。提交推送沿用用户对本 PR 的授权，仍不合并、不发布、不关票或修改远端配置。
