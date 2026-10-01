---
'hana-music-api': minor
---

重写请求内核与模块执行架构：统一处理请求意图、身份快照、加密、限流、并发、缓存、重试、超时、取消、响应解释和资源释放。Effect 只用于内部编排，`createHanaMusicApi`、具名模块函数、`invokeModule` 与 `createRequest` 继续返回 Promise，响应继续保持 `{ status, body, cookie }` 外壳。

所有 351 个模块现在都声明本地 `ModuleInput` 和输入解码器，并使用 `ModuleEffect` 执行；生成的 SDK 类型表与模块注册表同步更新。已确认输入会在发起请求前进行更严格的校验，依赖旧式宽松输入的调用需要按模块定义修正。

自定义模块和动态模块作者需要采用 `ModuleDefinition`、`decodeInput`、`ModuleEffect` 与 `RequestCapability` 的新内部扩展约定；普通 SDK 使用者无需引入 Effect 或改变公开调用方式。
