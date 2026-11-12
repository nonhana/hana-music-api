# 普通 PR 合入后的重复验证

此次改动在 [PR #136](https://github.com/nonhana/hana-music-api/pull/136) 验收。对照组是此前 [#135 合入后的 master push](https://github.com/nonhana/hana-music-api/actions/runs/43252382167)，从创建到结束为 2 分 20 秒。两次都按 workflow 的创建和完成时间计算，包含排队。PR 描述记录最终运行、回退演练及实测耗时。

首次 [PR verify](https://github.com/nonhana/hana-music-api/actions/runs/43255310460) 证实 GitHub 的 job API 能从对应 attempt 返回实际 checkout 的 Git tree。审查时将四份套件报告的内容指纹统一替换，原汇总仍能通过。因此签发复用凭据前还要独立计算干净 checkout 的内容指纹，并核对五个分片在检查前后的 Git 状态。

本地进程测试覆盖匹配、不同 tree、不同 PR、不同合入提交、失败 run、跳过步骤、缺少 verify job 和 API 错误。只有完全匹配的记录给出 run ID。远端回退演练使用独立分支执行普通 push 的查询和完整 verify，发布路径使用只读 dry-run 演练。
