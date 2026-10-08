# 测试与验证

在修改测试、选择验证范围、触碰请求流量控制或准备交付前阅读本文件。

## 测试分层

- `tests/unit/`：密码、请求核心和运行时基础行为。
- `tests/contract/`：公开 SDK、模块输入、生成表面、模块运行时和架构边界。
- `tests/integration/`：Hono 服务、CLI 和模块路由。
- `tests/load/` 与 `scripts/load-test.mts`：本机 loopback 流量、取消、HTTP 入口限流、资源释放和负载验收。
- `tests/live/`：真实上游的门控测试，不属于默认回归基线。
- `tests/_kit/`：Effect 测试的统一入口；测试中的 `Effect.run*` 和 Layer 提供应集中在 kit 内。

## 基线命令

- 默认回归：`bun test tests/unit tests/contract tests/integration` 或 `bun run test`。
- 模块生成检查：`bun run types:modules:check`。
- 类型、静态检查和格式：`bun run typecheck`、`bun run lint`、`bun run spell`、`bun run fmt:check`。
- 完整仓库验证：`bun run verify`。
- SDK 与发布验证：`bun run verify:sdk`、`bun run test:sdk-contract`、`bun run build:check`。

`verify`、`verify:sdk` 和 `build:check` 都会写入或读取构建输出；需要串行运行，上一条通过后再运行下一条。

## 请求与流量变更

- 请求、取消、重试、缓存或流量控制变更至少运行 `bun run test:load:smoke`。
- 交付前的流量验收还需运行 `bun run test:load:soak`；该命令约运行十分钟，只连接 loopback。
- 负载报告写入 `_notes/load-reports/`，结束时应确认 `upstreamActive` 和 `inflight` 均归零。
- 负载脚本使用本地 fake upstream；通过它不能推断网易云真实上游的可用性。

## 真实上游测试

执行 `LIVE_UPSTREAM=1 bun run test:live` 才会启用 `tests/live/`。其中 `login_status` 还需要 `NCM_LIVE_COOKIE`；SDK 不在本地限制请求频率，测试靠固定的小集合顺序执行来控制频率，不应改成并发。

当前验证流程不依赖数据库；测试应沿用现有 fixtures、fake upstream 和自定义 fetcher，不另设 mock 数据库。

重构验收的历史结果和证据边界见 `_notes/effect-refactor/final-report.md`，不能将其中的测试数量视为永久不变的通过证明。

相关实现：`package.json`、`tests/_kit/`、`tests/contract/`、`tests/load/`、`scripts/load-test.mts`、`.github/workflows/`。
