# Soak 改为按需手动测试

来源：用户要求 soak 作为独立、手动调用的测试，workflow 只保留按明确断言完成的正确性检查，避免固定十分钟等待阻塞发布。

范围：移除 soak workflow 和发布 preflight 的 soak 调用，同步进程控制回归与当前验收规则；保留独立命令、十分钟场景和原有判定。

| AC        | 预期行为                                                                                                | 证据                                              |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| MANUAL-01 | `bun run test:load:soak` 仍可独立调用，原脚本与时长、资源阈值保留                                       | package script 与负载脚本无改动                   |
| MANUAL-02 | 所有 workflow 均不直接或通过发布 preflight 调用 soak，删除定时与手动 load workflow                      | workflow 检查、实际发布命令的进程控制 trace       |
| MANUAL-03 | 发布前继续依次执行 verify、SDK、fixtures、smoke、mutation、匿名 live 与包一致性核对；任一失败仍阻止发布 | release-preflight 的真实 Bun 子进程与失败控制样本 |
| MANUAL-04 | 当前文档将 soak 作为用户按需测试，默认交付和发布不要求 soak                                             | TESTING、BUILD 与测试导航；格式、拼写检查         |

适用门禁：串行 `bun run verify`、`bun run verify:sdk`、`bun run test:load:smoke`；进程控制专项覆盖实际发布入口与剩余 workflow 的失败传播。响应结构与录制未改动，fixtures 专项不适用；请求内核与 mutation/live 实现未改动，不额外执行定向变异或真实上游。soak 按本次明确调整后的验收范围不执行。

本次规则取代历史验收中关于 soak 自动执行或强制门禁的要求；既有运行记录保留为历史证据。

当次结果：[runs/soak-manual.md](runs/soak-manual.md)。
