# #107：浏览器 Watchman 子路径

来源：[#107](https://github.com/nonhana/hana-music-api/issues/107) 的 AC-01 至 AC-13，父合同 [#80](https://github.com/nonhana/hana-music-api/issues/80)，参数来源 [Campanula #30](https://github.com/nonhana/campanula-music/issues/30#issuecomment-6238568996)。

基线：`feature/refactor`，HEAD `d03260f7bf2f015311031898b689ff7340b52e6e`，起始工作区干净。

目标：增加独立 `hana-music-api/watchman` Promise 入口，运行时加载官方脚本，页面复用初始化、按次取 token；维护原 SDK 请求合同。

范围：浏览器封装、公开导出与类型、构建包、浏览器与消费者测试、有限变异、文档、changeset。非目标：设备模拟、token 生成、浏览器业务 SDK、账号写入、其他模块迁移或发布。

本次授权：实施、TDD、本地验证与独立审查。未授权 commit、push、PR、关票、发布或账号操作。用户已授权本次在批准的 origin 加载官方脚本并取两次 token，具体页面 URL 尚待提供；缺条件时 AC-10 保持阻塞，其余工作继续。

| AC    | 入口与预期                                                                  | seam 与决定性证据                                                | 适用性与必要条件                                   |
| ----- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| AC-01 | 公开 initializer 加载官方 HTTPS 脚本，传递默认/覆盖参数与业务 key           | behavior/browser/watchman：观察真实 script 及官方回调替身入参    | 适用，离线浏览器，不录制真实 token                 |
| AC-02 | 并发/重复初始化只加载、初始化一次，复用 client                              | 同入口并发调用，实际脚本/初始化次数及实例比较                    | 适用，独立页面                                     |
| AC-03 | 加载/初始化失败和超时后可主动重试，迟到回调无效                             | 控制脚本/初始化完成阶段，观察错误、资源和新尝试                  | 适用，有界浏览器时间                               |
| AC-04 | 连续/并发取值分别调用官方接口，交错回调不串值                               | client.getToken，替身独立回调与调用次数                          | 适用，不测试私有状态                               |
| AC-05 | 空值/抛错/超时明确失败，无 token 缓存、日志或持久化                         | client.getToken，错误类型、后续取值、浏览器事件与存储            | 适用，合成测试值；失败不重放                       |
| AC-06 | 两入口无 DOM 导入安全，调用 initializer 才失败                              | 同 tarball 的 Node/Bun 消费者，DOM 访问陷阱                      | 适用，现有消费者继续验证根入口                     |
| AC-07 | SDK 字符串/provider、optional/none、期限/取消保持                           | 复用 playlist/subscribe 与共享读取公开入口现有行为回归           | 适用，无请求内核改动，不制造额外 red               |
| AC-08 | 根与 watchman 公开包路径、声明和包文件一致，内部路径封闭                    | tests/package/release.test.ts 同 tarball 安装、类型与 serverless | 适用，包 SHA-256；映射旧 contract 路径             |
| AC-09 | 安装包的真实浏览器消费者可用，nonce 实际通过 CSP，无 Node/Hono/请求内核依赖 | package 的浏览器构建依赖图、实际执行与 CSP；根依赖图隔离         | 适用，Playwright Chromium；缺浏览器即失败，不 skip |
| AC-10 | 批准 origin 的官方脚本初始化，同页两次 170 字符样本                         | 作者或本次授权浏览器专项，独立脱敏记录                           | 本次执行已授权，具体 origin 尚待用户提供           |
| AC-11 | 清单登记、测试能识别关键故障                                                | suites.ts 与 runner；watchman 三个有限变异实际 killed            | 适用，重复初始化、旧 token、失败状态故障           |
| AC-12 | 同候选完整门禁通过，lint 零警告零错误，负载清零                             | verify、verify:sdk、fixtures、smoke、soak、mutation --all        | 全部适用；构建与打包串行；浏览器测试纳入 local/sdk |
| AC-13 | 文档/changeset、证据和独立双轴审查完整                                      | 本矩阵、runs/issue-107.md、原生 JUnit/摘要/包 hash 与审查        | 全部适用；外部阻塞不能写通过                       |

顺序：公开入口与初始化 → 失败/清理 → 按次 token → 包/浏览器边界 → 文档与有限变异 → 同候选门禁和独立审查。每个新行为先观察断言 red，再最小实现 green；导入失败不作为行为 red。

专项：无新的上游响应合同，不新增 replay；现有 replay 随完整回归验证。无请求内核或 socket 新机制，不另写 transport 测试，按来源仍执行 smoke/soak。默认匿名 live、账号专项、CI 远端演练、发布 preflight 不适用；AC-10 独立真实浏览器证据仍必需。unit 不机械增加一套对内部状态的重复测试，生命周期从公开浏览器入口证明。

最终串行门禁：`bun run verify` → `bun run verify:sdk` → `bun run verify:fixtures` → `bun run test:load:smoke` → `bun run test:load:soak` → `bun scripts/mutation-test.mts --all`。`verify:sdk` 包含 `build:check` 和 `test:sdk-contract`。原始证据在 `.artifacts/testing/`，当次状态见 [runs/issue-107.md](runs/issue-107.md)。
