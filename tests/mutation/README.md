# 定向变异

这些目标检查现有断言能不能发现指定错误，不是一套重复业务测试，也不追求全仓分数。

```bash
bun scripts/mutation-test.mts --target playlist-subscribe
bun scripts/mutation-test.mts --target shared-reads
bun scripts/mutation-test.mts --target upload
bun scripts/mutation-test.mts --target watchman
bun scripts/mutation-test.mts --target browser-types
bun scripts/mutation-test.mts --all
bun scripts/mutation-test.mts --all --dry-run
```

CLI 从当前候选（含未提交、非忽略未跟踪文件）建立临时副本，只读复用依赖，预加载 offline 防护；先运行对应有限测试基线。补丁须精确命中一次，每个故障执行后恢复副本，结束时核对原工作区内容指纹。测试关联只在 `tests/suites.ts` 的 mutation selection 登记。

browser-types 的两个有限故障分别省略浏览器和服务端 typecheck 阶段，关联用例必须发现该环境中的错误被放行；类型环境混合导致编译失败不充当有效 killed。

| 结果       | 含义                                                    |
| ---------- | ------------------------------------------------------- |
| killed     | 类型检查通过，目标关联的原生 JUnit 用例出现预期断言失败 |
| survived   | 相关测试确实执行且仍通过，是覆盖缺口                    |
| invalid    | 编译、导入或非关联断言等失败，不能计作有效 kill         |
| timeout    | 编译/进程/用例达到期限，不能计作有效 kill               |
| tool-error | 基线、选择、补丁或报告工具条件不成立                    |

`--dry-run` 只核对基线和补丁范围，不注入故障，不声称 kill。产物位于 `.artifacts/testing/mutation/`，包含原始命令、日志、JUnit、候选、故障位置和失败标题。任一 survived/invalid/timeout/tool-error 令实际变异命令非零退出；控制样本自测故意验证这些非零结果。
