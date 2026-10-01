# 部署 HTTP 服务

HTTP 服务从仓库源码启动，运行时使用 Bun。npm 包的根入口只提供 SDK，不导出 `startServer`。

## 从源码启动

```bash
git clone https://github.com/nonhana/hana-music-api.git
cd hana-music-api
bun install --frozen-lockfile
bun run docs:build
bun start
```

默认监听 `0.0.0.0:3021`。`/health` 用于检查服务，`/demo` 提供示例页面，`/docs` 提供构建后的文档。

只运行 API 时可以跳过文档构建，但此时访问 `/docs` 会返回 503 和构建提示。修改文档后需要重新运行 `bun run docs:build` 才会更新服务中的静态页面。单独开发文档可运行 `bun run docs:dev`。

## CLI 环境变量

| 变量                   | 默认值                             | 用途             |
| ---------------------- | ---------------------------------- | ---------------- |
| `HOST`                 | `0.0.0.0`                          | 监听地址         |
| `PORT`                 | `3021`                             | 监听端口         |
| `ANONYMOUS_TOKEN_FILE` | 系统临时目录中的 `anonymous_token` | 游客令牌保存路径 |

CLI 启动前会读取已有游客令牌，缺少时尝试注册。需要跨重启保留它时，把 `ANONYMOUS_TOKEN_FILE` 指向服务可写的持久目录。

生产环境可运行 `bun run start:prod`。它设置生产环境变量，监听地址和端口仍由上表控制。

## 使用 PM2

仓库已经提供 `ecosystem.config.cjs`：

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
```

PM2 管理的是 Bun 进程，配置中的 `interpreter` 为 `bun`。默认启动一个进程，日志写入 `logs/`，游客令牌保存到 `data/runtime/anonymous_token`。确保 PM2 的运行环境能找到 Bun。

## 调整服务选项

缓存、可信代理和请求体限制是源码服务选项，不是任意同名环境变量。在仓库根目录创建自己的启动文件，例如 `server.ts`：

```ts
import { ensureAnonymousToken, startServer } from './src/app/cli.ts';

await ensureAnonymousToken();
await startServer({
  hostname: '127.0.0.1',
  port: 3021,
  cacheEnabled: false,
  maxBodyBytes: 25 * 1024 * 1024,
  bodyTimeoutMs: 10_000,
});
```

然后运行 `bun server.ts`。这个相对导入只适用于仓库源码，不适用于安装后的 npm 包。

| 选项                        | 默认值         | 作用                               |
| --------------------------- | -------------- | ---------------------------------- |
| `cacheEnabled`              | `true`         | 是否保存明确读接口的结果           |
| `cacheTtlMs`                | `120000`       | 结果保存时间，单位毫秒             |
| `maxBodyBytes`              | 10 MiB         | 客户端请求体大小限制               |
| `bodyTimeoutMs`             | `5000`         | 读取客户端请求体的最长时间         |
| `corsAllowOrigin`           | 按请求来源返回 | 指定允许跨域调用的来源             |
| `traffic.requestsPerSecond` | `2`            | 每个连接 IP 每秒恢复的入口请求额度 |
| `traffic.burst`             | `10`           | 单个 IP 的突发额度                 |
| `traffic.maxInFlight`       | `32`           | 同时执行的模块数                   |
| `traffic.maxUploads`        | `2`            | 同时执行的上传模块数               |
| `traffic.trustedProxyIps`   | 不信任转发来源 | 允许代传客户端 IP 的连接地址列表   |
| `debugApiRequests`          | `false`        | 是否开启本地调试执行入口           |

multipart 文件总量受 `maxBodyBytes` 限制，整个请求另有 64 KiB 的表单边界和头部余量。上传较大音频时需要相应提高上限。体积过大返回 413，读取请求体超时返回 408。这与模块执行期间的 504 超时是两件事。

## 入口限流和出口限流

```mermaid
flowchart LR
  CLIENT["客户端"] --> INBOUND["入口检查<br/>IP 频率、模块与上传容量"]
  INBOUND --> BODY["读取并解析请求体"]
  BODY --> MODULE["执行模块"]
  MODULE --> OUTBOUND["进程出口检查<br/>域名、身份、同时发送数"]
  OUTBOUND --> NCM["网易云"]
```

入口检查在读取 body 前执行。请求太频繁返回 429，模块或上传容量不足返回 503，并附带 `Retry-After`。静态资源、文档和 `/health` 不消耗模块配额。

出口限流约束本进程实际发给网易云的请求，SDK 与 HTTP 默认共享它。调大 HTTP 模块容量不会自动调大出口额度。默认出口参数见 [冷却与忙碌](/guide/retry-timeout-resilience#冷却与忙碌)。

## 放在反向代理后面

服务默认按真实连接 IP 区分调用方。只有连接地址位于 `traffic.trustedProxyIps` 时，才使用 `X-Forwarded-For` 中第一个合法 IP。

比如代理和服务运行在同一台机器，并通过 `127.0.0.1` 连接时，可在启动选项里设置 `traffic: { trustedProxyIps: ['127.0.0.1'] }`。实际使用其他地址时，填入对应的代理连接地址。

代理必须覆盖客户端自带的 `X-Forwarded-For`，不能直接追加。HTTPS 终止在代理时，也要正确设置转发协议头，以便服务写回 HTTPS Cookie。

多进程或多实例的内存配额互不共享，需要在可信代理层增加统一限流。嵌入 Hono 且没有提供连接地址时，请求会共用 `unknown` 身份桶。

## 调试入口

`/demo/api-debug/request` 默认关闭。仅通过源码的 `startServer` 且监听 loopback 地址时，才可设置 `debugApiRequests: true`。开启后也只接受受控的 `/api/` 路径和加密枚举。

日常请求参数和 Cookie 规则见 [HTTP 调用约定](/guide/request-convention)。
