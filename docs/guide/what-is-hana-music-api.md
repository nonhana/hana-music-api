# 什么是 hana-music-api

`hana-music-api` 是一个网易云音乐第三方 API，基于 Bun + Hono 构建，覆盖 350+ 接口。它既能作为 HTTP 服务部署，也能作为带完整类型的 SDK 直接 `import`。

它是 `NeteaseCloudMusicApi` 的 TypeScript 重写版本，对齐了原项目的接口行为，同时重做了请求层：内置流量伪装、重试与超时、响应缓存和匿名身份池，并为每个接口补上了 TypeScript 类型。

## 性能

运行时用 [Bun](https://github.com/oven-sh/bun)，HTTP 框架用 [Hono](https://github.com/honojs/hono)。

- Bun 原生执行 TypeScript，没有额外的编译步骤，冷启动和热重载都快；原生 `fetch` 和 server API 也省掉了一层适配。
- Hono 只负责路由和中间件，请求处理路径短，单机转发的额外开销很低。
- 请求层默认带 8s 单次超时和连接策略，避免高并发下挂死的连接拖垮整体吞吐；可选的响应缓存配合并发去重（single-flight），还能挡掉重复请求，减少打到上游的次数。

## 开发体验

hana-music-api 提供两种接入方式：

- **HTTP 服务**：`bun start` 起一个接口服务，适合给前端或其它服务统一供数。
- **SDK**：直接 `import`，适合在 Node / TypeScript 项目里嵌入调用。

DX 的核心是类型。每个接口的业务参数和响应都附有完整 TS 类型：

- 编辑器里直接补全参数、查看返回结构，不用翻文档对字段。
- 类型把「业务参数 `query`」和「执行配置 `config`」分开，传错位置编译期就会报错。
- 350+ 接口都生成了对应的 camelCase 函数和 client 方法；模块名来自运行时字符串时，还能用 `invokeModule()` 动态调用。
