# 公共 API

在修改 `index.ts`、SDK runtime、生成的 client、包导出映射或兼容性行为前阅读本文件。

## 发布边界

`package.json` 的 `exports` 只开放根入口 `.`，类型和运行时代码分别指向 `dist/index.d.ts` 与 `dist/index.js`；`files` 只发布 `dist/`。下游不得依赖 `src/`、`src/server/` 或生成文件的内部路径。

根入口公开 `createHanaMusicApi`、生成的 camelCase 模块函数、`invokeModule`、`createRequest`、`createOption` 及其支持类型，以及收窄过返回体的模块的 `<模块名>Body` 结构定义和类型（由 `src/sdk/generated/bodies.generated.ts` 生成）。`startServer`、`createServer`、匿名配置生成和模块加载等服务内部能力不属于根 SDK 导出。

## 调用形状

- `createHanaMusicApi(config)` 创建可连续调用的 client。
- 具名模块函数适合按需调用单个端点。
- `invokeModule(identifier, query, config)` 适合模块名来自运行时的场景。
- `createRequest(target, data, options)` 是公开的底层请求原语。

以上入口都返回 Promise；响应继续保持 `{ status, body, cookie }` 外壳。Effect、Hono、`Layer` 和内部错误类型不穿过公开边界。

query 只承载端点业务输入，config 承载 Cookie、代理、fetcher、重试、期限、取消和运行时状态。SDK 的 `fetcher` 必须兼容标准 fetch 签名并遵守 `AbortSignal`；请求总期限包含重试等待和完整正文读取。

## 兼容性规则

- 模块输入类型由模块本地 `ModuleInput` 生成，公共类型表由 `types:modules:generate` 维护。
- 未确认的上游响应字段保持未知 JSON；调用者只能依赖模块已经验证的字段。结构定义对外只承诺 Standard Schema 的 `~standard.validate` 和推导出的类型，它们同时是 Effect Schema 这一点不在兼容承诺内。
- 公开包的 ESM 根入口、Promise 返回形式、`status/body/cookie` 响应外壳和 legacy Cookie 行为属于兼容性合同。
- 修改公开导出后，必须通过 `bun run test:sdk-contract`、`bun run verify:sdk` 和 `bun run build:check`。

使用说明见 `docs/guide/programmatic-api.md`、`docs/guide/create-request-and-create-option.md` 和 `docs/guide/sdk-package-contract.md`。
