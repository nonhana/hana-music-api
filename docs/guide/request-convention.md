# 调用约定

## HTTP 输入

模块路由接受 GET/POST 业务参数和传统的 `cookie` / `noCookie`。请求头 Cookie 作为默认值，query 再覆盖，body 最后覆盖；HTTPS 响应保留 `SameSite=None; Secure`。

HTTP 不能设置执行配置。`domain`、`proxy`、`headers`、`fetcher`、`state`、`retry`、`timeoutMs` 等会在发送前返回 400。
`signal`、`crypto`、`ip`、`realIP`、`ua` 也一样。
SDK 调用应把这些字段放在 config。

## 入口保护

默认每个连接 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块和 2 个上传。限流返回 429，容量耗尽返回 503，附带 `Retry-After`。许可在 body 解析前取得。
静态资源、文档与 `/health` 不消耗模块配额。

身份取 Bun 的真实连接地址。只有连接地址属于显式的 `traffic.trustedProxyIps` 才接受第一个有效的 `X-Forwarded-For` IP；
反向代理必须覆盖客户端传入的 `X-Forwarded-For`，不能追加。嵌入式 Hono 没有连接地址时共用 `unknown` 桶。

调试执行入口 `/demo/api-debug/request` 默认返回 404。本地代码可用以下配置开启：

```ts
startServer({ hostname: '127.0.0.1', debugApiRequests: true });
```

只接受受控的 `/api/` URI 与加密枚举。

## 缓存

HTTP 只缓存 `search`、`lyric`、`song_detail`、`playlist_detail`，默认 120 秒。同身份、参数、目标和配置的同时读取只发一次上游请求。

登录、二维码轮询、批量、写入、上传以及未分类模块不缓存、不合并。轮询不需要用时间戳避免本地缓存；读取接口可用变化的 timestamp 刷新。

## SDK 配置

```ts
await hana.search(
  { keywords: '音乐' },
  {
    cookie: 'MUSIC_U=your-token',
    timeoutMs: 5000,
    signal: controller.signal,
  },
);
```

`proxy` 配置真实代理；`ip` / `realIP` 仅影响 HTTP 头，不会改变网络出口。
详见 [执行配置](/guide/config-reference) 和 [请求层总览](/guide/request-layer-overview)。
