# 客户端身份更新的验证结果

[验收条件](../client-identities-2026.md)对应 master 的 344d28a 与工作区改动，内容指纹为 `d666c4f46df8044c5a1c24c2bd90dd1ab81cde527af38a9fc24f9cfe783206f1`。下列日志位于 `.artifacts/testing/client-identities-2026/`。

| 检查                 | 实际结果                                                                                                                                                                                                               | 日志                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 播放请求旧值复现     | 更新测试预期后，SDK 发出 9.0.90，断言要求 9.6.20，失败 1 项                                                                                                                                                            | before.log          |
| 请求身份与特殊请求链 | 更新实现后，执行 `bun test tests/behavior/runtime/request-identity.test.ts tests/behavior/modules/special/special-chains.test.ts`，381 项通过。覆盖原始请求的平台与调用方覆盖、解密后的播放正文，以及两条 Mac 播放日志 | targeted.log        |
| 请求负载             | `bun run test:load:smoke` 退出 0。142 项测试通过，100 个并发用户完成 500 次请求，结束时上游活动数与在途数均为 0                                                                                                        | test-load-smoke.log |
| 身份回归变异         | 分别执行 `bun scripts/mutation-test.mts --target <组名>`。request-identity 9 项、library-playback 8 项、playlist-subscribe 3 项、check-token 11 项全部由对应断言检出，四次退出码均为 0                                 | mutation-*.log      |
| 仓库验证             | `bun run verify` 退出 0。8254 项本地测试通过，零失败、零跳过。类型、lint、拼写、格式和文档构建均通过                                                                                                                   | verify.log          |
| 打包消费者           | `bun run verify:sdk` 退出 0。32 项 SDK 测试通过，含 Node 和 Bun 对本次 tarball 发出请求的断言                                                                                                                          | verify-sdk.log      |

独立审查发现三条测试变异仍指向网页 Cookie 的旧位置，已改指 config.ts，并在四组定向变异中验证。初次变异与生成器同时运行，初次全仓验证期间也修正了变异路径；两次均因工作区指纹变化作废。
