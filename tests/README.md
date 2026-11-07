# 测试导航

运行完整本地回归用 `bun run test`；交付门禁与完成判定以 [TESTING.md](../agent-docs/TESTING.md) 为准。所有命令从仓库根目录执行，测试选择集中在 [suites.ts](./suites.ts)。迁移台账见 [testing-migration.md](../docs/acceptance/testing-migration.md)。

| 集合         | 命令                        | 证明范围                                   |
| ------------ | --------------------------- | ------------------------------------------ |
| 完整本地回归 | `bun run test`              | 当前全部默认测试，不选择 live 或十分钟负载 |
| SDK          | `bun run test:sdk-contract` | 包消费者、公开模块与发现合同               |
| 有限流量     | `bun run test:load:smoke`   | 本机传输与 500 次 loopback 负载            |
| 长时流量     | `bun run test:load:soak`    | 十分钟 loopback 与资源归零                 |
| 原始录制     | `bun run verify:fixtures`   | 响应结构与录制，不能证明当次上游可用       |

`_kit/` 放可执行工具，`fixtures/netease/` 保留录制原文。七类目标为 unit、behavior、replay、transport、package、live、mutation，现已归位；mutation 检查测试辨别力，不是重复业务测试。共享构建输出的命令串行执行。

每次 runner 输出 `.artifacts/testing/` 下的报告位置，缺报告、空选择或必要测试跳过均失败。回放只说明响应合同，严格假上游说明受控请求行为，loopback 说明真实本地传输，包消费者说明产物，live 才说明当次真实上游。

本地 runner 在每个 Bun 测试进程预加载 offline 防护，只放行本次注册的 loopback origin；Node 代理消费者在启动时安装同样的默认路径防护，并继续核对代理的物理目标。安装依赖的 npm 进程与产品网络分开。此工具不构成操作系统网络沙箱；Node 原生 fetch/Undici 默认 dispatcher 另有真实子进程探针。严格请求用 `_kit/upstream/scenario.ts` 的 `withScenario`，在 finally 中核对发送、未消费期待、独立异常 ledger 和清理错误。响应回放仍只负责响应合同。

本机真实传输用 `_kit/upstream/loopback.ts`，每条路由显式登记，未知 URL/方法会进入独立失败 ledger。`sent` 记录逻辑上游与实际 loopback socket；负载报告保存目标、发送次数和资源计数。使用 `await using` 管理 loopback 和监听服务，使业务断言与清理同时失败时保留两者；十分钟 soak 的时间、吞吐、内存和资源阈值保持原标准。

原本地测试已完成目录迁移，公开类型文件在 `package/types/` 由 tsc 检查。包测试先重新构建当前候选，再将同一 tarball 安装到临时消费者，让 Node 和 Bun 执行同一套 SDK、Standard Schema、收藏与导出检查；产物、包 SHA-256、文件 hash 和运行时版本留在 package 证据目录。源代码导入通过不能替代包消费者通过。

模块 capability 替身在 `_kit/module.ts`，上传装配在 `_kit/upload.ts`，产物扫描在 `_kit/artifacts.ts`；人工静态数据在 `fixtures/synthetic/`，Node/Bun 消费者入口在 `fixtures/consumers/`。没有旧路径转发。定向变异用 `bun scripts/mutation-test.mts --all`，真实上游用 `LIVE_UPSTREAM=1 bun run test:live`；权限和预算见 TESTING。

runner 除静态检查外，在 Bun 子进程中安装 only 违例 ledger，覆盖局部别名与动态选择，捕获异常也不能报绿。offline 防护拒绝 native fetch 自动重定向，显式 manual 边界保留响应；socket 测试在夹具强制清理之前观察取消/期限后的连接关闭。
