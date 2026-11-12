# PR CI 提速实测

基线为 origin/master 的 c88437f；第一阶段 2a633b9，第二阶段 fe2c4c8。用 Actions 创建到结束的墙钟时间，包含 runner 排队。

| 样本                                                                                   | verify                                 | 发布演练                                                                                              |
| -------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [原 PR #133](https://github.com/nonhana/hana-music-api/actions/runs/43230621500)       | 9:30                                   | 2:37                                                                                                  |
| [同一 master 基线](https://github.com/nonhana/hana-music-api/actions/runs/43235580510) | 7:37；生成检查单次约 35 秒             | push 不运行 PR 演练                                                                                   |
| [仅生成器批处理](https://github.com/nonhana/hana-music-api/actions/runs/43242505522)   | 7:12；两次生成检查分别约 2.2 和 2.0 秒 | 无待发 changeset 时原演练退出 1                                                                       |
| [并行去重](https://github.com/nonhana/hana-music-api/actions/runs/43243383203)         | 2:25                                   | [3:43](https://github.com/nonhana/hana-music-api/actions/runs/43243383690)，两项并发，全部结束约 3:44 |

下载两轮真实报告，按文件和原生用例名逐项对比计数：143 个文件、8,329 条通过用例完全相同，零失败、零跳过。生成后无受控差异，故意改坏一个生成入口返回 1；删除已下载的一个分片后汇总命令非零。[远端故障演练](https://github.com/nonhana/hana-music-api/actions/runs/43243369819) 中 static 与总门禁均失败，实际下载的失败日志与原生 JUnit 保留 1 个失败、0 个跳过，无完成标记。

本地针对 fe2c4c8 顺序执行 verify、verify:sdk、verify:fixtures、test:load:smoke 全部通过。性能数字是单次样本，不表示长期分位数。未更改保护规则或发布包。
