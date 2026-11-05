# 公共 API

在修改 `index.ts`、SDK runtime、生成的 client、包导出映射或兼容性行为前阅读本文件。

## 发布边界

`package.json` 的 `exports` 开放根入口 `.` 和浏览器子路径 `./watchman`。根入口面向 Node/Bun ESM，类型和运行时代码分别指向 `dist/index.d.ts` 与 `dist/index.js`；浏览器入口分别为 `dist/watchman.d.ts` 与 `dist/watchman.js`；`files` 只发布 `dist/`。下游不得依赖 `src/`、`src/server/` 或生成文件的内部路径。

根入口公开 `createHanaMusicApi`、生成的 camelCase 模块函数、`invokeModule`、`createRequest`、`createOption`、`generateDeviceId` 及其支持类型，以及收窄过返回体的模块的 `<模块名>Body` 结构定义和类型（由 `src/sdk/generated/bodies.generated.ts` 生成）。`startServer`、`createServer`、匿名配置生成和模块加载等服务内部能力不属于根 SDK 导出。

## 调用形状

- `createHanaMusicApi(config)` 创建可连续调用的 client。
- 具名模块函数适合按需调用单个端点。
- `invokeModule(identifier, query, config)` 适合模块名来自运行时的场景。
- `createRequest(target, data, options)` 是公开的底层请求原语。

以上入口都返回 Promise；响应继续保持 `{ status, body, cookie }` 外壳。Effect、Hono、`Layer` 和内部错误类型不穿过公开边界。

query 只承载端点业务输入，config 承载 Cookie、代理、fetcher、重试、期限、取消和运行时状态。SDK 的 `fetcher` 必须兼容标准 fetch 签名并遵守 `AbortSignal`；请求总期限包含重试等待和完整正文读取。

歌单收藏的 profile 已统一为 web：普通模块配置中的协议、域名、UA、协议选项和受控请求头不能覆盖其声明，Cookie 中的桌面/移动身份字段也不会进入网页请求；登录会话 Cookie 保留。收藏的 `checkToken` 支持单次字符串或每次调用现取的 provider，取消既不取值也不携带 token。其他模块的配置收口按 P12 完成，当前不应宣称全量模块已迁移。

浏览器子路径提供 `initializeWatchman` 和 Promise `getToken`，不依赖请求内核、Hono 或 Node 内置模块。Node/SSR 可以安全导入，调用浏览器 initializer 时明确失败；根入口不加载 DOM 初始化代码。

## 兼容性规则

- 模块输入类型由模块本地 `ModuleInput` 生成，公共类型表由 `types:modules:generate` 维护。
- 未确认的上游响应字段保持未知 JSON；调用者只能依赖模块已经验证的字段。结构定义对外只承诺 Standard Schema 的 `~standard.validate` 和推导出的类型，它们同时是 Effect Schema 这一点不在兼容承诺内。
- 公开包的 ESM 根入口、Promise 返回形式、`status/body/cookie` 响应外壳和 legacy Cookie 行为属于兼容性合同。
- 修改公开导出后，必须通过 `bun run test:sdk-contract`、`bun run verify:sdk` 和 `bun run build:check`。

使用说明见 `website/guide/programmatic-api.md`、`website/guide/create-request-and-create-option.md` 和 `website/guide/sdk-package-contract.md`。
