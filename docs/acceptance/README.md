# 验收记录

实施前从需求来源列出 AC、入口、预期行为、测试边界、适用专项及理由。使用 [template.md](./template.md)，保存到 `<requirement-slug>.md`；ticket 可用 `issue-105`，plan 和提示词使用稳定主题名，无需先开 issue。

当次结果放 `runs/<requirement-slug>.md`，记录切片、实际命令、退出码、候选指纹、报告路径与剩余事项。运行原始日志、JUnit、包 hash 和结构化摘要放 `.artifacts/testing/`。这些产物由 CI 上传，版本控制的 Markdown 保留结论和证据位置。门禁规则以 [TESTING.md](../../agent-docs/TESTING.md) 为唯一权威。

状态区分通过、失败、阻塞、未运行、不适用；不适用须在实施前说明原因。缺凭据或远端条件写明负责人和具体动作，继续不依赖它的工作。历史绿灯、skip、替身与空选择不能代替当次通过。修改候选后重新验证受影响检查，最终所有适用门禁对应同一候选。

报告只排除 `runs/` 下运行记录的内容指纹；此处的需求、模板和规范都包含在候选中。报告本身最后仍须通过格式与拼写检查。账号凭据、token、Cookie 不写入记录。

显式实施流程由 [hana-implement](../../.agents/skills/hana-implement/SKILL.md) 调度，支持 ticket、plan 和提示词。代码审查须覆盖起始 base 到完整当前工作区的已提交、暂存、未暂存和非忽略未跟踪文件，分别核对规范与需求；skill 的无副作用演练见其 examples/input-cases.md。
