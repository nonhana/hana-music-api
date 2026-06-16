# 执行配置完整参考

执行配置 `config` 集中配置了请求层的所有控制点，在不同入口有不同的名字：

- 模块函数 / `invokeModule()` 的第二个参数：`ModuleCallConfig`
- `createHanaMusicApi(config)` 的参数：`CreateHanaMusicApiConfig`（在 `ModuleCallConfig` 基础上多了 `cache` 和 `identityPool`）
- `createRequest(uri, data, options)` 的第三个参数：`CreateRequestOptions`（与 `ModuleCallConfig` 同构）

## 字段总表

| 字段 | 类型 | 默认值 | 作用 | 适用加密模式 |
| --- | --- | --- | --- | --- |
| `cookie` | `string \| CookieRecord` | `{}` | 登录态与身份。允许字符串和对象，请求层会自动补全设备号等字段。 | 全部 |
| `crypto` | `'' \| 'api' \| 'eapi' \| 'weapi' \| 'linuxapi'` | `eapi`（`encrypt` 关时为 `api`） | 选择上游通道与加解密方式。 | — |
| `ip` | `string` | 运行时 `cnIp` | 伪装来源 IP，写入 `X-Forwarded-For` / `X-Real-IP`。 | 全部 |
| `realIP` | `string` | 无 | 同 `ip`，但**优先级更高**。两者都传时 `realIP` 生效。 | 全部 |
| `proxy` | `string` | 无 | HTTP 代理地址。**不支持 PAC**。 | 全部 |
| `ua` | `string` | 按加密模式选默认 UA | 覆盖 `User-Agent`。 | 全部 |
| `domain` | `string` | `APP_CONF` 默认域名 | 覆盖上游域名，用于自建反代等场景。 | 全部 |
| `headers` | `Record<string, string>` | `{}` | 追加自定义请求头，会与内部生成的头合并。 | 全部 |
| `fetcher` | `FetchLike` | 全局 `fetch` | 替换底层 HTTP 实现，用于注入代理 agent、拦截、测试桩。 | 全部 |
| `timeoutMs` | `number` | `8000` | 单次尝试的超时（毫秒）。传 `0` 或负数关闭超时。 | 全部 |
| `retry` | `RequestRetryOptions` | 见重试文档 | 重试策略：次数、退避、抖动、状态码白名单等。 | 全部 |
| `connectionStrategy` | `'default' \| 'close' \| 'fresh-on-retry'` | `'default'` | 控制连接复用，应对长连接被上游悄悄断开的情况。 | 全部 |
| `e_r` | `boolean \| number \| string` | `false` | 是否要求上游返回加密响应。 | `eapi` / `weapi` |
| `acceptGzip` | `boolean` | `false` | 声明可接受 gzip 压缩的加密响应，省带宽。 | `eapi` |
| `checkToken` | `boolean \| number \| string` | `false` | 在 eapi header 注入反作弊 token。 | `eapi` / `api` |
| `onRequestEvent` | `(event: RequestDebugEvent) => void` | 无 | 每次尝试 / 重试 / 失败的观测回调。 | 全部 |
| `state` | `Partial<RuntimeState>` | 进程运行时状态 | 按本次调用覆盖匿名 token / 伪装 IP / 设备号。 | 全部 |

## 仅 `createHanaMusicApi` 支持的字段

| 字段 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `cache` | `{ enabled?: boolean; ttlMs?: number }` | 关闭 | 开启内存响应缓存 + 并发去重（single-flight）。 |
| `identityPool` | `{ size: number }` | 关闭 | 预注册多个匿名身份并按调用轮换。 |

详见 [SDK 缓存与身份池](/guide/sdk-cache-and-identity-pool)。

## 各字段的深入说明

- `crypto` / `e_r` / `acceptGzip` → [加密模式](/guide/crypto-modes)
- `fetcher` / `proxy` → [自定义 fetcher](/guide/custom-fetcher)
- `timeoutMs` / `retry` / `connectionStrategy` → [重试、超时与连接策略](/guide/retry-timeout-resilience)
- `onRequestEvent` → [调试与可观测性](/guide/observability)
- `cookie` / `ip` / `realIP` / `state` → [运行时状态与身份伪装](/guide/runtime-identity)
