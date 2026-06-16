# SDK 使用边界

SDK 适合直接在 Node.js / TypeScript 项目里接入调用。常用入口有三个：`createHanaMusicApi()`、`invokeModule()`、camelCase 原始模块函数，用法和配置见 [编程式调用](/guide/programmatic-api)。

## SDK 还是 HTTP 服务

如果需要的是一个 HTTP 接口服务，而不是在代码里直接调用 SDK，就启动仓库里的 [Bun 服务](./getting-started.md)，适合这几种场景：

- 要给别的服务或前端统一提供 HTTP 接口
- 已经有一套基于 URL 的调用方式
- 更习惯把 Cookie、代理和部署放在服务端处理

其余情况，在自己的项目里直接接入，优先用 SDK。
