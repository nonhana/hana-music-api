# 测试与验证

在修改测试、选择验证范围、触碰请求流量控制或准备交付前阅读本文件。

## 测试分层

- `tests/unit/`：密码、请求核心和运行时基础行为。
- `tests/contract/`：公开 SDK、模块输入、生成表面、模块运行时和架构边界。
- `tests/integration/`：Hono 服务、CLI 和模块路由。
- `tests/load/` 与 `scripts/load-test.mts`：本机 loopback 流量、取消、HTTP 入口限流、资源释放和负载验收。
- `tests/live/`：真实上游的门控测试，不属于默认回归基线。
- `tests/_kit/`：Effect 测试的统一入口；测试中的 `Effect.run*` 和 Layer 提供应集中在 kit 内。返回体契约测试判断“结构不符”的断言用 `assertions.ts` 的 `expectUpstreamShapeRejection`，录制文件和导出结构定义的类型用同一文件的 `Recording`、`Validator`；回放录制用 `replay.ts` 的 `replay`/`replayRaw`。

## 基线命令

- 默认回归：`bun test tests/unit tests/contract tests/integration` 或 `bun run test`。
- 模块生成检查：`bun run types:modules:check`。
- 结构定义与录制审计：`bun run schema:audit check` 检查结构定义写法，`bun run schema:audit recordings --recordings tests/fixtures/netease` 用本仓库录制回放校验。`schema:audit` 的默认录制根是 Campanula 仓库的 `../campanula-svelte-main/tests/fixtures/netease`，在 SDK 仓库里运行必须显式传 `--recordings tests/fixtures/netease`。
- Fixtures 门槛：`bun run verify:fixtures`（`bun run schema:audit check && bun run schema:audit recordings --recordings tests/fixtures/netease`），只依赖本仓库 fixtures。
- 类型、静态检查和格式：`bun run typecheck`、`bun run lint`、`bun run spell`、`bun run fmt:check`。
- 完整仓库验证：`bun run verify`（含 `bun run schema:audit check`）。
- SDK 与发布验证：`bun run verify:sdk`、`bun run test:sdk-contract`、`bun run build:check`。

`verify`、`verify:sdk` 和 `build:check` 都会写入或读取构建输出；需要串行运行，上一条通过后再运行下一条。

## 交付门禁与完成判定

准备交付前，先按需求和实际改动列出本次必须通过的检查：

- 代码、测试、构建、生成器或工具配置变更：执行 `bun run verify`。
- SDK 公开表面或包交付变更：另执行 `bun run verify:sdk`，并满足 [PUBLIC_API.md](./PUBLIC_API.md) 的验证要求；返回体结构定义或录制变更另执行 `bun run verify:fixtures`。请求与流量变更还需通过下文规定的 smoke 和 soak。
- 仅文档变更：执行 `bun run fmt:check`、`bun run spell`；涉及文档站内容或配置时另执行 `bun run docs:build`。

所有检查针对同一份最终候选代码。记录分支、HEAD、未提交改动范围，以及实际执行的命令、结果和必要的日志位置；修复后重新运行受影响的检查。历史报告、其他分支或修复前的通过结果只供参考。

代码交付的 lint 必须达到 **0 warning、0 error**。`bun run lint:fix` 只负责应用自动修复，修复后仍须通过 `bun run lint`。保持既定检查强度，不能通过关闭规则、降低级别、扩大忽略范围或跳过失败测试来达标。

### 失败、阻塞与例外

任一适用门禁失败，交付状态就是“未完成”，即使功能和专项测试已经通过。既有基线问题同样计入失败；问题来源只用于定位和说明，不构成豁免。组合命令中任一步失败，整个命令仍是失败，前面通过的步骤不能代替整体结果。

缺少环境、权限、凭据或外部条件而无法执行的检查，记录为“阻塞”，说明缺失条件和需要的帮助。未运行、空测试选择、全部跳过或没有执行到断言，都不能计为通过。

在已授权范围内继续修复失败项；超出授权范围或需要用户帮助时，保持未完成状态并说明问题。只有用户明确同意调整验收范围或接受具体例外后，才能按调整后的约定交付；记录用户决定、未通过的检查及影响，仍不得将这些检查写成“已通过”。

### 审查与交付报告

审查输入必须包含适用门禁清单、实际运行结果和所有未解决问题，涵盖本次引入和既有基线问题。审查者直接核对命令输出或日志，再给出判断。使用双轴审查时，规范轴核对仓库约定及门禁结果，需求轴核对需求验收条件及其实际证据；审查者可以区分问题来源，但不得因此从验收问题清单中排除失败项。

“本次 diff 未发现问题”只是代码审查结论。最终交付由负责交付的 agent 汇总需求证据、自动检查和审查结果，按以下条件报告：

| 状态   | 判定条件                                                                     |
| ------ | ---------------------------------------------------------------------------- |
| 完成   | 需求验收条件有实际证据，所有适用门禁通过，审查无未解决的阻断项。             |
| 未完成 | 任一需求尚未实现、适用门禁失败或审查阻断项未解决；说明已完成部分和剩余问题。 |
| 阻塞   | 必要验证无法执行；说明缺失条件，不宣称任务完成。已知失败项仍按“未完成”报告。 |

交付报告逐项写出实际命令和结果，列明未通过、未执行或被用户明确接受的例外。只有满足“完成”条件才能宣称任务完成，不能用“功能已实现”或“审查无发现”替代完整验收。

## CI

`.github/workflows/verify.yml` 在 PR 和 master push 上依次运行 `bun run verify:sdk`、`bun run verify:fixtures` 和 `bun run test:load:smoke`。fixtures 门槛与本地相同：只读本仓库 `tests/fixtures/netease` 的录制，不访问真实上游。

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
