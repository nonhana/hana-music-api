# hana-music-api

用 TypeScript 和 Effect 实现的第三方网易云音乐 API，提供搜索、歌曲、歌单、登录等接口。可作为 SDK 在 Node.js 中调用，也可用 Bun 启动 HTTP 服务。

## 安装

```bash
npm install hana-music-api
```

SDK 需要 Node.js 24 或更高版本，仅支持 ESM。

## 直接调用

创建客户端后，用 `async/await` 调用接口：

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
});

const result = await hana.search({
  keywords: '周杰伦',
  limit: 5,
});

console.log(result.body);
```

接口返回 Promise，结果包含 `status`、`body` 和 `cookie`。业务参数传给接口方法，Cookie、代理、超时等配置传给客户端，或作为方法的第二个参数。

也可单独导入 `search`、`songUrl` 等函数，或用 `invokeModule()` 按模块名调用，详见[编程式调用](docs/guide/programmatic-api.md)。账号信息、歌单管理等接口需要有效 Cookie。

SDK 不在本地限制请求频率：每次调用都会立刻发给网易云，不排队、不限速。调用方（例如音乐爬虫）要自己控制请求频率；网易云返回 HTTP 429 或业务 `code: 429` 时，调用以状态 429 失败，`body.retryAfter` 给出建议等待的秒数，SDK 不会自动重试。详见[请求频率由调用方控制](docs/guide/retry-timeout-resilience.md#请求频率由调用方控制)。

## 启动 HTTP 服务

安装 Bun 后，在仓库目录执行：

```bash
bun install --frozen-lockfile
bun start
```

默认监听 `0.0.0.0:3021`，可通过 `HOST`、`PORT` 环境变量修改。

- 服务首页：`http://127.0.0.1:3021/`
- 健康检查：`http://127.0.0.1:3021/health`
- 文档：`http://127.0.0.1:3021/docs`，需先运行 `bun run docs:build`

调用搜索接口：

```bash
curl 'http://127.0.0.1:3021/search?keywords=hello&limit=5'
```

HTTP 接口接受业务参数及 `cookie` / `noCookie`，代理、重试等执行配置只能在服务端设置。限流与缓存规则见[调用约定](docs/guide/request-convention.md)。

## 文档

VitePress: [https://hana-music-api.netlify.app/](https://hana-music-api.netlify.app/)

- [快速开始](docs/guide/getting-started.md)
- [编程式调用](docs/guide/programmatic-api.md)
- [认证机制](docs/guide/authentication.md)
- [调用约定](docs/guide/request-convention.md)
- [API 参考](docs/api/index.md)
