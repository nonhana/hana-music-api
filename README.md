# hana-music-api

基于 TypeScript、Effect 与 Hono 构建的第三方网易云音乐 API 实现。既可作为 ESM TypeScript SDK 在 Node.js 与 Bun 应用中调用，也可从仓库源码启动独立的 HTTP 服务。

## 核心特性

- **按需导入与全量客户端**：支持通过 `./api/*` 与 `createClient` 按需组合接口，也提供包含全部 352 个接口的 `createHanaMusicApi`。
- **端到端类型与契约校验**：提供完整的 TypeScript 输入类型提示，并为已建模返回体提供 Standard Schema v1 校验器与类型推导。
- **结构化并发与防重入**：基于 Effect 统一管理全链路超时时间、`AbortSignal` 取消、并发请求去重与实例级读缓存。
- **开箱即用的 HTTP 服务**：通过 Bun 与 Hono 启动 HTTP 服务，内置入口限流、健康检查、静态文档托管与可视化调试台。

## 安装与环境要求

```bash
npm install hana-music-api
```

- **运行时要求**：SDK 需要 Node.js `>=24` 或 Bun，仅支持 ESM 模块。
- **轻量化可选依赖**：默认安装仅依赖 `effect`。在 Node.js 中使用 `proxy` 需安装 `undici`，生成二维码图片需安装 `qrcode`，上传云盘音频解析标签需安装 `music-metadata`。
- **浏览器 Watchman 支持**：需要在浏览器端获取风控 Watchman 令牌时，可使用独立子路径 `hana-music-api/watchman`，详见 [浏览器 Watchman](website/guide/watchman.md)。

## SDK 调用

推荐使用 `createClient` 搭配按需子路径导入接口，只打包实际使用的模块并共享实例级缓存与默认配置：

```ts
import { search } from 'hana-music-api/api/search';
import { songDetail } from 'hana-music-api/api/song_detail';
import { createClient } from 'hana-music-api/core';

const hana = createClient(
  { search, songDetail },
  {
    cookie: 'MUSIC_U=your-cookie',
    cache: { enabled: true },
  },
);

const result = await hana.search({
  keywords: '周杰伦',
  limit: 5,
});

console.log(result.body);
```

快速脚本或需要完整接口集合时，也可直接从根入口创建全量客户端：

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
});

const detail = await hana.songDetail({ ids: [347230] });
console.log(detail.body);
```

- **统一返回结构**：所有接口返回 Promise，成功结果包含 `status`、`body` 与 `cookie` 字段，失败时抛出包含 `failure` 分类字段的响应对象。
- **多种调用方式**：除上述客户端方式外，还可直接调用独立具名函数或使用 `invokeModule` 按模块名动态调用，详见 [SDK 调用方式](website/guide/sdk-usage.md)。

## 启动 HTTP 服务

安装 Bun 后，在仓库根目录启动 HTTP 服务：

```bash
bun install --frozen-lockfile
bun start
```

- **默认监听地址**：服务默认监听 `0.0.0.0:3021`，可通过 `HOST` 与 `PORT` 环境变量覆盖。
- **基础端点**：`/` 为服务欢迎页，`/health` 为健康检查接口，`/demo` 为内置交互调试台，`/docs` 提供本地静态文档（需先运行 `bun run docs:build`）。

通过 `curl` 验证搜索接口：

```bash
curl 'http://127.0.0.1:3021/search?keywords=hello&limit=5'
```

HTTP 路由仅接受业务参数以及 `cookie`、`noCookie` 控制字段。代理、超时时间等执行配置须在服务端设置，详见 [HTTP 调用约定](website/guide/http-conventions.md) 与 [部署 HTTP 服务](website/guide/http-deployment.md)。

## 文档导航

在线文档站：[https://hana-music-api.netlify.app/](https://hana-music-api.netlify.app/)

- **入门与概览**：阅读 [项目简介](website/guide/introduction.md) 与 [快速开始](website/guide/getting-started.md)。
- **SDK 开发**：查看 [SDK 调用方式](website/guide/sdk-usage.md)、[包导出与子路径](website/guide/package-exports.md) 与 [认证机制](website/guide/authentication.md)。
- **配置与容错**：查看 [错误处理](website/guide/error-handling.md)、[配置参考](website/guide/config.md) 与 [重试、超时与连接策略](website/guide/resilience.md)。
- **HTTP 服务**：查看 [HTTP 调用约定](website/guide/http-conventions.md) 与 [部署 HTTP 服务](website/guide/http-deployment.md)。
- **架构与迁移**：查看 [架构设计与技术演进](website/guide/architecture.md) 与 [从 6.x 升级到 7.x](website/guide/migrating-to-v7.md)。
- **接口参考**：浏览 [API 参考目录](website/api/index.md) 与 [公共数据结构](website/api/shared-types.md)。

## 使用边界与频率控制

- **无内置出口限速**：SDK 不在本地限制或排队控制请求发送频率，每次调用都会立即发送请求至上游。
- **限流应对方式**：调用方须自行控制并发与请求频率。上游返回 HTTP 429 或业务限流时，调用会以状态 `429` 失败并附带建议等待秒数 `body.retryAfter`（不会自动重试），详见 [重试、超时与连接策略](website/guide/resilience.md)。
- **第三方声明**：本项目为第三方 API 实现，仅供技术学习与研究使用，请遵守相关平台服务协议。
