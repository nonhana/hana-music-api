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

## 状态与剩余范围

本次请求的完整 PR 门禁已实际通过。先前同源提交的手动 release-rehearsal 和十分钟 soak 也已通过，详情见 `.artifacts/testing/delivery/ci/final.json`；不能把这些结果当成新建独立 live/mutation workflow 的运行证据。

整个测试系统仍有独立外部验收待办：新 live/mutation workflow 尚未在默认分支登记，独立执行待验证；故意失败 job 的 always artifact 上传尚未实测，成功 job 上传和本地故障控制不能替代。没有为触发这些项目合并 PR、修改 master 或修改远端 Secrets/保护规则。E1 真实账号专项已通过，不再作为缺账号/授权阻塞。

本文件与主记录的更新仅位于指纹排除的 runs 报告目录，不改变产品、测试、配置或包内容；记录提交推送后，仍跟进新 head 的全部 PR 检查，最终状态以 PR checks 和当次原始报告为准。

本地汇总与原件位置：`.artifacts/testing/pr/verify-evidence.json`、`rehearsal-evidence.json`、`verify-artifacts/`、`rehearsal-artifacts/` 和 `verify-job.log`。
